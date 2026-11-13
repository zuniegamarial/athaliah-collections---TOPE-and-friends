import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        biometric_enabled INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        background_color TEXT NOT NULL DEFAULT '#0f172a',
        accent_color TEXT NOT NULL DEFAULT '#6366f1',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        safety_stock INTEGER NOT NULL DEFAULT 5,
        category_id INTEGER,
        image_url TEXT,
        image_alt TEXT,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        price REAL,
        stock INTEGER NOT NULL DEFAULT 0,
        size TEXT,
        color TEXT,
        shade TEXT,
        scent TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT NOT NULL,
        preferred_name TEXT,
        title TEXT,
        gender TEXT,
        email TEXT,
        phone TEXT,
        address TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER,
        order_date TEXT DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'Paid',
        order_status TEXT NOT NULL DEFAULT 'Pending',
        tracking_number TEXT,
        shipping_label_generated INTEGER DEFAULT 0,
        items TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        address TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
    """)

    # Seed Admin Account
    admin_pw = generate_password_hash("admin123")
    cur.execute("""
        INSERT INTO users (id, username, email, password_hash, role)
        VALUES (1, 'admin', 'admin@athaliah.com', ?, 'admin')
        ON CONFLICT(id) DO UPDATE SET
            username=excluded.username,
            email=excluded.email,
            password_hash=excluded.password_hash,
            role=excluded.role
    """, (admin_pw,))

    # Seed Categories (Renamed to Earrings and Bracelets)
    cur.execute("INSERT OR IGNORE INTO categories (id, name, description) VALUES (1, 'Footwear', 'Performance and casual shoes')")
    cur.execute("INSERT OR IGNORE INTO categories (id, name, description) VALUES (2, 'Earrings', 'Stunning earrings and ear ornaments')")
    cur.execute("INSERT OR IGNORE INTO categories (id, name, description) VALUES (3, 'Bracelets', 'Fine bracelets and wrist accessories')")
    
    # Also handle update if the old names already exist in an existing database
    cur.execute("UPDATE categories SET name = 'Earrings', description = 'Stunning earrings and ear ornaments' WHERE name = 'Accessories'")
    cur.execute("UPDATE categories SET name = 'Bracelets', description = 'Fine bracelets and wrist accessories' WHERE name = 'Fragrances & Swirls'")

    # Seed Products with local images
    products = [
        ("Adizero Adios Pro 4", "ATH-FTW-01", 8999.00, 10, 1, "/images/Adizero-Adios-Pro4.png"),
        ("Adizero Adios Pro M", "ATH-FTW-02", 8499.00, 12, 1, "/images/Adizero-Adios-ProM.png"),
        ("Athaliah Signature Bracelet 1", "ATH-ACC-01", 799.00, 20, 3, "/images/Athaliah-bracelet1.png"),
        ("Athaliah Signature Bracelet 2", "ATH-ACC-02", 899.00, 18, 3, "/images/Athaliah-bracelet2.png"),
        ("Athaliah Signature Bracelet 3", "ATH-ACC-03", 999.00, 15, 3, "/images/Athaliah-bracelet3.png"),
        ("Cloudrunner", "ATH-FTW-03", 6499.00, 14, 1, "/images/Cloudrunner.png"),
        ("Cloudtilt Remix", "ATH-FTW-04", 6999.00, 10, 1, "/images/Cloudtild-remix.png"),
        ("Cloud X4", "ATH-FTW-05", 5999.00, 20, 1, "/images/Cloudx4.png"),
        ("Cloud X White", "ATH-FTW-06", 5999.00, 25, 1, "/images/CloudxWhite.png"),
        ("Daily Swirl 1", "ATH-FRG-01", 1299.00, 30, 2, "/images/Daily-Swirl1.png"),
        ("Daily Swirl 2", "ATH-FRG-02", 1299.00, 30, 2, "/images/Daily-Swirl2.png"),
        ("Kobe V Protro", "ATH-FTW-07", 9499.00, 8, 1, "/images/KobeVprotro.png"),
        ("New Balance 1906R", "ATH-FTW-08", 7999.00, 16, 1, "/images/Newbalance1906R.png"),
        ("Nike Zoom Vomero 5", "ATH-FTW-09", 7499.00, 22, 1, "/images/Nike-Zoom-Vomero5.png"),
        ("Nike V5 RNR", "ATH-FTW-10", 6899.00, 12, 1, "/images/Nikev5RNR.png")
    ]

    for name, sku, price, stock, cat_id, img in products:
        cur.execute("""
            INSERT INTO products (name, sku, description, price, stock, category_id, image_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')
            ON CONFLICT(sku) DO UPDATE SET image_url=excluded.image_url, category_id=excluded.category_id
        """, (name, sku, f"Exclusive Athaliah Collections item: {name}", price, stock, cat_id, img))

    # ---------- MIGRATIONS ----------
    def ensure_column(table, column, ddl):
        cols = [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]
        if column not in cols:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")

    ensure_column("customers", "user_id", "INTEGER")
    ensure_column("orders", "payment_method", "TEXT DEFAULT 'COD'")
    ensure_column("orders", "payment_reference", "TEXT")
    ensure_column("orders", "shipping_address", "TEXT")
    ensure_column("orders", "contact_phone", "TEXT")

    version = cur.execute("PRAGMA user_version").fetchone()[0]
    if version < 1:
        cur.execute("UPDATE customers SET address = '' WHERE address = 'Legazpi City'")
        cur.execute("PRAGMA user_version = 1")

    cur.execute("""
        UPDATE customers
        SET user_id = (SELECT u.id FROM users u
                       WHERE LOWER(u.email) = LOWER(customers.email) AND u.role = 'customer' LIMIT 1)
        WHERE user_id IS NULL AND email IS NOT NULL AND TRIM(email) != ''
    """)

    missing = cur.execute("""
        SELECT id, username, email FROM users
        WHERE role = 'customer'
          AND id NOT IN (SELECT user_id FROM customers WHERE user_id IS NOT NULL)
    """).fetchall()
    for u in missing:
        cur.execute("INSERT INTO customers (full_name, email, user_id) VALUES (?, ?, ?)",
                    (u["username"], u["email"], u["id"]))

    cur.execute("""
        INSERT INTO customer_addresses (customer_id, address)
        SELECT c.id, c.address FROM customers c
        WHERE c.address IS NOT NULL AND TRIM(c.address) != ''
          AND NOT EXISTS (SELECT 1 FROM customer_addresses a
                          WHERE a.customer_id = c.id AND a.address = c.address)
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully with Earrings and Bracelets categories!")