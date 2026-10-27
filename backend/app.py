from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import check_password_hash
from functools import wraps
from database import get_db, init_db
import os
import sqlite3
import re

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-in-prod")
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)

CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

DEMO_OTP = "123456"

# ---------- HELPERS ----------
def clean_category_id(value):
    """Convert '', None, 'null' to None; otherwise coerce to int."""
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

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        (username, username)
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials."}), 401

    session["pending_user_id"] = user["id"]
    session["pending_username"] = user["username"]
    return jsonify({"message": "Credentials verified. Enter MFA code.",
                    "mfa_required": True})

@app.route("/api/mfa", methods=["POST"])
def mfa():
    data = request.get_json() or {}
    code = (data.get("code") or "").strip()
    pending = session.get("pending_user_id")
    if not pending:
        return jsonify({"error": "No login in progress."}), 400
    if code != DEMO_OTP:
        return jsonify({"error": "Invalid verification code."}), 401

    session["user_id"] = pending
    session["username"] = session.pop("pending_username")
    session.pop("pending_user_id", None)
    return jsonify({"message": "MFA verified.", "username": session["username"]})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out."})

@app.route("/api/me", methods=["GET"])
def me():
    if session.get("user_id"):
        return jsonify({"authenticated": True, "username": session.get("username")})
    return jsonify({"authenticated": False}), 401

    
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
            "background_color": "#f7f5f0",
            "accent_color": "#a18b69"
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
        return jsonify({
            "error": "Invalid background color."
        }), 400

    if not re.fullmatch(hex_pattern, accent_color):
        return jsonify({
            "error": "Invalid accent color."
        }), 400

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
@login_required
def dashboard():
    conn = get_db()
    total_products = conn.execute("SELECT COUNT(*) c FROM products").fetchone()["c"]
    total_orders = conn.execute("SELECT COUNT(*) c FROM orders").fetchone()["c"]
    pending_orders = conn.execute(
        "SELECT COUNT(*) c FROM orders WHERE order_status = 'Pending'"
    ).fetchone()["c"]

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
        SELECT o.id, o.order_number, c.full_name AS customer, o.total,
               o.order_status, o.payment_status
        FROM orders o JOIN customers c ON c.id = o.customer_id
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
@login_required
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
    return jsonify([dict(r) for r in rows])

@app.route("/api/products/<int:pid>", methods=["GET"])
@login_required
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
            errors["sku"] = "SKU must be unique. Please enter a different SKU."

    try:
        price = float(price)
        if price <= 0:
            errors["price"] = "Price must be a positive number."
    except (TypeError, ValueError):
        errors["price"] = "Price must be a positive number."

    try:
        stock = int(stock)
        if stock < 0:
            errors["stock"] = "Stock quantity cannot be negative."
    except (TypeError, ValueError):
        errors["stock"] = "Stock quantity must be a whole number."

    try:
        safety = int(safety)
        if safety < 0:
            errors["safety_stock"] = "Safety stock cannot be negative."
    except (TypeError, ValueError):
        errors["safety_stock"] = "Safety stock must be a whole number."

    return errors, {"name": name, "sku": sku, "price": price,
                    "stock": stock, "safety_stock": safety}

@app.route("/api/products", methods=["POST"])
@login_required
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

    # Variants (optional)
    for v in (data.get("variants") or []):
        if not v.get("variant_name") or not v.get("sku"):
            continue
        conn.execute("""
            INSERT INTO product_variants
                (product_id, variant_name, sku, price, stock, size, color, shade, scent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (pid, v.get("variant_name"), v.get("sku"),
              v.get("price") or clean["price"], int(v.get("stock") or 0),
              v.get("size"), v.get("color"), v.get("shade"), v.get("scent")))

    conn.commit()
    conn.close()
    return jsonify({"message": "Product created.", "id": pid}), 201

@app.route("/api/products/<int:pid>", methods=["PUT"])
@login_required
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
@login_required
def delete_product(pid):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Product deleted."})

# ---------- INVENTORY ----------
@app.route("/api/inventory", methods=["GET"])
@login_required
def inventory():
    conn = get_db()
    rows = conn.execute("""
        SELECT pv.id, p.name AS product, pv.sku AS sku, pv.variant_name AS variant,
               pv.stock AS current_stock, p.safety_stock AS safety_stock,
               p.image_alt, 'variant' AS kind
        FROM product_variants pv JOIN products p ON p.id = pv.product_id
        UNION ALL
        SELECT p.id, p.name, p.sku, '' AS variant, p.stock, p.safety_stock,
               p.image_alt, 'product' AS kind
        FROM products p
        WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_variants)
        ORDER BY product, variant
    """).fetchall()
    conn.close()

    items = []
    for r in rows:
        d = dict(r)
        if d["current_stock"] == 0:
            d["status"] = "OUT OF STOCK"
            d["status_icon"] = "✕"
        elif d["current_stock"] <= d["safety_stock"]:
            d["status"] = "LOW STOCK"
            d["status_icon"] = "⚠"
        else:
            d["status"] = "IN STOCK"
            d["status_icon"] = "✓"
        items.append(d)
    return jsonify(items)

@app.route("/api/inventory/<int:vid>", methods=["PUT"])
@login_required
def update_inventory(vid):
    data = request.get_json() or {}
    kind = data.get("kind", "variant")

    if kind not in ("variant", "product"):
        return jsonify({"error": "Invalid inventory item type."}), 400

    try:
        new_stock = int(data.get("stock"))
        if new_stock < 0:
            return jsonify({"error": "Stock quantity cannot be negative."}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "Stock must be a whole number."}), 400
        if new_stock < 0:
            return jsonify({"error": "Stock quantity cannot be negative."}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "Stock must be a whole number."}), 400

    conn = get_db()
    table = "product_variants" if kind == "variant" else "products"
    conn.execute(f"UPDATE {table} SET stock = ? WHERE id = ?", (new_stock, vid))
    if kind == "product":
        conn.execute("""
            UPDATE products SET status = CASE
                WHEN stock = 0 THEN 'Out of Stock'
                WHEN status = 'Out of Stock' THEN 'Active'
                ELSE status END
            WHERE id = ?
        """, (vid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Stock updated."})

# ---------- ORDERS ----------
@app.route("/api/orders", methods=["GET"])
@login_required
def list_orders():
    conn = get_db()
    rows = conn.execute("""
        SELECT o.id, o.order_number, c.full_name AS customer,
               o.order_date, o.total, o.payment_status, o.order_status,
               o.tracking_number
        FROM orders o JOIN customers c ON c.id = o.customer_id
        ORDER BY o.id DESC
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/orders/<int:oid>", methods=["GET"])
@login_required
def get_order(oid):
    conn = get_db()
    o = conn.execute("""
        SELECT o.*, c.full_name AS customer, c.email AS customer_email,
               c.phone AS customer_phone, c.address AS customer_address
        FROM orders o JOIN customers c ON c.id = o.customer_id
        WHERE o.id = ?
    """, (oid,)).fetchone()
    if not o:
        conn.close()
        return jsonify({"error": "Order not found."}), 404
    items = conn.execute(
        "SELECT * FROM order_items WHERE order_id = ?", (oid,)
    ).fetchall()
    conn.close()
    data = dict(o)
    data["items"] = [dict(i) for i in items]
    return jsonify(data)

@app.route("/api/orders/<int:oid>/status", methods=["PUT"])
@login_required
def update_order_status(oid):
    data = request.get_json() or {}
    status = data.get("status")
    valid = {"Pending", "Processing", "Shipped", "Delivered", "Refunded"}
    if status not in valid:
        return jsonify({"error": "Invalid order status."}), 400
    conn = get_db()
    conn.execute("UPDATE orders SET order_status = ? WHERE id = ?", (status, oid))
    if status == "Refunded":
        conn.execute("UPDATE orders SET payment_status = 'Refunded' WHERE id = ?", (oid,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Order status updated to {status}."})

@app.route("/api/orders/<int:oid>/tracking", methods=["POST"])
@login_required
def add_tracking(oid):
    data = request.get_json() or {}
    tracking = (data.get("tracking_number") or "").strip()
    if not tracking:
        return jsonify({"error": "Tracking number is required."}), 400
    conn = get_db()
    conn.execute("UPDATE orders SET tracking_number = ? WHERE id = ?", (tracking, oid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Tracking number saved.", "tracking_number": tracking})

@app.route("/api/orders/<int:oid>/shipping-label", methods=["POST"])
@login_required
def shipping_label(oid):
    conn = get_db()
    o = conn.execute("SELECT * FROM orders WHERE id = ?", (oid,)).fetchone()
    if not o:
        conn.close()
        return jsonify({"error": "Order not found."}), 404

    tracking = o["tracking_number"] or f"ATH-2026-{oid:04d}"
    conn.execute("""
        UPDATE orders SET tracking_number = ?, shipping_label_generated = 1
        WHERE id = ?
    """, (tracking, oid))
    conn.commit()
    conn.close()
    return jsonify({
        "message": "Shipping Label Generated",
        "order_number": o["order_number"],
        "tracking_number": tracking,
    })

@app.route("/api/orders/<int:oid>/refund", methods=["POST"])
@login_required
def refund_order(oid):
    conn = get_db()
    o = conn.execute("SELECT * FROM orders WHERE id = ?", (oid,)).fetchone()
    if not o:
        conn.close()
        return jsonify({"error": "Order not found."}), 404
    conn.execute("""
        UPDATE orders SET order_status = 'Refunded', payment_status = 'Refunded'
        WHERE id = ?
    """, (oid,))
    conn.commit()
    conn.close()
    return jsonify({
        "message": f"Refund processed successfully for Order {o['order_number']}."
    })

# ---------- CUSTOMERS ----------
@app.route("/api/customers", methods=["GET"])
@login_required
def list_customers():
    conn = get_db()
    rows = conn.execute("SELECT * FROM customers ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/customers", methods=["POST"])
@login_required
def create_customer():
    data = request.get_json() or {}
    if not (data.get("full_name") or "").strip():
        return jsonify({"errors": {"full_name": "Full name is required."}}), 400
    conn = get_db()
    cur = conn.execute("""
        INSERT INTO customers (full_name, preferred_name, title, gender, email, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (data.get("full_name"), data.get("preferred_name"), data.get("title"),
          data.get("gender"), data.get("email"), data.get("phone"), data.get("address")))
    conn.commit()
    cid = cur.lastrowid
    conn.close()
    return jsonify({"message": "Customer created.", "id": cid}), 201


# ---------- CATEGORIES ----------
@app.route("/api/categories", methods=["GET"])
@login_required
def list_categories():
    conn = get_db()
    rows = conn.execute("""
        SELECT c.*,
               COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/categories", methods=["POST"])
@login_required
def create_category():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()

    if not name:
        return jsonify({
            "errors": {"name": "Category name is required."}
        }), 400

    conn = get_db()

    try:
        cur = conn.execute("""
            INSERT INTO categories (name, description)
            VALUES (?, ?)
        """, (name, description))
        conn.commit()
        category_id = cur.lastrowid

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            "errors": {"name": "This category already exists."}
        }), 400

    conn.close()
    return jsonify({
        "message": "Category created.",
        "id": category_id
    }), 201


@app.route("/api/categories/<int:cid>", methods=["PUT"])
@login_required
def update_category(cid):
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()

    if not name:
        return jsonify({
            "errors": {"name": "Category name is required."}
        }), 400

    conn = get_db()

    existing = conn.execute(
        "SELECT id FROM categories WHERE id = ?", (cid,)
    ).fetchone()

    if not existing:
        conn.close()
        return jsonify({"error": "Category not found."}), 404

    try:
        conn.execute("""
            UPDATE categories
            SET name = ?, description = ?
            WHERE id = ?
        """, (name, description, cid))
        conn.commit()

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            "errors": {"name": "This category already exists."}
        }), 400

    conn.close()
    return jsonify({"message": "Category updated."})


@app.route("/api/categories/<int:cid>", methods=["DELETE"])
@login_required
def delete_category(cid):
    conn = get_db()

    existing = conn.execute(
        "SELECT id FROM categories WHERE id = ?", (cid,)
    ).fetchone()

    if not existing:
        conn.close()
        return jsonify({"error": "Category not found."}), 404

    conn.execute("DELETE FROM categories WHERE id = ?", (cid,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Category deleted."})


# ---------- MAIN ----------
if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=True)