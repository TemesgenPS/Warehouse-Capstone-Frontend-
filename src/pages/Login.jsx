import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const inputStyle = {
  background: "#0f0f1a", border: "1px solid #2a2a3d",
  borderRadius: "8px", padding: "10px 14px",
  color: "#e2e2f0", fontSize: "14px", width: "100%"
};

const btnPrimary = {
  background: "#7c3aed", color: "#fff", border: "none",
  borderRadius: "8px", padding: "12px 20px",
  fontSize: "14px", cursor: "pointer", fontWeight: 500, width: "100%"
};

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f1a",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#1a1a2e", borderRadius: "16px",
        border: "1px solid #2a2a3d", padding: "40px",
        width: "100%", maxWidth: "400px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M4 5h16" />
            </svg>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#e2e2f0" }}>Inventory System</h1>
          <p style={{ color: "#6b6b8a", fontSize: "14px", marginTop: "4px" }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ background: "#ef444420", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Email</label>
          <input style={inputStyle} type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="you@example.com" />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "12px", color: "#6b6b8a", display: "block", marginBottom: "6px" }}>Password</label>
          <input style={inputStyle} type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••" />
        </div>

        <button style={btnPrimary} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}

export default Login;