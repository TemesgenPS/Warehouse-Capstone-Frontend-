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

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px 24px", border: "1px solid #2a2a3d" }}>
      <div style={{ fontSize: "28px", fontWeight: 700, color }}>{value}</div>
      <div style={{ color: "#6b6b8a", fontSize: "13px", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

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

function SalesReport() {
  const today = new Date();
today.setSeconds(59);
const todayStr = today.toISOString().slice(0, 16);
const firstOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 16);

const [start, setStart] = useState(firstOfYear);
const [end, setEnd] = useState(todayStr);
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
  setError("");
  setLoading(true);
  try {
    const fmt = t => new Date(t).toISOString().replace("Z", "");
    const [ordersRes, revenueRes] = await Promise.all([
      API.get(`/orders/report/by-date?start=${fmt(start)}&end=${fmt(end)}`),
      API.get(`/orders/report/revenue?start=${fmt(start)}&end=${fmt(end)}`),
    ]);
    setOrders(ordersRes.data);
    setRevenue(revenueRes.data.totalRevenue);
    setSearched(true);
  } catch {
    setError("Failed to load report. Check your date range.");
  } finally {
    setLoading(false);
  }
}
  const completed = orders.filter(o => o.status === "COMPLETED").length;
  const pending = orders.filter(o => o.status === "PENDING").length;
  const cancelled = orders.filter(o => o.status === "CANCELLED").length;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#e2e2f0" }}>Sales Report</h1>
        <p style={{ color: "#6b6b8a", fontSize: "14px", marginTop: "4px" }}>View revenue and orders within a date range</p>
      </div>

      {/* Date Range Picker */}
      <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#e2e2f0", marginBottom: "16px" }}>Select Date Range</h2>
        {error && (
          <div style={{ background: "#ef444420", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "14px", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Start Date</label>
            <input style={inputStyle} type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>End Date</label>
            <input style={inputStyle} type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <button style={btnPrimary} onClick={handleSearch} disabled={loading}>
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <StatCard label="Total Revenue" value={`$${(revenue ?? 0).toFixed(2)}`} color="#c084fc" />
            <StatCard label="Total Orders" value={orders.length} color="#60a5fa" />
            <StatCard label="Completed" value={completed} color="#34d399" />
            <StatCard label="Pending / Cancelled" value={`${pending} / ${cancelled}`} color="#f59e0b" />
          </div>

          {/* Orders Table */}
          <div style={card}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a3d" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#e2e2f0" }}>
                Orders in Range
                <span style={{ color: "#6b6b8a", fontWeight: 400, fontSize: "13px", marginLeft: "10px" }}>
                  {orders.length} results
                </span>
              </h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a3d" }}>
                  {["Order ID", "User", "Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "#6b6b8a", fontWeight: 500, fontSize: "12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#4a4a6a" }}>
                      No orders found in this date range.
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
                      <td style={{ padding: "14px 20px", color: "#e2e2f0" }}>{order.user?.name ?? "—"}</td>
                      <td style={{ padding: "14px 20px", color: "#8888aa", fontSize: "13px" }}>
                        {order.orderDate ? new Date(order.orderDate).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default SalesReport;