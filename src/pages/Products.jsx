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

const emptyForm = {
  name: "", sku: "", price: "", description: "",
  category: { id: "" }, supplier: { id: "" }
};

function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // 👇 Search and filter state — lives here, not in a sub-component
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");

  // 👇 Derived filtered list — no extra list needed
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? p.category?.id === parseInt(filterCategory) : true;
    const matchesSupplier = filterSupplier ? p.supplier?.id === parseInt(filterSupplier) : true;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  

  function fetchAll() {
    API.get("/products").then(r => setProducts(r.data)).catch(() => {});
  }

useEffect(() => {
    fetchAll();
    API.get("/categories").then(r => setCategories(r.data)).catch(() => {});
    API.get("/suppliers").then(r => setSuppliers(r.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "categoryId") {
      setForm(f => ({ ...f, category: { id: value } }));
    } else if (name === "supplierId") {
      setForm(f => ({ ...f, supplier: { id: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit() {
    setError("");
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        category: form.category.id ? { id: parseInt(form.category.id) } : null,
        supplier: form.supplier.id ? { id: parseInt(form.supplier.id) } : null,
      };
      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
      } else {
        await API.post("/products", payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  }

  function handleEdit(product) {
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      description: product.description || "",
      category: { id: product.category?.id || "" },
      supplier: { id: product.supplier?.id || "" },
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    fetchAll();
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#e2e2f0" }}>Products</h1>
          <p style={{ color: "#6b6b8a", fontSize: "14px", marginTop: "4px" }}>
            {filteredProducts.length} of {products.length} products
          </p>
        </div>
        {isAdmin && !showForm && (
          <button style={btnPrimary} onClick={() => setShowForm(true)}>+ Add Product</button>
        )}
      </div>

      {/* Search and filter bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <input
          style={inputStyle}
          placeholder="Search by name or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={inputStyle} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={inputStyle} value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
          <option value="">All suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Form — admin only */}
      {isAdmin && showForm && (
        <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#e2e2f0", marginBottom: "20px" }}>
            {editingId ? "Edit Product" : "New Product"}
          </h2>
          {error && (
            <div style={{ background: "#ef444420", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Name</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>SKU</label>
              <input style={inputStyle} name="sku" value={form.sku} onChange={handleChange} placeholder="LAP-001" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Price</label>
              <input style={inputStyle} name="price" value={form.price} onChange={handleChange} placeholder="0.00" type="number" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Category</label>
              <select style={inputStyle} name="categoryId" value={form.category.id} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Supplier</label>
              <select style={inputStyle} name="supplierId" value={form.supplier.id} onChange={handleChange}>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Description</label>
              <input style={inputStyle} name="description" value={form.description} onChange={handleChange} placeholder="Optional description" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Create Product"}
            </button>
            <button style={{ ...btnPrimary, background: "transparent", border: "1px solid #2a2a3d", color: "#8888aa" }} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table — uses filteredProducts not products */}
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a3d" }}>
              {["Name", "SKU", "Price", "Category", "Supplier", ...(isAdmin ? ["Actions"] : [])].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#6b6b8a", fontWeight: 500, fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ padding: "40px", textAlign: "center", color: "#4a4a6a" }}>
                  {products.length === 0 ? "No products yet. Add your first one!" : "No products match your search."}
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #2a2a3d" }}>
                  <td style={{ padding: "14px 20px", color: "#e2e2f0", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "#7c3aed20", color: "#c084fc", padding: "3px 8px", borderRadius: "6px", fontSize: "12px" }}>
                      {p.sku}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#34d399" }}>${parseFloat(p.price).toFixed(2)}</td>
                  <td style={{ padding: "14px 20px", color: "#8888aa" }}>{p.category?.name || "—"}</td>
                  <td style={{ padding: "14px 20px", color: "#8888aa" }}>{p.supplier?.name || "—"}</td>
                  {isAdmin && (
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={btnEdit} onClick={() => handleEdit(p)}>Edit</button>
                        <button style={btnDanger} onClick={() => handleDelete(p.id)}>Delete</button>
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

export default Products;