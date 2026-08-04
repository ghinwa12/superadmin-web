import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function AppLayout() {
  const { session, loading, isSuperadmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <p>Loading…</p>
      </div>
    );
  }

  if (!session || !isSuperadmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="brand">Clinic Control</h1>
        <p className="brand-sub">Superadmin console</p>
        <NavLink
          to="/verifications"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Verifications
        </NavLink>
        <NavLink
          to="/doctors"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Doctors
        </NavLink>
        <button type="button" className="btn secondary" style={{ marginTop: 24 }} onClick={() => signOut()}>
          Sign out
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
