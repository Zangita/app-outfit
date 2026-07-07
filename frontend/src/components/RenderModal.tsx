import { useState } from "react";
import axios from "axios";
import api from "../api";
import type { Outfit, OutfitRender } from "../types";

interface Props {
  outfit: Outfit;
  onClose: () => void;
  onRendersChange: () => void;
}

/** Modal del "probador realista": genera y muestra los renders IA de un outfit. */
export default function RenderModal({ outfit, onClose, onRendersChange }: Props) {
  const [renders, setRenders] = useState<OutfitRender[]>(outfit.renders);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  const generar = async () => {
    setGenerando(true);
    setError("");
    try {
      const { data } = await api.post<OutfitRender>(`/api/outfits/${outfit.id}/render/`);
      setRenders((prev) => [data, ...prev]);
      onRendersChange();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("No se pudo generar la imagen 🥺 Intenta de nuevo.");
      }
    } finally {
      setGenerando(false);
    }
  };

  const eliminar = async (r: OutfitRender) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    await api.delete(`/api/outfits/${outfit.id}/renders/${r.id}/`);
    setRenders((prev) => prev.filter((x) => x.id !== r.id));
    onRendersChange();
  };

  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal tarjeta aparecer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-encabezado">
          <h2>✨ {outfit.name}</h2>
          <button className="modal-cerrar" onClick={onClose} title="Cerrar">✕</button>
        </div>

        <p className="nota">
          La IA genera una foto tuya usando este outfit. Cada intento puede salir
          un poquito distinto: si no te convence, genera otra ✨
        </p>

        <button className="btn btn-primario" onClick={generar} disabled={generando}>
          {generando ? "Creando la magia… 🪄 (10-30 seg)" : renders.length ? "Generar otra versión ✨" : "Ver cómo me queda 💖"}
        </button>

        {error && <p className="login-error">{error}</p>}

        {renders.length > 0 && (
          <div className="renders-galeria">
            {renders.map((r) => (
              <figure key={r.id} className="render-item">
                <a href={r.image} target="_blank" rel="noreferrer" title="Ver en grande">
                  <img src={r.image} alt={`Render de ${outfit.name}`} />
                </a>
                <figcaption>
                  {new Date(r.created_at).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })}
                  <button className="btn btn-peligro btn-mini" onClick={() => eliminar(r)}>Eliminar</button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
