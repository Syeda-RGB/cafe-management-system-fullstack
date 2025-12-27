// src/components/AdminDashboard.js
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

function AdminDashboard({ username, onLogout }) {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  // stock modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [stockValue, setStockValue] = useState("");

  // orders + revenue + users + requests
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  // active tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // ---------- LOADERS ----------
  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/menu");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Error loading menu items");
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/orders/admin/summary"
      );
      setTotalUsers(res.data.total_users || 0);
      setTotalOrders(res.data.total_orders || 0);
      setTotalRevenue(res.data.total_revenue || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/orders/admin");
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin-requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchSummary();
    fetchOrders();
    fetchUsers();
    fetchRequests();
  }, []);

  // duplicate useEffect (your original code — kept same)
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin-requests")
      .then((res) => setRequests(res.data))
      .catch((err) => console.log(err));
  }, []);

  // ---------- STOCK MODAL ----------
  const openStockModal = () => {
    if (items.length > 0) {
      const first = items[0];
      setSelectedId(String(first.id));
      setStockValue(first.stock);
    }
    setMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleItemChange = (e) => {
    const idStr = e.target.value;
    setSelectedId(idStr);
    const id = parseInt(idStr, 10);
    const item = items.find((i) => i.id === id);
    if (item) {
      setStockValue(item.stock);
    }
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();

    const id = parseInt(selectedId, 10);
    const item = items.find((i) => i.id === id);

    if (!item) {
      setMessage("Select an item first");
      return;
    }

    try {
      const payload = {
        stock: Number(stockValue) || 0,
      };

      await axios.put(`http://localhost:5000/menu/${id}`, payload);
      setMessage("Stock updated");
      setIsModalOpen(false);
      fetchMenu();
    } catch (err) {
      console.error(err);
      setMessage("Error updating stock");
    }
  };

  // ---------- REQUEST ACTIONS ----------
  const handleApprove = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/admin-requests/approve",
        { request_id: id }
      );
      setMessage("Request approved");
      fetchRequests();
      fetchUsers();
      fetchSummary();
    } catch (err) {
      console.error(err);
      setMessage("Error approving request");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/admin-requests/reject",
        { request_id: id }
      );
      setMessage("Request rejected");
      fetchRequests();
    } catch (err) {
      console.error(err);
      setMessage("Error rejecting request");
    }
  };

  // ---------- SMALL STATS ----------
  const totalItems = items.length;
  const totalStock = items.reduce((sum, i) => sum + (i.stock || 0), 0);

  const selectedItem =
    selectedId && items.find((i) => i.id === parseInt(selectedId, 10));

  // ---------- RENDER ----------
  return (
    <>
      <div className="admin-layout">
        {/* LEFT SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-top">
            <div className="admin-logo">
              <span className="admin-logo-light">Campus</span>
              <span className="admin-logo-bold">Hub Admin</span>
            </div>
            <p className="admin-sidebar-sub">Café control panel</p>
          </div>

          <nav className="admin-nav">
            <button
              className={
                "admin-nav-link " +
                (activeTab === "dashboard" ? "admin-nav-link-active" : "")
              }
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={
                "admin-nav-link " +
                (activeTab === "orders" ? "admin-nav-link-active" : "")
              }
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
            <button
              className={
                "admin-nav-link " +
                (activeTab === "users" ? "admin-nav-link-active" : "")
              }
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
            <button
              className={
                "admin-nav-link " +
                (activeTab === "requests" ? "admin-nav-link-active" : "")
              }
              onClick={() => setActiveTab("requests")}
            >
              Admin Requests
            </button>
          </nav>

          <button className="admin-logout-btn" onClick={onLogout}>
            Logout
          </button>
        </aside>

        {/* RIGHT SIDE */}
        <div className="admin-main">
          {/* HEADER */}
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">
                {activeTab === "dashboard"
                  ? "Admin Dashboard"
                  : activeTab === "orders"
                  ? "Orders"
                  : activeTab === "users"
                  ? "Users"
                  : "Admin Requests"}
              </h1>
              <p className="admin-header-sub">
                {activeTab === "dashboard" &&
                  "Track users, menu stock, orders and revenue."}
                {activeTab === "orders" &&
                  "See all orders placed by Campus Hub users."}
                {activeTab === "users" &&
                  "View all registered users of the system."}
                {activeTab === "requests" &&
                  "Approve or reject admin access requests."}
              </p>
            </div>
            <div className="admin-header-right">
              <span className="admin-header-user">Hi, {username}</span>
              {activeTab === "dashboard" && (
                <button
                  className="admin-primary-btn"
                  onClick={openStockModal}
                >
                  Update stock
                </button>
              )}
            </div>
          </header>

          {/* CONTENT */}
          <div className="admin-content">
            {message && <p className="admin-message">{message}</p>}

            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <>
                <div className="admin-stats-row">
                  {/* CARD 1: USERS */}
                  <div className="admin-stat-card">
                    <div className="admin-stat-top">
                      <p className="admin-stat-label">Total users</p>
                      <p className="admin-stat-value">{totalUsers}</p>
                    </div>
                    <div className="admin-donut-wrapper">
                      <div className="admin-donut"></div>
                    </div>
                  </div>

                  {/* CARD 2: MENU ITEMS */}
                  <div className="admin-stat-card">
                    <div className="admin-stat-top">
                      <p className="admin-stat-label">Total menu items</p>
                      <p className="admin-stat-value">{totalItems}</p>
                    </div>
                    <div className="admin-donut-wrapper">
                      <div className="admin-donut"></div>
                    </div>
                  </div>

                  {/* CARD 3: ORDERS + REVENUE */}
                  <div className="admin-stat-card admin-stat-donut">
                    <div className="admin-stat-top">
                      <p className="admin-stat-label">Total orders</p>
                      <p className="admin-stat-value">{totalOrders}</p>
                      <p className="admin-stat-sub">
                        Revenue: Rs. {totalRevenue.toFixed(0)}
                      </p>
                    </div>
                    <div className="admin-donut-wrapper">
                      <div className="admin-donut"></div>
                    </div>
                  </div>
                </div>

                {/* MENU GRID */}
                <h2 className="admin-section-title">Menu items</h2>
                <div className="admin-menu-grid">
                  {items.length === 0 && (
                    <p>No menu items yet. DB items will show here.</p>
                  )}

                  {items.map((item) => (
                    <div className="admin-menu-card" key={item.id}>
                      <div className="admin-menu-image">
                        {/* ⭐ FIXED IMAGE DISPLAY */}
                        <img
                          src={itemImages[item.id] || "/images/default.jpg"}
                          alt={item.name}
                        />
                      </div>
                      <div className="admin-menu-info">
                        <h3 className="admin-menu-name">{item.name}</h3>
                        <p className="admin-menu-meta">
                          {item.category} • Rs. {item.price}
                        </p>
                        <p className="admin-menu-stock">
                          Stock: <strong>{item.stock}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <>
                <h2 className="admin-section-title">All orders</h2>
                {orders.length === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  <table className="admin-orders-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Items</th>
                        <th>Total (Rs)</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.username}</td>
                          <td>{order.items}</td>
                          <td>{order.total_amount}</td>
                          <td>{order.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <>
                <h2 className="admin-section-title">All users</h2>
                {users.length === 0 ? (
                  <p>No users yet.</p>
                ) : (
                  <table className="admin-orders-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* ADMIN REQUESTS TAB */}
            {activeTab === "requests" && (
              <>
                <h2 className="admin-section-title">Admin access requests</h2>
                {requests.length === 0 ? (
                  <p>No requests yet.</p>
                ) : (
                  <table className="admin-orders-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Status</th>
                        <th>Note</th>
                        <th>Requested at</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.username}</td>
                          <td>{r.status}</td>
                          <td>{r.note}</td>
                          <td>{r.created_at}</td>
                          <td>
                            {r.status === "pending" ? (
                              <>
                                <button
                                  className="admin-btn admin-btn-edit"
                                  onClick={() => handleApprove(r.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="admin-btn admin-btn-delete"
                                  onClick={() => handleReject(r.id)}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: "12px" }}>
                                {r.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* STOCK UPDATE MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2 className="admin-modal-title">Update item stock</h2>
            <form className="admin-modal-form" onSubmit={handleSaveStock}>
              <label className="admin-modal-label">
                Select menu item
                <select
                  className="admin-modal-input"
                  value={selectedId}
                  onChange={handleItemChange}
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
              </label>

              {selectedItem && (
                <>
                  <div className="admin-modal-label">
                    Category
                    <div className="admin-modal-read">
                      {selectedItem.category}
                    </div>
                  </div>
                  <div className="admin-modal-label">
                    Price (per unit)
                    <div className="admin-modal-read">
                      Rs. {selectedItem.price}
                    </div>
                  </div>
                </>
              )}

              <label className="admin-modal-label">
                Stock
                <input
                  className="admin-modal-input"
                  type="number"
                  min="0"
                  step="1"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  placeholder="e.g. 10"
                />
              </label>

              <div className="admin-modal-actions">
                <button type="submit" className="admin-primary-btn small">
                  Save
                </button>
                <button
                  type="button"
                  className="admin-secondary-btn small"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
