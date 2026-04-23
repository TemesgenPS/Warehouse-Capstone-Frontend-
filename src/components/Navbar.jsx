import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const allLinks = [
  { to: "/dashboard",    label: "Dashboard",    adminOnly: false, d: "M3 12l9-9 9 9M5 10v9h5v-5h4v5h5v-9" },
  { to: "/products",     label: "Products",     adminOnly: false, d: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 5h16" },
  { to: "/categories",   label: "Categories",   adminOnly: true,  d: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { to: "/suppliers",    label: "Suppliers",    adminOnly: true,  d: "M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 4h2l2.5 10h9L19 8H7" },
  { to: "/inventory",    label: "Inventory",    adminOnly: true,  d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" },
  { to: "/orders",       label: "Orders",       adminOnly: false, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { to: "/sales-report", label: "Sales Report", adminOnly: true,  d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

function Icon({ d }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";
  const links = allLinks.filter(l => !l.adminOnly || isAdmin);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{
      width: "240px", height: "100vh", background: "#0a0a14",
      position: "fixed", top: 0, left: 0,
      display: "flex", flexDirection: "column",
      borderRight: "1px solid #1e1e30", zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #1e1e30" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "9px",
            background: "#6d28d9",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M4 5h16" />
            </svg>
          </div>
          <div>
            <div style={{ color: "#e2e2f0", fontWeight: 600, fontSize: "13px" }}>Inventory</div>
            <div style={{ color: "#3a3a55", fontSize: "10px", marginTop: "1px" }}>Management System</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: "9px", color: "#4a4a6a", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px", fontWeight: 600 }}>
          Navigation
        </div>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 12px", borderRadius: "8px", marginBottom: "1px",
            color: isActive ? "#a78bfa" : "#7a7a9a",
            background: isActive ? "#1a1428" : "transparent",
            textDecoration: "none", fontSize: "13px",
            fontWeight: isActive ? 500 : 400,
            transition: "all 0.15s",
            border: isActive ? "1px solid #2a1f4a" : "1px solid transparent",
          })}
            onMouseEnter={e => { if (!e.currentTarget.style.background.includes("1a1428")) e.currentTarget.style.color = "#a78bfa"; }}
            onMouseLeave={e => { if (!e.currentTarget.style.background.includes("1a1428")) e.currentTarget.style.color = "#7a7a9a"; }}
          >
            <Icon d={link.d} />
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* User section */}
      <div style={{ padding: "12px", borderTop: "1px solid #1e1e30" }}>
        <div style={{
          background: "#1a1428", border: "1px solid #2a1f4a",
          borderRadius: "10px", padding: "10px 12px",
          display: "flex", alignItems: "center", gap: "10px",
          marginBottom: "10px"
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "#6d28d9", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "12px", color: "#fff",
            fontWeight: 600, flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#c4b5fd", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
            <div style={{ color: "#4a2a8a", fontSize: "10px" }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", background: "transparent",
          color: "#3a3a55", border: "1px solid #1e1e30",
          borderRadius: "8px", padding: "8px",
          fontSize: "12px", cursor: "pointer",
          transition: "all 0.15s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ef444415"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef444430"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3a3a55"; e.currentTarget.style.borderColor = "#1e1e30"; }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Navbar;