from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
import mysql.connector
from flask_cors import CORS
from decimal import Decimal
from datetime import datetime

app = Flask(__name__)
app.secret_key = "your_secret_key" #cookie secure
CORS(app, supports_credentials=True)

# ---------- DATABASE CONNECTION ----------
def get_db_connection():
    conn = mysql.connector.connect( #object of connection
        host="localhost",
        user="root",              # your MySQL username
        password="#YOur key",    # your MySQL password
        database="cafeteria_db"   # your DB name
    )
    return conn

bcrypt = Bcrypt(app)


@app.route("/")
def home():
    return "Cafeteria backend is running"


# ---------- REGISTER ROUTE ----------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # username already taken?
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        return jsonify({"message": "Username already taken"}), 400

    # password hash
    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    # signup se hamesha normal user
    cursor.execute(
        "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
        (username, hashed_pw, "user")
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "User registered successfully!"}), 201


# ---------- LOGIN ROUTE ----------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, password, role FROM users WHERE username = %s", (username,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if row is None:
        return jsonify({"message": "Invalid username or password"}), 401

    user_id, hashed_pw, role = row

    if not bcrypt.check_password_hash(hashed_pw, password):
        return jsonify({"message": "Invalid username or password"}), 401

    session["user_id"] = user_id  #coockie----> session id 
    session["username"] = username
    session["role"] = role

    return jsonify({
        "message": "Login successful!",
        "username": username,
        "role": role
    }), 200


# ---------- ADMIN REQUEST ROUTES ----------
@app.route("/admin-request", methods=["POST"])
def create_admin_request():
    # login check
    if "user_id" not in session:
        return jsonify({"message": "Not logged in"}), 401

    user_id = session["user_id"]
    current_role = session.get("role", "user")

    # agar already admin hai to request ki zarurat nahi
    if current_role == "admin":
        return jsonify({"message": "You are already an admin"}), 400

    data = request.get_json() or {}
    note = data.get("note", "")

    conn = get_db_connection()
    cursor = conn.cursor()

    # check: existing pending request?
    cursor.execute(
        "SELECT id FROM admin_requests WHERE user_id = %s AND status = 'pending'",
        (user_id,)
    )
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        return jsonify({"message": "Request already pending"}), 400

    # new request insert
    cursor.execute(
        "INSERT INTO admin_requests (user_id, note) VALUES (%s, %s)",
        (user_id, note)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Admin request submitted"}), 200


@app.route("/admin-requests", methods=["GET"])
def list_admin_requests():
    # sirf admin ko allow
    if session.get("role") != "admin":
        return jsonify({"message": "Forbidden"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT r.id, u.username, r.status, r.note, r.created_at
        FROM admin_requests r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        """
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "username": row[1],
            "status": row[2],
            "note": row[3],
            "created_at": row[4].strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(data), 200


@app.route("/admin-requests/approve", methods=["POST"])
def approve_admin_request():
    if session.get("role") != "admin":
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    req_id = data.get("request_id")
    if not req_id:
        return jsonify({"message": "request_id required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # user_id nikaalo
    cursor.execute("SELECT user_id FROM admin_requests WHERE id = %s", (req_id,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        return jsonify({"message": "Request not found"}), 404

    user_id = row[0]

    # user ko admin banao + request approve karo
    cursor.execute("UPDATE users SET role = 'admin' WHERE id = %s", (user_id,))
    cursor.execute(
        "UPDATE admin_requests SET status = 'approved' WHERE id = %s",
        (req_id,)
    )

    conn.commit() #save changes
    cursor.close() 
    conn.close()

    return jsonify({"message": "Request approved, user is now admin"}), 200


@app.route("/admin-requests/reject", methods=["POST"])
def reject_admin_request():
    if session.get("role") != "admin":
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    req_id = data.get("request_id")
    if not req_id:
        return jsonify({"message": "request_id required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE admin_requests SET status = 'rejected' WHERE id = %s",
        (req_id,)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Request rejected"}), 200


# ---------- MENU ROUTES (ADMIN) ----------
@app.route("/menu", methods=["GET"])
def get_menu_items():
    """Saare menu items laata hai."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, category, price, stock FROM menu_items")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        items = []
        for row in rows:
            item_id, name, category, price, stock = row
            if isinstance(price, Decimal): #check type
                price = float(price)

            items.append({
                "id": item_id,
                "name": name,
                "category": category,
                "price": price,
                "stock": stock,
            })

        return jsonify(items), 200
    except Exception as e:
        print("GET /menu ERROR:", e)
        return jsonify({"message": "Backend error in get_menu"}), 500


@app.route("/menu/<int:item_id>", methods=["PUT"])
def update_menu_item(item_id):
    """
    Sirf STOCK update karega.
    Name / category / price bilkul change nahi honge.
    """
    try:
        data = request.get_json() or {}
        stock = data.get("stock")

        if stock is None:
            return jsonify({"message": "Stock value required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE menu_items SET stock = %s WHERE id = %s",
            (int(stock), item_id),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Stock updated"}), 200
    except Exception as e:
        print("PUT /menu ERROR:", e)
        return jsonify({"message": "Backend error in update_menu_item"}), 500


@app.route("/menu", methods=["POST"])
def create_menu_item():
    """optional – agar future me new item add karna ho to."""
    try:
        data = request.get_json() or {}
        name = data.get("name")
        category = data.get("category")
        price = data.get("price")
        stock = data.get("stock", 0)

        if not name or not category or price is None:
            return jsonify({"message": "Name, category, and price required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO menu_items (name, category, price, stock) VALUES (%s, %s, %s, %s)",
            (name, category, price, stock),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Menu item created"}), 201
    except Exception as e:
        print("POST /menu ERROR:", e)
        return jsonify({"message": "Backend error in create_menu_item"}), 500


@app.route("/menu/<int:item_id>", methods=["DELETE"])
def delete_menu_item(item_id):
    """optional – agar future me item delete karna ho to."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM menu_items WHERE id = %s", (item_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Menu item deleted"}), 200
    except Exception as e:
        print("DELETE /menu ERROR:", e)
        return jsonify({"message": "Backend error in delete_menu_item"}), 500


# ---------- ORDERS ROUTES ----------
@app.route("/orders", methods=["POST"])
def create_order():
    """
    User order place karega.
    JSON: { "items": [ { "item_id": 1, "quantity": 2 }, ... ] }
    User session se liya jayega.
    """
    try:
        if "user_id" not in session:
            return jsonify({"message": "Not logged in"}), 401

        user_id = session["user_id"]

        data = request.get_json() or {}
        items = data.get("items", [])

        if not items:
            return jsonify({"message": "Items required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        total_amount = 0.0
        item_details = []  # (item_id, price, qty)

        for it in items:
            item_id = it.get("item_id")
            qty = int(it.get("quantity", 0))

            if not item_id or qty <= 0:
                continue

            cursor.execute(
                "SELECT price, stock FROM menu_items WHERE id = %s",
                (item_id,),
            )
            row = cursor.fetchone()
            if not row:
                cursor.close()
                conn.close()
                return jsonify({"message": f"Item {item_id} not found"}), 400

            price, stock = row
            price = float(price)

            if stock < qty:
                cursor.close()
                conn.close()
                return jsonify({"message": f"Not enough stock for item {item_id}"}), 400

            total_amount += price * qty
            item_details.append((item_id, price, qty))

        if not item_details:
            cursor.close()
            conn.close()
            return jsonify({"message": "No valid items to order"}), 400

        # orders table me insert
        cursor.execute(
            "INSERT INTO orders (user_id, total_amount) VALUES (%s, %s)",
            (user_id, total_amount),
        )
        order_id = cursor.lastrowid

        # order_items + stock update
        for item_id, price, qty in item_details:
            cursor.execute(
                """
                INSERT INTO order_items (order_id, item_id, quantity, price_each)
                VALUES (%s, %s, %s, %s)
                """,
                (order_id, item_id, qty, price),
            )
            cursor.execute(
                "UPDATE menu_items SET stock = stock - %s WHERE id = %s",
                (qty, item_id),
            )

        conn.commit()
        cursor.close()
        conn.close()

        print("ORDER OK:", order_id, "amount:", total_amount)
        return jsonify({
            "message": "Order placed",
            "order_id": order_id,
            "total_amount": total_amount
        }), 201

    except Exception as e:
        print("POST /orders ERROR:", e)
        return jsonify({"message": "Backend error in create_order"}), 500


@app.route("/orders/admin/summary", methods=["GET"])
def get_orders_summary():
    """Admin cards ke liye: total orders + total revenue + total users."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # orders + revenue
        cursor.execute("SELECT COUNT(*), COALESCE(SUM(total_amount), 0) FROM orders")
        row = cursor.fetchone()
        total_orders = int(row[0])
        total_revenue = float(row[1])

        # total users
        cursor.execute("SELECT COUNT(*) FROM users")
        row2 = cursor.fetchone()
        total_users = int(row2[0])

        cursor.close()
        conn.close()

        return jsonify({
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_users": total_users
        }), 200
    except Exception as e:
        print("GET /orders/admin/summary ERROR:", e)
        return jsonify({"message": "Backend error in summary"}), 500


@app.route("/orders/admin", methods=["GET"])
def get_all_orders_admin():
    """
    Admin ke liye: sare orders + kis ne kya order kiya (items list).
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT 
                o.id,
                u.username,
                o.total_amount,
                o.created_at,
                GROUP_CONCAT(CONCAT(oi.quantity, 'x ', m.name) SEPARATOR ', ') AS items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON oi.order_id = o.id
            JOIN menu_items m ON oi.item_id = m.id
            GROUP BY o.id, u.username, o.total_amount, o.created_at
            ORDER BY o.created_at DESC
            """
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        orders = []
        for row in rows:
            order_id = row[0]
            username = row[1]
            total_amount = float(row[2])
            created_at = row[3]
            items_text = row[4] or ""

            if isinstance(created_at, datetime):
                created_str = created_at.strftime("%Y-%m-%d %H:%M:%S")
            else:
                created_str = str(created_at)

            orders.append({
                "id": order_id,
                "username": username,
                "total_amount": total_amount,
                "created_at": created_str,
                "items": items_text,
            })

        print("GET /orders/admin -> rows:", len(orders))
        return jsonify(orders), 200
    except Exception as e:
        print("GET /orders/admin ERROR:", e)
        return jsonify({"message": "Backend error in get_all_orders_admin"}), 500


# ---------- ADMIN USERS ----------
@app.route("/admin/users", methods=["GET"])
def get_all_users_admin():
    """
    Admin ke liye: saare users ki basic info (id + username + role) DB se.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, username, role FROM users")
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        users = []
        for row in rows:
            users.append({
                "id": row[0],
                "username": row[1],
                "role": row[2],
            })

        print("GET /admin/users ->", len(users), "rows")
        return jsonify(users), 200

    except Exception as e:
        print("GET /admin/users ERROR:", e)
        return jsonify({"error": str(e)}), 500


# ---------- LOGOUT ROUTE ----------
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


if __name__ == "__main__":
    app.run(debug=True)