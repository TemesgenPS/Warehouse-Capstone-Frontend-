import { useEffect, useState } from "react";
import API from "../api/axios";

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

const emptyForm = { name: "", contactName: "", email: "", phone: "", address: "" };

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  

  function fetchAll() {
    API.get("/suppliers").then(r => setSuppliers(r.data)).catch(() => {});
  }
  
  useEffect(() => { fetchAll(); }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setError("");
    if (!form.name.trim()) { setError("Supplier name is required."); return; }
    try {
      if (editingId) {
        await API.put(`/suppliers/${editingId}`, form);
      } else {
        await API.post("/suppliers", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  }

  function handleEdit(supplier) {
    setForm({
      name: supplier.name,
      contactName: supplier.contactName || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setEditingId(supplier.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this supplier?")) return;
    try {
      await API.delete(`/suppliers/${id}`);
      fetchAll();
    } catch {
      alert("Cannot delete — products are linked to this supplier.");
    }
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#e2e2f0" }}>Suppliers</h1>
          <p style={{ color: "#6b6b8a", fontSize: "14px", marginTop: "4px" }}>{suppliers.length} total suppliers</p>
        </div>
        {!showForm && (
          <button style={btnPrimary} onClick={() => setShowForm(true)}>+ Add Supplier</button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#e2e2f0", marginBottom: "20px" }}>
            {editingId ? "Edit Supplier" : "New Supplier"}
          </h2>
          {error && (
            <div style={{ background: "#ef444420", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Supplier Name *</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handleChange} placeholder="Company name" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Contact Name</label>
              <input style={inputStyle} name="contactName" value={form.contactName} onChange={handleChange} placeholder="John Smith" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Email</label>
              <input style={inputStyle} name="email" value={form.email} onChange={handleChange} placeholder="contact@company.com" type="email" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Phone</label>
              <input style={inputStyle} name="phone" value={form.phone} onChange={handleChange} placeholder="555-1234" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Address</label>
              <input style={inputStyle} name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, City, State" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Create Supplier"}
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
              {["Supplier", "Contact", "Email", "Phone", "Address", "Actions"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#6b6b8a", fontWeight: 500, fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#4a4a6a" }}>
                  No suppliers yet. Add your first one!
                </td>
              </tr>
            ) : (
              suppliers.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #2a2a3d" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "#7c3aed20", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "13px", color: "#c084fc", fontWeight: 600
                      }}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: "#e2e2f0", fontWeight: 500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#8888aa" }}>{s.contactName || "—"}</td>
                  <td style={{ padding: "14px 20px", color: "#60a5fa" }}>{s.email || "—"}</td>
                  <td style={{ padding: "14px 20px", color: "#8888aa" }}>{s.phone || "—"}</td>
                  <td style={{ padding: "14px 20px", color: "#8888aa" }}>{s.address || "—"}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={btnEdit} onClick={() => handleEdit(s)}>Edit</button>
                      <button style={btnDanger} onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Suppliers;
