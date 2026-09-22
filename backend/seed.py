from database import get_db
from werkzeug.security import generate_password_hash

def seed():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) AS c FROM users")
    if cur.fetchone()["c"] > 0:
        print("Database already seeded.")
        conn.close()
        return

    # Admin user
    cur.execute(
        "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
        ("admin", "admin@athaliahcollections.ph",
         generate_password_hash("admin123"), "admin")
    )

    # Categories
    categories = [
        ("Sneakers", "Athletic and casual footwear"),
        ("Cosmetics", "Makeup and beauty products"),
        ("Fragrances", "Perfumes and body mists"),
        ("Accessories", "Fashion accessories"),
    ]
    cur.executemany("INSERT INTO categories (name, description) VALUES (?, ?)", categories)

    # Products (DEMO data)
    products = [
        ("Classic Sneakers", "SNK-001", "Classic white sneakers", 1299.00, 12, 5, 1,
         "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
         "White classic athletic sneaker with laces", "Active"),
        ("Black/White Sneakers", "SNK-002", "Two-tone sneakers", 1499.00, 3, 5, 1,
         "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
         "Black and white sneakers on a plain background", "Active"),
        ("Colored Sneakers", "SNK-003", "Vibrant colored sneakers", 1599.00, 0, 5, 1,
         "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400",
         "Bright pink sneakers with white soles", "Out of Stock"),
        ("Athaliah Gel Tint", "COS-001", "Long-lasting gel tint", 299.00, 8, 5, 2,
         "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
         "Athaliah Gel Tint collection in multiple shades", "Active"),
        ("Victoria's Secret Mist 250ml", "FRG-001", "Body mist 250ml", 899.00, 4, 5, 3,
         "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
         "Victoria's Secret fragrance mist bottles", "Active"),
        ("Victoria's Secret Mist 75ml", "FRG-002", "Travel-size mist 75ml", 499.00, 15, 5, 3,
         "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400",
         "Victoria's Secret travel-size fragrance mist", "Active"),
        ("Fragrance Collection", "FRG-003", "Assorted perfumes", 1899.00, 6, 3, 3,
         "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400",
         "Assorted fragrance perfume bottles", "Active"),
        ("Fashion Earrings", "ACC-001", "Gold star earrings", 199.00, 25, 5, 4,
         "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400",
         "Gold star fashion earrings on a white surface", "Active"),
    ]
    cur.executemany("""
        INSERT INTO products (name, sku, description, price, stock, safety_stock,
                              category_id, image_url, image_alt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, products)

    # Variants
    variants = [
        (1, "White / Size 7",   "SNK-001-WHT-7",   1299, 5, "7",   "White", None, None),
        (1, "White / Size 8",   "SNK-001-WHT-8",   1299, 4, "8",   "White", None, None),
        (1, "White / Size 9",   "SNK-001-WHT-9",   1299, 3, "9",   "White", None, None),
        (2, "Black / Size 8",   "SNK-002-BLK-8",   1499, 3, "8",   "Black", None, None),
        (2, "Black / Size 8.5", "SNK-002-BLK-85",  1499, 0, "8.5", "Black", None, None),
        (3, "Pink / Size 8",    "SNK-003-PNK-8",   1599, 0, "8",   "Pink",  None, None),
        (4, "Red Shade",  "COS-001-RED",  299, 3, None, None, "Red",  None),
        (4, "Nude Shade", "COS-001-NUD",  299, 3, None, None, "Nude", None),
        (4, "Pink Shade", "COS-001-PNK",  299, 2, None, None, "Pink", None),
        (5, "Love Spell 250ml", "FRG-001-LS",  899, 4, "250ml", None, None, "Love Spell"),
        (5, "Pure Seduction 250ml", "FRG-001-PS", 899, 0, "250ml", None, None, "Pure Seduction"),
        (6, "Love Spell 75ml", "FRG-002-LS",  499, 15, "75ml", None, None, "Love Spell"),
        (7, "Bombshell 100ml", "FRG-003-BMB", 1899, 6, "100ml", None, None, "Bombshell"),
        (8, "Gold Star",  "ACC-001-GS", 199, 15, None, None, None, None),
        (8, "Silver Moon", "ACC-001-SM", 199, 10, None, None, None, None),
    ]
    cur.executemany("""
        INSERT INTO product_variants
            (product_id, variant_name, sku, price, stock, size, color, shade, scent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, variants)

    # Customers
    customers = [
        ("Juan Dela Cruz", "Juan", "Mr.", "Man",
         "juan@example.com", "09171234567", "Legazpi City, Albay"),
        ("Maria Santos", "Maria", "Ms.", "Woman",
         "maria@example.com", "09181234567", "Tabaco City, Albay"),
        ("Alex Cruz", "Alex", "Mx.", "Non-binary",
         "alex@example.com", "09191234567", "Daraga, Albay"),
        ("Sam Reyes", "Sam", "Mx.", "Prefer not to say",
         "sam@example.com", "09201234567", "Legazpi City, Albay"),
    ]
    cur.executemany("""
        INSERT INTO customers (full_name, preferred_name, title, gender, email, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, customers)

    # Orders
    orders = [
        ("#1001", 1, "2026-01-15", 1299.00, "Paid",   "Pending",    None),
        ("#1002", 2, "2026-01-16", 1299.00, "Paid",   "Processing", None),
        ("#1003", 3, "2026-01-17", 2499.00, "Paid",   "Shipped",    "ATH-2026-0001"),
        ("#1004", 4, "2026-01-18", 899.00,  "Pending","Pending",    None),
    ]
    cur.executemany("""
        INSERT INTO orders (order_number, customer_id, order_date, total,
                            payment_status, order_status, tracking_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, orders)

    items = [
        (1, 1, 1, "Classic Sneakers", "White / Size 7", 1, 1299.00),
        (2, 1, 2, "Classic Sneakers", "White / Size 8", 1, 1299.00),
        (3, 2, 4, "Black/White Sneakers", "Black / Size 8", 1, 1499.00),
        (3, 5, 10, "Victoria's Secret Mist 250ml", "Love Spell 250ml", 1, 899.00),
        (4, 5, 10, "Victoria's Secret Mist 250ml", "Love Spell 250ml", 1, 899.00),
    ]
    cur.executemany("""
        INSERT INTO order_items
            (order_id, product_id, variant_id, product_name, variant_label, quantity, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, items)

    conn.commit()
    conn.close()
    print("✅ Seed complete. Admin: admin / admin123")

if __name__ == "__main__":
    seed()