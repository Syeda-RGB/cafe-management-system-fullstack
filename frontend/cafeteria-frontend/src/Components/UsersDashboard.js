
// src/components/UserDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";

//  ADDED — Image map for each item ID
const itemImages = {
  1: "/images/iced_late.jfif",
  2: "/images/actuale_late.jfif",
  3: "/images/cold_coffee.jfif",
  4: "/images/mint.jfif",
  5: "/images/fries.jfif",
  6: "/images/cheese fries.jfif",
  7: "/images/sandwtich.jfif",
  8: "/images/zinger.jfif",
  9: "/images/student.jfif",
  10: "/images/grilled.jfif",
  11: "/images/brownie.jfif",
  12: "/images/iceCream.jfif",
};

function UserDashboard({ username, onLogout }) {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  // admin request ke liye
  const [note, setNote] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  // MENU LOAD
  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/menu");
      const all = res.data || [];
      const available = all.filter((it) => (it.stock || 0) > 0);

      // ⭐ ADDED — Attach images to each item
      const withImages = available.map((it) => ({
        ...it,
        image: itemImages[it.id] || "/images/default.jpg",
      }));

      setItems(withImages); // ⭐ we ONLY changed this line
    } catch (err) {
      console.error(err);
      setMessage("Error loading menu");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // CART LOGIC
  const addToCart = (item) => {
    setMessage("");
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > item.stock) {
          setMessage("Not enough stock for " + item.name);
          return prev;
        }
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: newQty } : p
        );
      }
      if (item.stock < 1) {
        setMessage("Item out of stock");
        return prev;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQty = (id, qty) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: qty < 1 ? 1 : qty } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ORDER PLACE
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setMessage("Cart is empty");
      return;
    }

    try {
      const payload = {
        items: cart.map((c) => ({
          item_id: c.id,
          quantity: c.quantity,
        })),
      };

      const res = await axios.post("http://localhost:5000/orders", payload);
      setMessage("Order placed! Total Rs. " + res.data.total_amount);
      setCart([]);
      fetchMenu(); // new stock show
    } catch (err) {
      console.error("ORDER ERROR:", err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Error placing order");
      }
    }
  };

  // ADMIN REQUEST
  const handleAdminRequest = async () => {
    try {
      const res = await axios.post("http://localhost:5000/admin-request", {
        note,
      });
      setRequestMessage(res.data.message || "Request sent");
    } catch (err) {
      console.error("ADMIN REQ ERROR:", err);
      setRequestMessage(
        err.response?.data?.message || "Error sending request"
      );
    }
  };

  return (
    <div className="user-layout">
      <aside className="user-sidebar">
        <div className="user-logo">
          <span className="user-logo-light">Campus</span>
          <span className="user-logo-bold">Hub</span>
        </div>
        <p className="user-sidebar-sub">Welcome, {username}</p>

        <nav className="user-nav">
          <button className="user-nav-link user-nav-link-active">
            Menu
          </button>
          <button className="user-nav-link">My Orders (soon)</button>
        </nav>

        <button className="user-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <div className="user-main">
        <header className="user-header">
          <div>
            <h1 className="user-header-title">Food Menu</h1>
            <p className="user-header-sub">
              Only items with available stock are shown.
            </p>
          </div>
        </header>

        <div className="user-content">
          {message && <p className="user-message">{message}</p>}

          <div className="user-columns">
            {/* MENU */}
            <div className="user-menu">
              <h2 className="user-section-title">Available items</h2>
              <div className="user-menu-grid">
                {items.length === 0 && (
                  <p>No items in stock right now.</p>
                )}

                {items.map((item) => (
                  <div className="user-menu-card" key={item.id}>
                    <div className="user-menu-image">
                      {/* ⭐ ADDED — Show actual image */}
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="user-menu-info">
                      <h3 className="user-menu-name">{item.name}</h3>
                      <p className="user-menu-meta">
                        {item.category} • Rs. {item.price}
                      </p>
                      <p className="user-menu-stock">
                        In stock: <strong>{item.stock}</strong>
                      </p>
                    </div>
                    <button
                      className="user-add-btn"
                      onClick={() => addToCart(item)}
                    >
                      Add to cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CART + ADMIN REQUEST COLUMN */}
            <div className="user-cart">
              <h2 className="user-section-title">Your cart</h2>
              {cart.length === 0 ? (
                <p>No items added yet.</p>
              ) : (
                <>
                  <table className="user-cart-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateCartQty(
                                  item.id,
                                  Number(e.target.value)
                                )
                              }
                              className="user-cart-input"
                            />
                          </td>
                          <td>Rs. {item.price}</td>
                          <td>Rs. {item.price * item.quantity}</td>
                          <td>
                            <button
                              className="user-remove-btn"
                              onClick={() => removeFromCart(item.id)}
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="user-cart-total">
                    Total: <strong>Rs. {cartTotal}</strong>
                  </p>
                  <button
                    className="user-place-btn"
                    onClick={handlePlaceOrder}
                  >
                    Place order
                  </button>
                </>
              )}

              {/* ADMIN ACCESS REQUEST BOX */}
              <div className="user-admin-request">
                <h2 className="user-section-title">Request admin access</h2>
                <p className="user-request-text">
                  If you help manage the café, you can ask current admin to give you access.
                </p>
                <textarea
                  className="user-request-note"
                  rows="3"
                  placeholder="Write a short note for admin..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  className="user-secondary-btn"
                  onClick={handleAdminRequest}
                >
                  Send request
                </button>
                {requestMessage && (
                  <p className="user-request-message">{requestMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
