import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const card = {
  background: "#1a1a2e", borderRadius: "12px",
  border: "1px solid #2a2a3d", overflow: "hidden"
};

const inputStyle = {
  background: "#0f0f1a", border: "1px solid #2a2a3d",
  borderRadius: "8px", padding: "10px 14px",
  color: "#e2e2f0", fontSize: "14px", width: "100%"
};

const btnPrimary = {
  background: "#7c3aed", color: "#fff", border: "none",
  borderRadius: "8px", padding: "10px 20px",
  fontSize: "14px", cursor: "pointer", fontWeight: 500
};

const btnDanger = {
  background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440",
  borderRadius: "6px", padding: "6px 12px",
  fontSize: "12px", cursor: "pointer"
};

const btnEdit = {
  background: "#7c3aed20", color: "#c084fc", border: "1px solid #7c3aed40",
  borderRadius: "6px", padding: "6px 12px",
  fontSize: "12px", cursor: "pointer"
};

function StatusBadge({ status }) {
  const colors = {
    PENDING:   { bg: "#f59e0b20", color: "#f59e0b" },
    COMPLETED: { bg: "#34d39920", color: "#34d399" },
    CANCELLED: { bg: "#ef444420", color: "#ef4444" },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <span style={{ background: c.bg, color: c.color, padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
      {status}
    </span>
  );
}

const emptyItem = { productId: "", quantity: 1 };

function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");

  

  function fetchAll() {
    if (isAdmin) {
      API.get("/orders").then(r => setOrders(r.data)).catch(() => {});
    } else {
      API.get(`/orders/user/${user.id}`).then(r => setOrders(r.data)).catch(() => {});
    }
  }

useEffect(() => {
    fetchAll();
    API.get("/products").then(r => setProducts(r.data)).catch(() => {});
    if (isAdmin) {
      API.get("/users").then(r => setUsers(r.data)).catch(() => {});
    }
  }, []);
  
  function addItem() {
    setItems(i => [...i, { ...emptyItem }]);
  }

  function removeItem(index) {
    setItems(i => i.filter((_, idx) => idx !== index));
  }

  function updateItem(index, field, value) {
    setItems(prev => prev.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    ));
  }

  async function handleSubmit() {
    setError("");
    const selectedUserId = isAdmin ? userId : user.id;
    if (!selectedUserId) { setError("Please select a user."); return; }
    if (items.some(i => !i.productId)) { setError("Please select a product for each item."); return; }
    try {
      const payload = {
        user: { id: parseInt(selectedUserId) },
        items: items.map(i => ({
          product: { id: parseInt(i.productId) },
          quantity: parseInt(i.quantity),
        }))
      };
      await API.post("/orders", payload);
      setUserId("");
      setItems([{ ...emptyItem }]);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Check stock levels.");
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await API.patch(`/orders/${id}/status?status=${status}`);
      fetchAll();
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this order?")) return;
    await API.delete(`/orders/${id}`);
    fetchAll();
  }

  function handleCancel() {
    setUserId("");
    setItems([{ ...emptyItem }]);
    setShowForm(false);
    setError("");
  }

  const headers = ["Order ID", "User", "Date", "Status",
    ...(isAdmin ? ["Update Status", "Actions"] : [])];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#e2e2f0" }}>Orders</h1>
          <p style={{ color: "#6b6b8a", fontSize: "14px", marginTop: "4px" }}>
            {isAdmin ? `${orders.length} total orders` : "Your orders"}
          </p>
        </div>
        {!showForm && (
          <button style={btnPrimary} onClick={() => setShowForm(true)}>+ New Order</button>
        )}
      </div>

      {/* New Order Form */}
      {showForm && (
        <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#e2e2f0", marginBottom: "20px" }}>New Order</h2>
          {error && (
            <div style={{ background: "#ef444420", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {/* Admin picks a user, regular user orders as themselves */}
          {isAdmin && (
            <div style={{ marginBottom: "20px", maxWidth: "400px" }}>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>User *</label>
              <select style={inputStyle} value={userId} onChange={e => setUserId(e.target.value)}>
                <option value="">Select user</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
          )}

          {!isAdmin && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", color: "#6b6b8a" }}>
                Ordering as <span style={{ color: "#c084fc" }}>{user.name}</span>
              </p>
            </div>
          )}

          {/* Order items */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "10px" }}>Order Items *</label>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 120px 40px", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <select style={inputStyle} value={item.productId} onChange={e => updateItem(idx, "productId", e.target.value)}>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
                <input
                  style={inputStyle} type="number" min="1"
                  value={item.quantity}
                  onChange={e => updateItem(idx, "quantity", e.target.value)}
                  placeholder="Qty"
                />
                <button
                  onClick={() => removeItem(idx)}
                  style={{ background: "#ef444420", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", height: "40px" }}
                  disabled={items.length === 1}
                >✕</button>
              </div>
            ))}
            <button style={{ ...btnEdit, marginTop: "6px" }} onClick={addItem}>+ Add Item</button>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={handleSubmit}>Place Order</button>
            <button style={{ ...btnPrimary, background: "transparent", border: "1px solid #2a2a3d", color: "#8888aa" }} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a3d" }}>
              {headers.map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#6b6b8a", fontWeight: 500, fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={headers.length} style={{ padding: "40px", textAlign: "center", color: "#4a4a6a" }}>
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: "1px solid #2a2a3d" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "#7c3aed20", color: "#c084fc", padding: "3px 8px", borderRadius: "6px", fontSize: "12px" }}>
                      #{order.id}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#e2e2f0" }}>{order.user?.name ?? user.name}</td>
                  <td style={{ padding: "14px 20px", color: "#8888aa", fontSize: "13px" }}>
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={order.status} />
                  </td>
                  {isAdmin && (
                    <td style={{ padding: "14px 20px" }}>
                      <select
                        style={{ ...inputStyle, width: "150px", padding: "6px 10px", fontSize: "13px" }}
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  )}
                  {isAdmin && (
                    <td style={{ padding: "14px 20px" }}>
                      <button style={btnDanger} onClick={() => handleDelete(order.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;