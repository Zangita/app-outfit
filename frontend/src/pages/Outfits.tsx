import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Avatar from "../components/Avatar";
import type { Garment, Outfit } from "../types";

export default function Outfits() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);

  const garmentById = useMemo(
    () => new Map(garments.map((g) => [g.id, g])),
    [garments]
  );

  const cargar = async () => {
    const [o, g] = await Promise.all([
      api.get<Outfit[]>("/api/outfits/"),
      api.get<Garment[]>("/api/garments/"),
    ]);
    setOutfits(o.data);
    setGarments(g.data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const toggleFavorito = async (o: Outfit) => {
    await api.patch(`/api/outfits/${o.id}/`, { favorite: !o.favorite });
    await cargar();
  };

  const eliminar = async (o: Outfit) => {
    if (!confirm(`¿Eliminar el outfit "${o.name}"?`)) return;
    await api.delete(`/api/outfits/${o.id}/`);
    await cargar();
  };

  return (
    <div className="aparecer">
      <div className="pagina-encabezado">
        <div>
          <h1>Mis outfits 💃</h1>
          <p className="subtitulo">Tus combinaciones guardadas</p>
        </div>
        <Link to="/editor" className="btn btn-primario">＋ Nuevo outfit</Link>
      </div>

      {outfits.length === 0 ? (
        <div className="vacio tarjeta">
          <span className="vacio-emoji">👗</span>
          <p>Todavía no has guardado ningún outfit.</p>
          <p className="nota">Ve a "Crear outfit" y arma tu primera combinación ✨</p>
        </div>
      ) : (
        <div className="grid-outfits">
          {outfits.map((o) => (
            <div key={o.id} className="tarjeta outfit aparecer">
              <Link to={`/editor/${o.id}`} className="outfit-preview" title="Editar outfit">
                <Avatar className="outfit-preview-avatar" />
                {[...o.items]
                  .sort((a, b) => a.z - b.z)
                  .map((item, i) => {
                    const g = garmentById.get(item.garment);
                    if (!g) return null;
                    return (
                      <img
                        key={i}
                        src={g.cutout ?? g.image}
                        alt=""
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: `${item.scale * 100}%`,
                          transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                          zIndex: item.z + 1,
                        }}
                        draggable={false}
                      />
                    );
                  })}
              </Link>
              <div className="outfit-info">
                <strong>{o.name}</strong>
                {o.occasion && <span className="prenda-meta">{o.occasion}</span>}
              </div>
              <div className="prenda-acciones">
                <button
                  className="btn-corazon"
                  title={o.favorite ? "Quitar de favoritos" : "Marcar favorito"}
                  onClick={() => toggleFavorito(o)}
                >
                  {o.favorite ? "💖" : "🤍"}
                </button>
                <Link to={`/editor/${o.id}`} className="btn btn-secundario btn-mini">Editar</Link>
                <button className="btn btn-peligro btn-mini" onClick={() => eliminar(o)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
