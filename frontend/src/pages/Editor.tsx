import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import Avatar from "../components/Avatar";
import { CATEGORY_LABELS, type Garment, type Outfit, type OutfitItem } from "../types";

let layerKey = 0;

interface Layer extends OutfitItem {
  key: number;
}

export default function Editor() {
  const { outfitId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [garments, setGarments] = useState<Garment[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [ocasion, setOcasion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const garmentById = useMemo(
    () => new Map(garments.map((g) => [g.id, g])),
    [garments]
  );

  useEffect(() => {
    (async () => {
      const { data } = await api.get<Garment[]>("/api/garments/");
      setGarments(data);
      if (outfitId) {
        const { data: outfit } = await api.get<Outfit>(`/api/outfits/${outfitId}/`);
        setNombre(outfit.name);
        setOcasion(outfit.occasion);
        setLayers(outfit.items.map((item) => ({ ...item, key: ++layerKey })));
      }
    })();
  }, [outfitId]);

  const agregar = (g: Garment) => {
    const z = layers.length ? Math.max(...layers.map((l) => l.z)) + 1 : 0;
    const layer: Layer = {
      key: ++layerKey,
      garment: g.id,
      x: 50,
      y: g.category === "shoes" ? 88 : g.category === "bottom" ? 55 : 40,
      scale: g.category === "accessory" ? 0.2 : 0.45,
      rotation: 0,
      z,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedKey(layer.key);
  };

  const actualizar = useCallback((key: number, cambios: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => (l.key === key ? { ...l, ...cambios } : l)));
  }, []);

  const quitar = (key: number) => {
    setLayers((prev) => prev.filter((l) => l.key !== key));
    if (selectedKey === key) setSelectedKey(null);
  };

  const mover = (key: number, direccion: 1 | -1) => {
    setLayers((prev) => {
      const ordenadas = [...prev].sort((a, b) => a.z - b.z);
      const idx = ordenadas.findIndex((l) => l.key === key);
      const destino = idx + direccion;
      if (destino < 0 || destino >= ordenadas.length) return prev;
      [ordenadas[idx], ordenadas[destino]] = [ordenadas[destino], ordenadas[idx]];
      return ordenadas.map((l, i) => ({ ...l, z: i }));
    });
  };

  const onPointerDown = (e: React.PointerEvent, layer: Layer) => {
    e.preventDefault();
    setSelectedKey(layer.key);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = layer.x;
    const origY = layer.y;

    const onMove = (ev: PointerEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      actualizar(layer.key, {
        x: Math.min(105, Math.max(-5, origX + dx)),
        y: Math.min(105, Math.max(-5, origY + dy)),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      setMensaje("Ponle un nombre a tu outfit 💕");
      return;
    }
    if (layers.length === 0) {
      setMensaje("Agrega al menos una prenda ✨");
      return;
    }
    setGuardando(true);
    setMensaje("");
    try {
      const payload = {
        name: nombre.trim(),
        occasion: ocasion.trim(),
        items: layers.map(({ key: _key, ...item }) => item),
      };
      if (outfitId) {
        await api.put(`/api/outfits/${outfitId}/`, payload);
      } else {
        await api.post("/api/outfits/", payload);
      }
      navigate("/outfits");
    } catch {
      setMensaje("No se pudo guardar 🥺 Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const seleccionada = layers.find((l) => l.key === selectedKey) ?? null;
  const ordenadas = [...layers].sort((a, b) => a.z - b.z);

  return (
    <div className="editor aparecer">
      <div className="editor-lienzo-columna">
        <div className="editor-lienzo tarjeta" ref={canvasRef}>
          <span className="destello" style={{ top: "4%", left: "6%", fontSize: "1.2rem" }}>✨</span>
          <span className="destello" style={{ top: "10%", right: "8%", fontSize: "1rem", animationDelay: "1.2s" }}>💖</span>
          <Avatar className="editor-avatar" />
          {ordenadas.map((layer) => {
            const g = garmentById.get(layer.garment);
            if (!g) return null;
            return (
              <img
                key={layer.key}
                src={g.cutout ?? g.image}
                alt={g.name}
                className={`capa ${layer.key === selectedKey ? "capa-activa" : ""}`}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  width: `${layer.scale * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                  zIndex: layer.z + 1,
                }}
                onPointerDown={(e) => onPointerDown(e, layer)}
                draggable={false}
              />
            );
          })}
        </div>

        {seleccionada && (
          <div className="tarjeta editor-controles aparecer">
            <strong>{garmentById.get(seleccionada.garment)?.name}</strong>
            <div className="control">
              <label>Tamaño</label>
              <input
                type="range"
                min="0.08"
                max="1.2"
                step="0.01"
                value={seleccionada.scale}
                onChange={(e) => actualizar(seleccionada.key, { scale: Number(e.target.value) })}
              />
            </div>
            <div className="control">
              <label>Rotación</label>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={seleccionada.rotation}
                onChange={(e) => actualizar(seleccionada.key, { rotation: Number(e.target.value) })}
              />
            </div>
            <div className="editor-controles-botones">
              <button className="btn btn-secundario btn-mini" onClick={() => mover(seleccionada.key, 1)}>⬆ Adelante</button>
              <button className="btn btn-secundario btn-mini" onClick={() => mover(seleccionada.key, -1)}>⬇ Atrás</button>
              <button className="btn btn-peligro btn-mini" onClick={() => quitar(seleccionada.key)}>Quitar</button>
            </div>
          </div>
        )}
      </div>

      <div className="editor-panel">
        <div className="tarjeta editor-guardar">
          <h2>{outfitId ? "Editar outfit ✏️" : "Nuevo outfit ✨"}</h2>
          <div className="campo">
            <label htmlFor="o-nombre">Nombre</label>
            <input
              id="o-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={100}
              placeholder="Cita de viernes 💅"
            />
          </div>
          <div className="campo">
            <label htmlFor="o-ocasion">Ocasión (opcional)</label>
            <input
              id="o-ocasion"
              value={ocasion}
              onChange={(e) => setOcasion(e.target.value)}
              maxLength={100}
              placeholder="Cena, brunch, paseo…"
            />
          </div>
          {mensaje && <p className="login-error">{mensaje}</p>}
          <button className="btn btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar outfit 💖"}
          </button>
        </div>

        <div className="tarjeta editor-armario">
          <h3>Tu clóset</h3>
          {garments.length === 0 && (
            <p className="nota">Aún no tienes prendas. Súbelas desde "Mi clóset" 🩷</p>
          )}
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
            const grupo = garments.filter((g) => g.category === cat);
            if (grupo.length === 0) return null;
            return (
              <div key={cat} className="armario-grupo">
                <span className="armario-titulo">{label}</span>
                <div className="armario-fila">
                  {grupo.map((g) => (
                    <button
                      key={g.id}
                      className="armario-prenda"
                      title={`Agregar ${g.name}`}
                      onClick={() => agregar(g)}
                    >
                      <img src={g.cutout ?? g.image} alt={g.name} loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
