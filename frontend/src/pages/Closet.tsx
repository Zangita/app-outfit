import { useEffect, useRef, useState } from "react";
import api from "../api";
import { CATEGORY_LABELS, type Category, type Garment } from "../types";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

export default function Closet() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [filtro, setFiltro] = useState<Category | "all">("all");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const cargar = async () => {
    const { data } = await api.get<Garment[]>("/api/garments/");
    setGarments(data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const subir = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubiendo(true);
    try {
      const formData = new FormData(e.currentTarget);
      await api.post("/api/garments/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      formRef.current?.reset();
      setMostrarForm(false);
      await cargar();
    } catch {
      setError("No se pudo guardar la prenda. Revisa la foto e intenta de nuevo 🥺");
    } finally {
      setSubiendo(false);
    }
  };

  const toggleFavorito = async (g: Garment) => {
    await api.patch(`/api/garments/${g.id}/`, { favorite: !g.favorite });
    await cargar();
  };

  const eliminar = async (g: Garment) => {
    if (!confirm(`¿Eliminar "${g.name}" de tu clóset?`)) return;
    await api.delete(`/api/garments/${g.id}/`);
    await cargar();
  };

  const visibles = filtro === "all" ? garments : garments.filter((g) => g.category === filtro);

  return (
    <div className="aparecer">
      <div className="pagina-encabezado">
        <div>
          <h1>Mi clóset 👗</h1>
          <p className="subtitulo">Tus prendas fotografiadas, listas para armar outfits</p>
        </div>
        <button className="btn btn-primario" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Cerrar" : "＋ Nueva prenda"}
        </button>
      </div>

      {mostrarForm && (
        <form ref={formRef} className="tarjeta form-prenda aparecer" onSubmit={subir}>
          <div className="form-prenda-grid">
            <div className="campo">
              <label htmlFor="g-name">Nombre</label>
              <input id="g-name" name="name" maxLength={100} placeholder="Blusa floreada" required />
            </div>
            <div className="campo">
              <label htmlFor="g-category">Categoría</label>
              <select id="g-category" name="category" required>
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="g-color">Color</label>
              <input id="g-color" name="color" maxLength={50} placeholder="Negro con flores" />
            </div>
            <div className="campo">
              <label htmlFor="g-image">Foto de la prenda</label>
              <input id="g-image" name="image" type="file" accept="image/*" required />
            </div>
          </div>
          <p className="nota">
            📸 Tip: extiende la prenda sobre una superficie lisa y con buena luz.
            El fondo se recorta solito ✨ (tarda unos segunditos).
          </p>
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primario" disabled={subiendo}>
            {subiendo ? "Recortando el fondo… ✂️✨" : "Guardar prenda 💕"}
          </button>
        </form>
      )}

      <div className="filtros">
        <button
          className={`chip ${filtro === "all" ? "chip-activo" : ""}`}
          onClick={() => setFiltro("all")}
        >
          Todas ({garments.length})
        </button>
        {CATEGORIES.map(([value, label]) => {
          const n = garments.filter((g) => g.category === value).length;
          if (n === 0) return null;
          return (
            <button
              key={value}
              className={`chip ${filtro === value ? "chip-activo" : ""}`}
              onClick={() => setFiltro(value)}
            >
              {label} ({n})
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <div className="vacio tarjeta">
          <span className="vacio-emoji">🩷</span>
          <p>Tu clóset está esperando su primera prenda.</p>
          <p className="nota">Tómale una foto a algo que ames y súbelo con "＋ Nueva prenda".</p>
        </div>
      ) : (
        <div className="grid-prendas">
          {visibles.map((g) => (
            <div key={g.id} className="tarjeta prenda aparecer">
              <div className="prenda-imagen">
                <img src={g.cutout ?? g.image} alt={g.name} loading="lazy" />
              </div>
              <div className="prenda-info">
                <strong>{g.name}</strong>
                <span className="prenda-meta">
                  {CATEGORY_LABELS[g.category]}{g.color ? ` · ${g.color}` : ""}
                </span>
              </div>
              <div className="prenda-acciones">
                <button
                  className="btn-corazon"
                  title={g.favorite ? "Quitar de favoritas" : "Marcar favorita"}
                  onClick={() => toggleFavorito(g)}
                >
                  {g.favorite ? "💖" : "🤍"}
                </button>
                <button className="btn btn-peligro btn-mini" onClick={() => eliminar(g)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
