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

const emptyForm = { productId: "", quantity: "", reorderLevel: "" };

function StockBadge({ quantity, reorderLevel }) {
  const isLow = quantity <= reorderLevel;
  return (
    <span style={{
      background: isLow ? "#ef444420" : "#34d39920",
      color: isLow ? "#ef4444" : "#34d399",
      border: `1px solid ${isLow ? "#ef444440" : "#34d39940"}`,
      padding: "4px 10px", borderRadius: "20px", fontSize: "12px"
    }}>
      {isLow ? "Low Stock" : "In Stock"}
    </span>
  );
}

function Inventory() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [quickEdit, setQuickEdit] = useState(null);
  const [quickQty, setQuickQty] = useState("");
  const [error, setError] = useState("");

  

  function fetchAll() {
    API.get("/inventory").then(r => setInventory(r.data)).catch(() => {});
  }
  
  useEffect(() => {
    fetchAll();
    API.get("/products").then(r => setProducts(r.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setError("");
    if (!form.productId) { setError("Please select a product."); return; }
    if (form.quantity === "") { setError("Quantity is required."); return; }
    if (form.reorderLevel === "") { setError("Reorder level is required."); return; }
    try {
      const payload = {
        quantity: parseInt(form.quantity),
        reorderLevel: parseInt(form.reorderLevel),
        product: { id: parseInt(form.productId) }
      };
      if (editingId) {
        await API.put(`/inventory/${editingId}`, payload);
      } else {
        await API.post("/inventory", payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  }

  function handleEdit(item) {
    setForm({
      productId: item.product?.id || "",
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleQuickUpdate(id) {
    if (quickQty === "") return;
    try {
      await API.patch(`/inventory/${id}/quantity?quantity=${quickQty}`);
      setQuickEdit(null);
      setQuickQty("");
      fetchAll();
    } catch {
      alert("Failed to update quantity.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this inventory record?")) return;
    await API.delete(`/inventory/${id}`);
    fetchAll();
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  const lowStockCount = inventory.filter(i => i.quantity <= i.reorderLevel).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#e2e2f0" }}>Inventory</h1>
          <p style={{ color: "#6b6b8a", fontSize: "14px", marginTop: "4px" }}>
            {inventory.length} items
            {lowStockCount > 0 && <span style={{ color: "#ef4444" }}> · {lowStockCount} low stock</span>}
          </p>
        </div>
        {isAdmin && !showForm && (
          <button style={btnPrimary} onClick={() => setShowForm(true)}>+ Add Inventory</button>
        )}
      </div>

      {/* Form — admin only */}
      {isAdmin && showForm && (
        <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#e2e2f0", marginBottom: "20px" }}>
            {editingId ? "Edit Inventory" : "New Inventory Record"}
          </h2>
          {error && (
            <div style={{ background: "#ef444420", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Product *</label>
              <select style={inputStyle} name="productId" value={form.productId} onChange={handleChange} disabled={!!editingId}>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Quantity *</label>
              <input style={inputStyle} name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="0" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Reorder Level *</label>
              <input style={inputStyle} name="reorderLevel" type="number" value={form.reorderLevel} onChange={handleChange} placeholder="10" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Create Record"}
            </button>
            <button style={{ ...btnPrimary, background: "transparent", border: "1px solid #2a2a3d", color: "#8888aa" }} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a3d" }}>
              {["Product", "SKU", "Quantity", "Reorder Level", "Status", ...(isAdmin ? ["Actions"] : [])].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#6b6b8a", fontWeight: 500, fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ padding: "40px", textAlign: "center", color: "#4a4a6a" }}>
                  No inventory records yet.
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid #2a2a3d" }}>
                  <td style={{ padding: "14px 20px", color: "#e2e2f0", fontWeight: 500 }}>
                    {item.product?.name ?? `Product #${item.id}`}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "#7c3aed20", color: "#c084fc", padding: "3px 8px", borderRadius: "6px", fontSize: "12px" }}>
                      {item.product?.sku ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    {isAdmin && quickEdit === item.id ? (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <input
                          style={{ ...inputStyle, width: "80px", padding: "6px 10px" }}
                          type="number" value={quickQty}
                          onChange={e => setQuickQty(e.target.value)}
                          autoFocus
                        />
                        <button style={{ ...btnPrimary, padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleQuickUpdate(item.id)}>Save</button>
                        <button style={{ ...btnEdit, color: "#8888aa" }}
                          onClick={() => { setQuickEdit(null); setQuickQty(""); }}>✕</button>
                      </div>
                    ) : (
                      <span
                        style={{
                          color: item.quantity <= item.reorderLevel ? "#ef4444" : "#e2e2f0",
                          fontWeight: 600,
                          cursor: isAdmin ? "pointer" : "default"
                        }}
                        title={isAdmin ? "Click to quick-edit" : ""}
                        onClick={isAdmin ? () => { setQuickEdit(item.id); setQuickQty(item.quantity); } : undefined}
                      >
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#8888aa" }}>{item.reorderLevel}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <StockBadge quantity={item.quantity} reorderLevel={item.reorderLevel} />
                  </td>
                  {isAdmin && (
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={btnEdit} onClick={() => handleEdit(item)}>Edit</button>
                        <button style={btnDanger} onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
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

export default Inventory;