import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";

function StatCard({ label, value, color, accent, icon, to }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#1e1e30";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        background: "#0f0f1c", borderRadius: "14px",
        padding: "20px", border: "1px solid #1e1e30",
        cursor: "pointer", transition: "all 0.2s",
        position: "relative", overflow: "hidden"
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: accent, borderRadius: "14px 14px 0 0"
      }} />
      <div style={{
        position: "absolute", top: "16px", right: "16px",
        width: "34px", height: "34px", borderRadius: "9px",
        background: `${accent}18`, display: "flex", alignItems: "center",
        justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 700, color, lineHeight: 1, marginTop: "8px" }}>{value}</div>
      <div style={{ color: "#4a4a6a", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: "#0f0f1c", borderRadius: "14px",
      border: "1px solid #1e1e30", padding: "20px 24px"
    }}>
      <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#a78bfa", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#13131f", border: "1px solid #2a2a3d", borderRadius: "8px", fontSize: "12px" },
  labelStyle: { color: "#a78bfa" },
  itemStyle: { color: "#e2e2f0" }
};

const STATUS_COLORS = {
  COMPLETED: "#34d399",
  PENDING: "#fbbf24",
  CANCELLED: "#ef4444"
};

function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [lowStock, setLowStock] = useState([]);
  const [counts, setCounts] = useState({ products: 0, suppliers: 0, categories: 0, orders: 0 });

  // Admin chart data
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topStockData, setTopStockData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  // User chart data
  const [userOrderStatus, setUserOrderStatus] = useState([]);
  const [productStockData, setProductStockData] = useState([]);

  useEffect(() => {
    // Shared
    API.get("/products").then(r => {
      setCounts(c => ({ ...c, products: r.data.length }));
      // Top 5 stocked products for user view
      const stockData = r.data.slice(0, 6).map(p => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
        price: parseFloat(p.price)
      }));
      setProductStockData(stockData);
    }).catch(() => {});

    API.get("/orders").then(r => {
      setCounts(c => ({ ...c, orders: r.data.length }));
      const orders = r.data;

      // Order status breakdown — all orders
      const statusCount = { PENDING: 0, COMPLETED: 0, CANCELLED: 0 };
      orders.forEach(o => { if (statusCount[o.status] !== undefined) statusCount[o.status]++; });
      setOrderStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // User's own orders breakdown
      const myOrders = orders.filter(o => o.user?.id === user.id || o.userName === user.name);
      const myStatus = { PENDING: 0, COMPLETED: 0, CANCELLED: 0 };
      myOrders.forEach(o => { if (myStatus[o.status] !== undefined) myStatus[o.status]++; });
      setUserOrderStatus(Object.entries(myStatus).map(([name, value]) => ({ name, value })));

    }).catch(() => {});

    if (isAdmin) {
      API.get("/inventory/low-stock").then(r => setLowStock(r.data)).catch(() => {});
      API.get("/suppliers").then(r => setCounts(c => ({ ...c, suppliers: r.data.length }))).catch(() => {});
      API.get("/categories").then(r => setCounts(c => ({ ...c, categories: r.data.length }))).catch(() => {});

      // Top stocked inventory items
      API.get("/inventory").then(r => {
        const sorted = [...r.data]
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 6)
          .map(i => ({
            name: i.product?.name
              ? (i.product.name.length > 12 ? i.product.name.slice(0, 12) + "…" : i.product.name)
              : `#${i.id}`,
            quantity: i.quantity,
            reorderLevel: i.reorderLevel
          }));
        setTopStockData(sorted);
      }).catch(() => {});

      // Revenue trend — last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().replace("Z", "");
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString().replace("Z", "");
        const label = d.toLocaleString("default", { month: "short" });
        months.push({ label, start, end });
      }

      Promise.all(
        months.map(m =>
          API.get(`/orders/report/revenue?start=${m.start}&end=${m.end}`)
            .then(r => ({ month: m.label, revenue: parseFloat((r.data.totalRevenue || 0).toFixed(2)) }))
            .catch(() => ({ month: m.label, revenue: 0 }))
        )
      ).then(setRevenueData);
    }
  }, []);

  const iconProps = { width: 18, height: 18, fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

  const adminCards = [
    {
      label: "Total Products", value: counts.products,
      color: "#a78bfa", accent: "#7c3aed", to: "/products",
      icon: <svg {...iconProps} stroke="#a78bfa" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M4 5h16"/></svg>
    },
    {
      label: "Suppliers", value: counts.suppliers,
      color: "#60a5fa", accent: "#3b82f6", to: "/suppliers",
      icon: <svg {...iconProps} stroke="#60a5fa" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 4h2l2.5 10h9L19 8H7"/></svg>
    },
    {
      label: "Categories", value: counts.categories,
      color: "#34d399", accent: "#10b981", to: "/categories",
      icon: <svg {...iconProps} stroke="#34d399" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
    },
    {
      label: "Orders", value: counts.orders,
      color: "#fbbf24", accent: "#f59e0b", to: "/orders",
      icon: <svg {...iconProps} stroke="#fbbf24" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    },
  ];

  const userCards = [
    {
      label: "Total Products", value: counts.products,
      color: "#a78bfa", accent: "#7c3aed", to: "/products",
      icon: <svg {...iconProps} stroke="#a78bfa" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M4 5h16"/></svg>
    },
    {
      label: "My Orders", value: counts.orders,
      color: "#fbbf24", accent: "#f59e0b", to: "/orders",
      icon: <svg {...iconProps} stroke="#fbbf24" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    },
  ];

  const cards = isAdmin ? adminCards : userCards;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#e2e2f0" }}>Dashboard</h1>
          {isAdmin && lowStock.length > 0 && (
            <span style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444430", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 500 }}>
              {lowStock.length} low stock
            </span>
          )}
        </div>
        <p style={{ color: "#4a4a6a", fontSize: "14px" }}>
          Welcome back, <span style={{ color: "#a78bfa" }}>{user?.name}</span>. Here's what's happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: "14px", marginBottom: "28px" }}>
        {cards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      {/* ── ADMIN CHARTS ── */}
      {isAdmin && (
        <>
          {/* Row 1 — Revenue + Order Status */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <ChartCard title="Revenue — Last 6 Months">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueData}>
                  <CartesianGrid stroke="#1e1e30" strokeDasharray="4 4" />
                  <XAxis dataKey="month" tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip {...tooltipStyle} formatter={v => [`$${v}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: "#a78bfa", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Orders by Status">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {orderStatusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#7c3aed"} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend formatter={v => <span style={{ color: "#7a7a9a", fontSize: "11px" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2 — Stock levels */}
          <div style={{ marginBottom: "28px" }}>
            <ChartCard title="Top Stocked Items">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topStockData} barSize={28}>
                  <CartesianGrid stroke="#1e1e30" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="quantity" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Quantity" />
                  <Bar dataKey="reorderLevel" fill="#ef444440" radius={[6, 6, 0, 0]} name="Reorder Level" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Low Stock Alerts */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#e2e2f0" }}>Low Stock Alerts</h2>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ background: "#0f0f1c", border: "1px solid #1e1e30", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
              <span style={{ color: "#34d399", fontSize: "14px" }}>All items are sufficiently stocked</span>
            </div>
          ) : (
            <div style={{ background: "#0f0f1c", border: "1px solid #1e1e30", borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#ef444410", borderBottom: "1px solid #ef444420" }}>
                    {["Product", "Quantity", "Reorder Level", "Status"].map(h => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#ef4444", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(item => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #1e1e30" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#ffffff05"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 20px", color: "#e2e2f0", fontWeight: 500 }}>{item.product?.name ?? `Product #${item.id}`}</td>
                      <td style={{ padding: "14px 20px", color: "#ef4444", fontWeight: 700, fontSize: "15px" }}>{item.quantity}</td>
                      <td style={{ padding: "14px 20px", color: "#4a4a6a" }}>{item.reorderLevel}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ background: "#ef444418", color: "#ef4444", border: "1px solid #ef444430", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500 }}>
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── USER CHARTS ── */}
      {!isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <ChartCard title="My Orders by Status">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={userOrderStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {userOrderStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || "#7c3aed"} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend formatter={v => <span style={{ color: "#7a7a9a", fontSize: "11px" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Product Price Overview">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productStockData} barSize={28}>
                <CartesianGrid stroke="#1e1e30" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip {...tooltipStyle} formatter={v => [`$${v}`, "Price"]} />
                <Bar dataKey="price" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Price" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

export default Dashboard;