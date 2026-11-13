from flask import Flask, request, jsonify, session as _flask_session
from urllib.parse import urlparse
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from functools import wraps
from database import get_db, init_db
import os
import sqlite3
import re

app = Flask(__name__)

# ---------- SEPARATE ADMIN / CUSTOMER LOGINS ----------
# A browser has one cookie jar, so signing in as admin in one tab used to replace the
# customer signed in in another tab. Each portal now gets its own slot in the session.
def current_portal():
    explicit = (request.headers.get("X-Portal") or "").lower()
    if explicit in ("admin", "store"):
        return explicit
    referer = request.headers.get("Referer", "")
    if referer:
        path = urlparse(referer).path or "/"
        return "store" if (path == "/" or path.startswith("/store")) else "admin"
    return "store"

class PortalSession:
    def _all(self):
        data = _flask_session.get("portals")
        return dict(data) if isinstance(data, dict) else {}

    def _mine(self):
        return dict(self._all().get(current_portal()) or {})

    def get(self, key, default=None):
        return self._mine().get(key, default)

    def __getitem__(self, key):
        return self._mine()[key]

    def __contains__(self, key):
        return key in self._mine()

    def __setitem__(self, key, value):
        portals = self._all()
        mine = dict(portals.get(current_portal()) or {})
        mine[key] = value
        portals[current_portal()] = mine
        _flask_session["portals"] = portals

    def clear(self):
        portals = self._all()
        portals.pop(current_portal(), None)
        _flask_session["portals"] = portals

    @property
    def modified(self):
        return _flask_session.modified

    @modified.setter
    def modified(self, value):
        _flask_session.modified = value

session = PortalSession()
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-in-prod")

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
)

CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.8.199:5173"])

DEMO_OTP = "123456"

# ---------- DATABASE SEEDER FOR ADMIN ----------
def seed_admin_accounts():
    try:
        conn = get_db()
        hashed = generate_password_hash("admin123")
        
        adm = conn.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()
        if not adm:
            conn.execute("INSERT INTO users (username, email, password_hash, role) VALUES ('admin', 'admin@athaliah.com', ?, 'admin')", (hashed,))
        
        adm1 = conn.execute("SELECT id FROM users WHERE username = 'admin1'").fetchone()
        if not adm1:
            conn.execute("INSERT INTO users (username, email, password_hash, role) VALUES ('admin1', 'admin1@athaliah.com', ?, 'admin')", (hashed,))
            
        conn.commit()
        conn.close()
    except Exception as e:
        print("Admin seeding note:", e)

# ---------- HELPERS ----------
def clean_category_id(value):
    if value in ("", None, "null"):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

# ---------- AUTH ----------
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return wrapper

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Authentication required"}), 401
        if session.get("role") != "admin" or not session.get("mfa_verified"):
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return wrapper

def customer_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Please sign in first.", "message": "Please sign in first."}), 401
        if session.get("role") != "customer":
            return jsonify({"error": "Please sign in with a customer account.",
                            "message": "Please sign in with a customer account."}), 403
        return f(*args, **kwargs)
    return wrapper

def stock_status(stock, safety):
    if stock <= 0:
        return "Out of Stock"
    if stock <= safety:
        return "Low Stock"
    return "In Stock"

def get_customer_for_user(conn, user_id, create=True):
    """Find (or create) the customers row that belongs to a login account."""
    cust = conn.execute("SELECT * FROM customers WHERE user_id = ?", (user_id,)).fetchone()
    if cust:
        return cust
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        return None
    cust = conn.execute(
        "SELECT * FROM customers WHERE LOWER(email) = LOWER(?) AND user_id IS NULL", (user["email"],)
    ).fetchone()
    if cust:
        conn.execute("UPDATE customers SET user_id = ? WHERE id = ?", (user_id, cust["id"]))
        return conn.execute("SELECT * FROM customers WHERE id = ?", (cust["id"],)).fetchone()
    if not create:
        return None
    cur = conn.execute("INSERT INTO customers (full_name, email, user_id) VALUES (?, ?, ?)",
                       (user["username"], user["email"], user_id))
    return conn.execute("SELECT * FROM customers WHERE id = ?", (cur.lastrowid,)).fetchone()

def sync_primary_address(conn, customer_id):
    row = conn.execute("SELECT address FROM customer_addresses WHERE customer_id = ? ORDER BY id DESC LIMIT 1",
                       (customer_id,)).fetchone()
    conn.execute("UPDATE customers SET address = ? WHERE id = ?", (row["address"] if row else "", customer_id))

def restock_order(conn, order_id):
    items = conn.execute("SELECT product_id, quantity FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
    for it in items:
        if it["product_id"]:
            conn.execute("""UPDATE products SET stock = stock + ?,
                            status = CASE WHEN status = 'Out of Stock' THEN 'Active' ELSE status END
                            WHERE id = ?""", (it["quantity"], it["product_id"]))

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    username = (data.get('username') or "").strip()
    name = (data.get('name') or "").strip()
    surname = (data.get('surname') or "").strip()
    email = (data.get('email') or "").strip()
    phone = (data.get('phone') or "").strip()
    password = data.get('password')

    if not username or not email or not password or not name or not surname:
        return jsonify({"message": "All fields are required"}), 400

    conn = get_db()
    existing_user = conn.execute('SELECT * FROM users WHERE username = ? OR email = ?', (username, email)).fetchone()
    if existing_user:
        conn.close()
        return jsonify({"success": False, "message": "Username or email already registered"}), 409

    hashed_password = generate_password_hash(password)
    try:
        cur = conn.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            (username, email, hashed_password, 'customer')
        )
        user_id = cur.lastrowid
        full_name = f"{name} {surname}"
        existing_cust = conn.execute(
            "SELECT id FROM customers WHERE LOWER(email) = LOWER(?) AND user_id IS NULL", (email,)
        ).fetchone()
        if existing_cust:
            conn.execute(
                "UPDATE customers SET user_id = ?, first_name = ?, last_name = ?, full_name = ?, phone = ? WHERE id = ?",
                (user_id, name, surname, full_name, phone, existing_cust["id"])
            )
        else:
            conn.execute(
                "INSERT INTO customers (first_name, last_name, full_name, email, phone, address, user_id) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (name, surname, full_name, email, phone, "", user_id)
            )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Account created successfully!"}), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json(silent=True) or {}
        
        identifier = (data.get('username') or data.get('email') or "").strip()
        password = data.get('password') or ""
        
        if not identifier or not password:
            return jsonify({"success": False, "message": "Username/email and password are required"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM users 
            WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
        ''', (identifier, identifier))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"success": False, "message": f"User '{identifier}' not found."}), 401
        
        try:
            user_id = user['id']
            username = user['username']
            email = user['email'] if 'email' in user.keys() else ''
            pwd_hash = user['password_hash']
            role = user['role'] if 'role' in user.keys() else 'customer'
        except Exception:
            user_id = user[0]
            username = user[1]
            email = user[2] if len(user) > 2 else ''
            pwd_hash = user[3] if len(user) > 3 else user[2]
            role = user[4] if len(user) > 4 else 'customer'
        
        if pwd_hash and check_password_hash(pwd_hash, password):
            portal = current_portal()
            if portal == "admin" and role != "admin":
                return jsonify({"success": False, "message": "This account does not have admin access."}), 403
            if portal == "store" and role == "admin":
                return jsonify({"success": False, "message": "This is an admin account. Please use Admin Access to sign in."}), 403
            session.clear()
            session["user_id"] = user_id
            session["username"] = username
            session["role"] = role
            session.modified = True
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email,
                    "role": role
                }
            }), 200
        
        return jsonify({"success": False, "message": "Invalid password."}), 401
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/store-login', methods=['POST'])
def store_login():
    try:
        data = request.get_json(silent=True) or {}
        username = (data.get('username') or "").strip()
        biometric_verified = data.get('biometric_verified')

        if not username:
            return jsonify({"success": False, "message": "Username is required."}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', (username,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({"success": False, "message": f"User '{username}' not found."}), 404

        try:
            user_id = user['id']
            uname = user['username']
            email = user['email'] if 'email' in user.keys() else ''
            role = user['role'] if 'role' in user.keys() else 'customer'
        except Exception:
            user_id = user[0]
            uname = user[1]
            email = user[2] if len(user) > 2 else ''
            role = user[4] if len(user) > 4 else 'customer'

        if role == "admin":
            return jsonify({"success": False, "message": "Admin accounts cannot use store biometric login."}), 403

        session.clear()
        session["user_id"] = user_id
        session["username"] = uname
        session["role"] = role
        session.modified = True

        return jsonify({
            "success": True,
            "message": "Biometric login successful",
            "user": {
                "id": user_id,
                "username": uname,
                "email": email,
                "role": role
            }
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    
@app.route('/api/biometric/status', methods=['POST'])
def update_biometric_status():
    data = request.get_json() or {}
    username = data.get('username')
    enabled = int(data.get('enabled', 0))
    
    conn = get_db()
    conn.execute('UPDATE users SET biometric_enabled = ? WHERE username = ? OR email = ?', (enabled, username, username))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Biometric status updated successfully."})

@app.route("/api/current_user", methods=["GET"])
def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    customer = conn.execute(
        'SELECT first_name, full_name FROM customers WHERE user_id = ? OR LOWER(email) = LOWER(?)',
        (user_id, user['email'])
    ).fetchone()
    conn.close()

    first_name = user['username']
    if customer:
        first_name = customer['first_name'] or (customer['full_name'] or '').split(' ')[0] or user['username']

    return jsonify({
        "id": user['id'],
        "username": user['username'],
        "email": user['email'],
        "first_name": first_name,
        "role": user['role'],
        "biometric_enabled": bool(user['biometric_enabled'])
    })

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully."})

@app.route("/api/me", methods=["GET"])
def me():
    if session.get("user_id"):
        return jsonify({"authenticated": True, "username": session.get("username"), "role": session.get("role"), "mfa_verified": bool(session.get("mfa_verified"))})
    return jsonify({"authenticated": False}), 401

@app.route("/api/mfa", methods=["POST"])
def verify_mfa():
    # Step 2 of admin sign-in: requires a logged-in admin session first
    if not session.get("user_id"):
        return jsonify({"error": "Please sign in first."}), 401
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access only."}), 403
    data = request.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip()
    if code != DEMO_OTP:
        return jsonify({"error": "Incorrect verification code."}), 401
    session["mfa_verified"] = True
    session.modified = True
    return jsonify({"success": True, "message": "Verified"})

# ---------- USER PREFERENCES ----------
@app.route("/api/preferences", methods=["GET"])
@login_required
def get_preferences():
    conn = get_db()
    user_id = session["user_id"]
    preferences = conn.execute("""
        SELECT background_color, accent_color
        FROM user_preferences
        WHERE user_id = ?
    """, (user_id,)).fetchone()

    if preferences:
        result = dict(preferences)
    else:
        result = {
            "background_color": "#0f172a",
            "accent_color": "#6366f1"
        }
    conn.close()
    return jsonify(result)

@app.route("/api/preferences", methods=["PUT"])
@login_required
def update_preferences():
    data = request.get_json() or {}
    background_color = (data.get("background_color") or "").strip()
    accent_color = (data.get("accent_color") or "").strip()
    hex_pattern = r"^#[0-9A-Fa-f]{6}$"

    if not re.fullmatch(hex_pattern, background_color):
        return jsonify({"error": "Invalid background color."}), 400
    if not re.fullmatch(hex_pattern, accent_color):
        return jsonify({"error": "Invalid accent color."}), 400

    conn = get_db()
    user_id = session["user_id"]
    conn.execute("""
        INSERT INTO user_preferences
            (user_id, background_color, accent_color)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id)
        DO UPDATE SET
            background_color = excluded.background_color,
            accent_color = excluded.accent_color
    """, (user_id, background_color, accent_color))
    conn.commit()
    conn.close()
    return jsonify({
        "message": "Preferences saved successfully.",
        "background_color": background_color,
        "accent_color": accent_color
    })

# ---------- DASHBOARD ----------
@app.route("/api/dashboard", methods=["GET"])
@admin_required
def dashboard():
    conn = get_db()
    total_products = conn.execute("SELECT COUNT(*) c FROM products").fetchone()["c"]
    total_orders = conn.execute("SELECT COUNT(*) c FROM orders").fetchone()["c"]
    pending_orders = conn.execute("SELECT COUNT(*) c FROM orders WHERE order_status = 'Pending'").fetchone()["c"]

    low_stock_variants = conn.execute("""
        SELECT pv.id, p.name AS product_name, pv.variant_name, pv.sku,
               pv.stock, p.safety_stock, p.image_alt
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.stock > 0 AND pv.stock <= p.safety_stock
    """).fetchall()
    
    low_stock_products = conn.execute("""
        SELECT id, name AS product_name, '' AS variant_name, sku,
               stock, safety_stock, image_alt
        FROM products
        WHERE stock > 0 AND stock <= safety_stock
          AND id NOT IN (SELECT DISTINCT product_id FROM product_variants)
    """).fetchall()

    low_stock = [dict(r) for r in low_stock_variants] + [dict(r) for r in low_stock_products]

    recent_orders = conn.execute("""
        SELECT o.id, o.order_number, 
               COALESCE(c.full_name, 'Unlinked Account') AS customer, 
               o.total, o.order_status, o.payment_status
        FROM orders o 
        LEFT JOIN customers c ON c.id = o.customer_id
        ORDER BY o.id DESC LIMIT 5
    """).fetchall()

    conn.close()
    return jsonify({
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "low_stock_count": len(low_stock),
        "low_stock": low_stock,
        "recent_orders": [dict(r) for r in recent_orders],
    })

# ---------- PRODUCTS ----------
@app.route("/api/products", methods=["GET"])
def list_products():
    q = (request.args.get("q") or "").strip()
    conn = get_db()
    sql = """
        SELECT p.*, c.name AS category_name,
               (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS variant_count
        FROM products p LEFT JOIN categories c ON c.id = p.category_id
    """
    params = ()
    if q:
        sql += " WHERE p.name LIKE ? OR p.sku LIKE ?"
        params = (f"%{q}%", f"%{q}%")
    sql += " ORDER BY p.id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    products = []
    for r in rows:
        d = dict(r)
        d["stock_status"] = stock_status(d["stock"], d["safety_stock"])
        d["in_stock"] = d["stock"] > 0
        products.append(d)
    return jsonify(products)

@app.route("/api/products/<int:pid>", methods=["GET"])
def get_product(pid):
    conn = get_db()
    p = conn.execute("""
        SELECT p.*, c.name AS category_name FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
    """, (pid,)).fetchone()
    if not p:
        conn.close()
        return jsonify({"error": "Product not found."}), 404
    variants = conn.execute(
        "SELECT * FROM product_variants WHERE product_id = ? ORDER BY id", (pid,)
    ).fetchall()
    conn.close()
    data = dict(p)
    data["stock_status"] = stock_status(data["stock"], data["safety_stock"])
    data["in_stock"] = data["stock"] > 0
    data["variants"] = [dict(v) for v in variants]
    return jsonify(data)

def validate_product(data, conn, exclude_id=None):
    errors = {}
    name = (data.get("name") or "").strip()
    sku = (data.get("sku") or "").strip()
    price = data.get("price")
    stock = data.get("stock", 0)
    safety = data.get("safety_stock", 5)

    if not name:
        errors["name"] = "Product name is required."
    if not sku:
        errors["sku"] = "SKU is required."
    else:
        q = "SELECT id FROM products WHERE sku = ?"
        params = [sku]
        if exclude_id:
            q += " AND id != ?"
            params.append(exclude_id)
        if conn.execute(q, params).fetchone():
            errors["sku"] = "SKU must be unique."

    try:
        price = float(price)
        if price <= 0:
            errors["price"] = "Price must be positive."
    except (TypeError, ValueError):
        errors["price"] = "Invalid price."

    try:
        stock = int(stock)
    except (TypeError, ValueError):
        stock = 0

    try:
        safety = int(safety)
    except (TypeError, ValueError):
        safety = 5

    return errors, {"name": name, "sku": sku, "price": price, "stock": stock, "safety_stock": safety}

@app.route("/api/products", methods=["POST"])
@admin_required
def create_product():
    data = request.get_json() or {}
    conn = get_db()
    errors, clean = validate_product(data, conn)
    if errors:
        conn.close()
        return jsonify({"errors": errors}), 400

    status = data.get("status") or ("Out of Stock" if clean["stock"] == 0 else "Active")
    category_id = clean_category_id(data.get("category_id"))

    cur = conn.execute("""
        INSERT INTO products (name, sku, description, price, stock, safety_stock,
                            category_id, image_url, image_alt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        clean["name"], clean["sku"], data.get("description", ""),
        clean["price"], clean["stock"], clean["safety_stock"],
        category_id, data.get("image_url", ""),
        data.get("image_alt", ""), status
    ))
    pid = cur.lastrowid
    conn.commit()
    conn.close()
    return jsonify({"message": "Product created.", "id": pid}), 201

@app.route("/api/products/<int:pid>", methods=["PUT"])
@admin_required
def update_product(pid):
    data = request.get_json() or {}
    conn = get_db()
    existing = conn.execute("SELECT * FROM products WHERE id = ?", (pid,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Product not found."}), 404

    errors, clean = validate_product(data, conn, exclude_id=pid)
    if errors:
        conn.close()
        return jsonify({"errors": errors}), 400

    status = data.get("status") or ("Out of Stock" if clean["stock"] == 0 else "Active")
    category_id = clean_category_id(data.get("category_id"))

    conn.execute("""
        UPDATE products SET name=?, sku=?, description=?, price=?, stock=?,
                          safety_stock=?, category_id=?, image_url=?,
                          image_alt=?, status=?
        WHERE id=?
    """, (
        clean["name"], clean["sku"], data.get("description", ""),
        clean["price"], clean["stock"], clean["safety_stock"],
        category_id, data.get("image_url", ""),
        data.get("image_alt", ""), status, pid
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "Product updated."})

@app.route("/api/products/<int:pid>", methods=["DELETE"])
@admin_required
def delete_product(pid):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Product deleted."})

# ---------- INVENTORY ----------
@app.route("/api/inventory", methods=["GET"])
@admin_required
def inventory():
    conn = get_db()
    rows = conn.execute("""
        SELECT p.id, p.name AS product, p.sku AS sku, '' AS variant,
               p.stock AS current_stock, p.safety_stock AS safety_stock,
               p.image_alt, 'product' AS kind
        FROM products p
        ORDER BY product
    """).fetchall()
    conn.close()

    items = []
    for r in rows:
        d = dict(r)
        d["status"] = stock_status(d["current_stock"], d["safety_stock"]).upper()
        items.append(d)
    return jsonify(items)

@app.route("/api/inventory/<int:vid>", methods=["PUT"])
@admin_required
def update_inventory(vid):
    data = request.get_json(silent=True) or {}
    conn = get_db()
    product = conn.execute("SELECT stock FROM products WHERE id = ?", (vid,)).fetchone()
    if not product:
        conn.close()
        return jsonify({"error": "Product not found."}), 404
    try:
        if data.get("add") is not None:
            new_stock = product["stock"] + int(data["add"])      # add stock on top of current
        else:
            new_stock = int(data.get("stock"))                    # set an exact total
    except (TypeError, ValueError):
        conn.close()
        return jsonify({"error": "Stock must be a whole number."}), 400
    if new_stock < 0:
        conn.close()
        return jsonify({"error": "Stock cannot be negative."}), 400

    conn.execute("""
        UPDATE products SET stock = ?,
            status = CASE WHEN ? <= 0 THEN 'Out of Stock'
                          WHEN status = 'Out of Stock' THEN 'Active'
                          ELSE status END
        WHERE id = ?
    """, (new_stock, new_stock, vid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Stock updated.", "stock": new_stock})

# ---------- ORDERS ----------
ORDER_STATUSES = {"Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"}

@app.route("/api/orders", methods=["POST"])
@customer_required
def create_order():
    data = request.get_json(silent=True) or {}
    items = data.get("items") or []
    shipping_address = (data.get("shipping_address") or "").strip()
    contact_phone = (data.get("contact_phone") or "").strip()
    payment_method = data.get("payment_method") if data.get("payment_method") in ("COD", "GCash", "Maya") else "COD"
    payment_reference = (data.get("payment_reference") or "").strip()

    if not items:
        return jsonify({"success": False, "message": "Your cart is empty."}), 400
    if not shipping_address:
        return jsonify({"success": False, "message": "Please add a shipping address."}), 400
    if not contact_phone:
        return jsonify({"success": False, "message": "Please add a contact phone number."}), 400
    if payment_method != "COD" and not payment_reference:
        return jsonify({"success": False, "message": f"Enter your {payment_method} reference number."}), 400

    conn = get_db()
    try:
        customer = get_customer_for_user(conn, session["user_id"])

        # Look up every product on the server: real price, real stock
        wanted = {}
        for it in items:
            try:
                qty = int(it.get("quantity", 1))
            except (TypeError, ValueError):
                qty = 0
            if qty < 1:
                conn.close()
                return jsonify({"success": False, "message": "Invalid quantity."}), 400

            product = None
            try:
                if it.get("product_id") is not None:
                    product = conn.execute("SELECT * FROM products WHERE id = ?", (int(it["product_id"]),)).fetchone()
            except (TypeError, ValueError):
                product = None
            if not product and (it.get("product_name") or it.get("name")):
                product = conn.execute("SELECT * FROM products WHERE name = ?",
                                       (it.get("product_name") or it.get("name"),)).fetchone()
            if not product:
                conn.close()
                return jsonify({"success": False, "message": "One of the items is no longer available."}), 400

            entry = wanted.setdefault(product["id"], {"product": product, "qty": 0})
            entry["qty"] += qty

        total = 0.0
        for entry in wanted.values():
            p, qty = entry["product"], entry["qty"]
            if p["status"] == "Inactive":
                conn.close()
                return jsonify({"success": False, "message": f"{p['name']} is not available."}), 409
            if p["stock"] <= 0:
                conn.close()
                return jsonify({"success": False, "message": f"{p['name']} is out of stock."}), 409
            if p["stock"] < qty:
                conn.close()
                return jsonify({"success": False, "message": f"Only {p['stock']} left of {p['name']}."}), 409
            total += float(p["price"]) * qty

        order_id = None
        order_number = None
        for _ in range(5):
            order_number = f"ATH-{os.urandom(3).hex().upper()}"
            try:
                cur = conn.execute("""
                    INSERT INTO orders (order_number, customer_id, total, payment_status, order_status, order_date,
                                        payment_method, payment_reference, shipping_address, contact_phone)
                    VALUES (?, ?, ?, ?, 'Pending', datetime('now'), ?, ?, ?, ?)
                """, (order_number, customer["id"], total,
                      "Pay on Delivery" if payment_method == "COD" else "Awaiting Verification",
                      payment_method, payment_reference or "N/A", shipping_address, contact_phone))
                order_id = cur.lastrowid
                break
            except sqlite3.IntegrityError:
                continue
        if order_id is None:
            conn.rollback()
            conn.close()
            return jsonify({"success": False, "message": "Could not create the order. Please try again."}), 500

        for entry in wanted.values():
            p, qty = entry["product"], entry["qty"]
            conn.execute("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
                         (order_id, p["id"], p["name"], qty, p["price"]))
            conn.execute("""UPDATE products SET stock = stock - ?,
                            status = CASE WHEN stock - ? <= 0 THEN 'Out of Stock' ELSE status END
                            WHERE id = ?""", (qty, qty, p["id"]))

        # remember the address / phone on the customer profile
        exists = conn.execute("SELECT id FROM customer_addresses WHERE customer_id = ? AND address = ?",
                              (customer["id"], shipping_address)).fetchone()
        if not exists:
            conn.execute("INSERT INTO customer_addresses (customer_id, address) VALUES (?, ?)", (customer["id"], shipping_address))
            sync_primary_address(conn, customer["id"])
        if not (customer["phone"] or "").strip():
            conn.execute("UPDATE customers SET phone = ? WHERE id = ?", (contact_phone, customer["id"]))

        conn.commit()
        conn.close()
        return jsonify({"message": "Order created successfully", "status": "success", "success": True,
                        "order_id": order_id, "order_number": order_number, "total": total}), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/orders", methods=["GET"])
@admin_required
def list_orders():
    conn = get_db()
    rows = conn.execute("""
        SELECT o.id, o.order_number,
               COALESCE(c.full_name, 'Unlinked Account') AS customer,
               c.email AS customer_email, c.phone AS customer_phone,
               COALESCE(u.biometric_enabled, 0) AS biometric_enabled,
               o.order_date, o.total,
               COALESCE(o.payment_method, 'COD') AS payment_method,
               COALESCE(o.payment_status, 'Pending') AS payment_status,
               COALESCE(o.order_status, 'Pending') AS order_status,
               o.tracking_number, o.shipping_address,
               (SELECT GROUP_CONCAT(oi.product_name || ' x' || oi.quantity, ', ')
                  FROM order_items oi WHERE oi.order_id = o.id) AS items_summary
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        LEFT JOIN users u ON u.id = c.user_id
        ORDER BY o.id DESC
    """).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["biometric_enabled"] = bool(d["biometric_enabled"])
        result.append(d)
    return jsonify(result)

@app.route("/api/orders/<int:oid>", methods=["GET"])
@admin_required
def get_order(oid):
    conn = get_db()
    row = conn.execute("""
        SELECT o.*, COALESCE(c.full_name, 'Unlinked Account') AS customer,
               c.email AS customer_email, c.phone AS customer_phone,
               COALESCE(u.biometric_enabled, 0) AS biometric_enabled
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        LEFT JOIN users u ON u.id = c.user_id
        WHERE o.id = ?
    """, (oid,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Order not found."}), 404
    items = conn.execute("""
        SELECT oi.id, oi.product_id, oi.product_name, oi.quantity, oi.price,
               oi.quantity * oi.price AS subtotal, p.image_url
        FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
    """, (oid,)).fetchall()
    conn.close()
    data = dict(row)
    data["biometric_enabled"] = bool(data["biometric_enabled"])
    data["items"] = [dict(i) for i in items]
    return jsonify(data)

@app.route("/api/orders/<int:oid>/status", methods=["PUT"])
@admin_required
def update_order_status(oid):
    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip()
    if new_status not in ORDER_STATUSES:
        return jsonify({"error": "Invalid status."}), 400
    conn = get_db()
    order = conn.execute("SELECT order_status, payment_status FROM orders WHERE id = ?", (oid,)).fetchone()
    if not order:
        conn.close()
        return jsonify({"error": "Order not found."}), 404
    old_status = order["order_status"]
    if old_status == "Cancelled" and new_status != "Cancelled":
        conn.close()
        return jsonify({"error": "A cancelled order cannot be reopened."}), 400
    if new_status == "Cancelled" and old_status != "Cancelled":
        restock_order(conn, oid)
    payment_status = order["payment_status"]
    if new_status == "Delivered" and payment_status == "Pay on Delivery":
        payment_status = "Paid"
    conn.execute("UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?", (new_status, payment_status, oid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Order status updated.", "order_status": new_status})

# ---------- STOREFRONT: MY ORDERS ----------
def _orders_for_customer(conn, customer_id):
    orders = conn.execute("""
        SELECT id, order_number, order_date, total, order_status, payment_method, payment_status,
               shipping_address, contact_phone, tracking_number
        FROM orders WHERE customer_id = ? ORDER BY id DESC
    """, (customer_id,)).fetchall()
    result = []
    for o in orders:
        d = dict(o)
        items = conn.execute("""
            SELECT oi.product_id, oi.product_name, oi.quantity, oi.price, p.image_url
            FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        """, (o["id"],)).fetchall()
        d["items"] = [dict(i) for i in items]
        d["product_name"] = d["items"][0]["product_name"] if d["items"] else "Athaliah Collection Item"
        d["image_url"] = d["items"][0]["image_url"] if d["items"] else None
        result.append(d)
    return result

@app.route("/api/store/orders", methods=["GET"])
@customer_required
def store_orders():
    conn = get_db()
    customer = get_customer_for_user(conn, session["user_id"], create=False)
    result = _orders_for_customer(conn, customer["id"]) if customer else []
    conn.commit()
    conn.close()
    return jsonify(result)

@app.route("/api/store/orders/<int:oid>/cancel", methods=["POST"])
@customer_required
def cancel_store_order(oid):
    conn = get_db()
    customer = get_customer_for_user(conn, session["user_id"], create=False)
    order = conn.execute("SELECT id, order_status FROM orders WHERE id = ? AND customer_id = ?",
                         (oid, customer["id"] if customer else -1)).fetchone()
    if not order:
        conn.close()
        return jsonify({"error": "Order not found."}), 404
    if order["order_status"] != "Pending":
        conn.close()
        return jsonify({"error": "Only pending orders can be cancelled."}), 400
    restock_order(conn, oid)
    conn.execute("UPDATE orders SET order_status = 'Cancelled' WHERE id = ?", (oid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Order cancelled."})

# ---------- STOREFRONT: PROFILE & ADDRESSES ----------
def _profile_payload(conn, user_id):
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    cust = get_customer_for_user(conn, user_id)
    addresses = conn.execute("SELECT id, address FROM customer_addresses WHERE customer_id = ? ORDER BY id",
                             (cust["id"],)).fetchall()
    first_name = cust["first_name"] or (cust["full_name"] or "").split(" ")[0] or user["username"]
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "first_name": first_name,
        "last_name": cust["last_name"] or "",
        "full_name": cust["full_name"] or user["username"],
        "phone": cust["phone"] or "",
        "member_since": (user["created_at"] or "")[:4],
        "biometric_enabled": bool(user["biometric_enabled"]),
        "addresses": [dict(a) for a in addresses],
    }

@app.route("/api/profile", methods=["GET"])
@customer_required
def get_profile():
    conn = get_db()
    payload = _profile_payload(conn, session["user_id"])
    conn.commit()
    conn.close()
    return jsonify(payload)

@app.route("/api/profile", methods=["PUT"])
@customer_required
def update_profile():
    data = request.get_json(silent=True) or {}
    conn = get_db()
    cust = get_customer_for_user(conn, session["user_id"])
    if "phone" in data:
        conn.execute("UPDATE customers SET phone = ? WHERE id = ?", ((data.get("phone") or "").strip(), cust["id"]))
    conn.commit()
    payload = _profile_payload(conn, session["user_id"])
    conn.close()
    return jsonify(payload)

@app.route("/api/profile/addresses", methods=["POST"])
@customer_required
def add_address():
    data = request.get_json(silent=True) or {}
    address = (data.get("address") or "").strip()
    if len(address) < 5:
        return jsonify({"error": "Please enter a complete address."}), 400
    conn = get_db()
    cust = get_customer_for_user(conn, session["user_id"])
    if not conn.execute("SELECT id FROM customer_addresses WHERE customer_id = ? AND address = ?",
                        (cust["id"], address)).fetchone():
        conn.execute("INSERT INTO customer_addresses (customer_id, address) VALUES (?, ?)", (cust["id"], address))
        sync_primary_address(conn, cust["id"])
    conn.commit()
    payload = _profile_payload(conn, session["user_id"])
    conn.close()
    return jsonify(payload), 201

@app.route("/api/profile/addresses/<int:aid>", methods=["DELETE"])
@customer_required
def delete_address(aid):
    conn = get_db()
    cust = get_customer_for_user(conn, session["user_id"])
    conn.execute("DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?", (aid, cust["id"]))
    sync_primary_address(conn, cust["id"])
    conn.commit()
    payload = _profile_payload(conn, session["user_id"])
    conn.close()
    return jsonify(payload)

# ---------- CUSTOMERS (ADMIN) ----------
@app.route("/api/customers", methods=["GET"])
@admin_required
def list_customers():
    conn = get_db()
    rows = conn.execute("""
        SELECT c.*, u.username, COALESCE(u.biometric_enabled, 0) AS biometric_enabled,
               (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
        FROM customers c
        LEFT JOIN users u ON u.id = c.user_id
        ORDER BY c.id DESC
    """).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["biometric_enabled"] = bool(d["biometric_enabled"])
        result.append(d)
    return jsonify(result)

@app.route("/api/customers", methods=["POST"])
@admin_required
def create_customer():
    data = request.get_json(silent=True) or {}
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip()
    errors = {}
    conn = get_db()
    if not full_name:
        errors["full_name"] = "Full name is required."
    if email and conn.execute("SELECT id FROM customers WHERE LOWER(email) = LOWER(?)", (email,)).fetchone():
        errors["email"] = "A customer with this email already exists."
    if errors:
        conn.close()
        return jsonify({"errors": errors}), 400

    parts = full_name.split(" ", 1)
    address = (data.get("address") or "").strip()
    cur = conn.execute("""
        INSERT INTO customers (first_name, last_name, full_name, preferred_name, title, gender, email, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (parts[0], parts[1] if len(parts) > 1 else "", full_name,
          (data.get("preferred_name") or "").strip(), data.get("title", ""), data.get("gender", ""),
          email, (data.get("phone") or "").strip(), address))
    if address:
        conn.execute("INSERT INTO customer_addresses (customer_id, address) VALUES (?, ?)", (cur.lastrowid, address))
    conn.commit()
    conn.close()
    return jsonify({"message": "Customer created.", "id": cur.lastrowid}), 201

@app.route("/api/categories", methods=["GET"])
def list_categories():
    conn = get_db()
    rows = conn.execute("""
        SELECT c.*, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/categories", methods=["POST"])
@admin_required
def create_category():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"errors": {"name": "Category name is required."}}), 400
    conn = get_db()
    cur = conn.execute("INSERT INTO categories (name, description) VALUES (?, ?)", (name, data.get("description", "")))
    conn.commit()
    cid = cur.lastrowid
    conn.close()
    return jsonify({"message": "Category created.", "id": cid}), 201

if __name__ == '__main__':
    init_db()
    seed_admin_accounts()
    app.run(host='0.0.0.0', port=5000, debug=True)