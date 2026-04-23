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

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

 

  function fetchAll() {
    API.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  }

 useEffect(() => { fetchAll(); }, []);

  async function handleSubmit() {
    setError("");
    if (!form.name.trim()) { setError("Category name is required."); return; }
    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, form);
      } else {
        await API.post("/categories", form);
      }
      setForm({ name: "" });
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  }

  function handleEdit(category) {
    setForm({ name: category.name });
    setEditingId(category.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      fetchAll();
    } catch {
      alert("Cannot delete — products are linked to this category.");
    }
  }

  function handleCancel() {
    setForm({ name: "" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#e2e2f0" }}>Categories</h1>
          <p style={{ color: "#6b6b8a", fontSize: "14px", marginTop: "4px" }}>{categories.length} total categories</p>
        </div>
        {!showForm && (
          <button style={btnPrimary} onClick={() => setShowForm(true)}>+ Add Category</button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#e2e2f0", marginBottom: "20px" }}>
            {editingId ? "Edit Category" : "New Category"}
          </h2>
          {error && (
            <div style={{ background: "#ef444420", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          <div style={{ maxWidth: "400px" }}>
            <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Category Name</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              placeholder="e.g. Electronics"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Create Category"}
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
              {["ID", "Name", "Actions"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#6b6b8a", fontWeight: 500, fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#4a4a6a" }}>
                  No categories yet. Add your first one!
                </td>
              </tr>
            ) : (
              categories.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #2a2a3d" }}>
                  <td style={{ padding: "14px 20px", color: "#4a4a6a", fontSize: "13px" }}>#{c.id}</td>
                  <td style={{ padding: "14px 20px", color: "#e2e2f0", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        background: "#7c3aed20", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "12px", color: "#c084fc", fontWeight: 600
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      {c.name}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={btnEdit} onClick={() => handleEdit(c)}>Edit</button>
                      <button style={btnDanger} onClick={() => handleDelete(c.id)}>Delete</button>
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

export default Categories;