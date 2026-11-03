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
    # Force clean database reload to reset products
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception:
            pass

    conn = get_db()
    cur = conn.cursor()
    
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        background_color TEXT NOT NULL DEFAULT '#f7f5f0',
        accent_color TEXT NOT NULL DEFAULT '#a18b69',
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
        variant_id INTEGER,
        product_name TEXT NOT NULL,
        variant_label TEXT,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
    """)

    # Seed Admin Account
    admin_pw = generate_password_hash("admin123")
    cur.execute("""
        INSERT OR IGNORE INTO users (id, username, email, password_hash, role)
        VALUES (1, 'admin', 'admin@athaliah.com', ?, 'admin')
    """, (admin_pw,))

    cur.execute("""
        INSERT OR IGNORE INTO customers (id, first_name, last_name, full_name, email, phone, address)
        VALUES (1, 'Admin', 'User', 'Administrator', 'admin@athaliah.com', '09123456789', 'Legazpi City')
    """)

    # Seed Original Store Products Only
    cur.executescript("""
        INSERT OR IGNORE INTO products (id, name, sku, description, price, stock, safety_stock, image_url, status) VALUES
        (1, 'Classic Sneakers', 'ATH-SNK-001', 'Comfortable everyday casual sneakers', 1299.00, 50, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Active'),
        (2, 'Athaliah Signature Perfume', 'ATH-PRF-002', 'Long-lasting luxury fragrance', 450.00, 30, 5, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500', 'Active'),
        (3, 'Elegant Handbag', 'ATH-BAG-003', 'Chic fashion accessory for any occasion', 899.00, 20, 5, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', 'Active'),
        (4, 'Silver Necklace', 'ATH-ACC-004', 'Dainty sterling silver pendant necklace', 299.00, 40, 5, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', 'Active'),
        (5, 'Minimalist Watch', 'ATH-ACC-005', 'Classic leather strap timepiece', 1099.00, 15, 3, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Active'),
        (6, 'Silk Scarf', 'ATH-ACC-006', 'Soft premium patterned neck scarf', 350.00, 25, 5, 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500', 'Active'),
        (7, 'Scented Soy Candle', 'ATH-HOM-007', 'Relaxing vanilla and lavender aroma', 250.00, 60, 10, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500', 'Active'),
        (8, 'Gold Hoop Earrings', 'ATH-ACC-008', 'Lightweight everyday statement earrings', 399.00, 35, 5, 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500', 'Active');
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database reset successfully to original products!")