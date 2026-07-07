import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setTokens } from "../api";
import Avatar from "../components/Avatar";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const { data } = await axios.post("/api/auth/login/", { username, password });
      setTokens(data.access, data.refresh);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError("Demasiados intentos, espera un minutito 💗");
      } else {
        setError("Usuario o contraseña incorrectos 🥺");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pagina">
      <span className="destello" style={{ top: "12%", left: "12%", fontSize: "1.6rem" }}>✨</span>
      <span className="destello" style={{ top: "20%", right: "15%", fontSize: "1.2rem", animationDelay: "0.9s" }}>💖</span>
      <span className="destello" style={{ bottom: "18%", left: "18%", fontSize: "1.3rem", animationDelay: "1.6s" }}>🌸</span>
      <span className="destello" style={{ bottom: "12%", right: "12%", fontSize: "1.5rem", animationDelay: "0.4s" }}>✨</span>

      <div className="tarjeta login-tarjeta aparecer">
        <div className="login-avatar">
          <Avatar className="login-avatar-svg" />
        </div>
        <h1 className="titulo-script login-titulo">Clóset de Kenyi</h1>
        <p className="login-subtitulo">Tu probador mágico 🎀</p>

        <form onSubmit={entrar}>
          <div className="campo">
            <label htmlFor="username">Usuaria</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primario login-boton" disabled={cargando}>
            {cargando ? "Entrando…" : "Entrar 💕"}
          </button>
        </form>
      </div>
    </div>
  );
}
