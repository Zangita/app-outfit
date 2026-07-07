import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { clearTokens, getAccessToken } from "./api";
import Login from "./pages/Login";
import Closet from "./pages/Closet";
import Editor from "./pages/Editor";
import Outfits from "./pages/Outfits";
import MiFoto from "./pages/MiFoto";
import "./App.css";

function Protected({ children }: { children: ReactNode }) {
  if (!getAccessToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Nav() {
  const navigate = useNavigate();

  const salir = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <header className="nav">
      <Link to="/" className="nav-logo titulo-script">
        Clóset de Kenyi <span className="latido">🎀</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Mi clóset</NavLink>
        <NavLink to="/editor">Crear outfit</NavLink>
        <NavLink to="/outfits">Mis outfits</NavLink>
        <NavLink to="/foto">Mi foto</NavLink>
        <button className="btn btn-secundario btn-mini" onClick={salir}>Salir</button>
      </nav>
    </header>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <Nav />
      <main className="contenido">{children}</main>
    </Protected>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Closet /></Layout>} />
        <Route path="/editor" element={<Layout><Editor /></Layout>} />
        <Route path="/editor/:outfitId" element={<Layout><Editor /></Layout>} />
        <Route path="/outfits" element={<Layout><Outfits /></Layout>} />
        <Route path="/foto" element={<Layout><MiFoto /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
