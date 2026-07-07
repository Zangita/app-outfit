import { useEffect, useRef, useState } from "react";
import api from "../api";
import type { AvatarPhoto } from "../types";

export default function MiFoto() {
  const [foto, setFoto] = useState<AvatarPhoto | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const cargar = async () => {
    const { data } = await api.get<AvatarPhoto | null>("/api/avatar/");
    setFoto(data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const subir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await api.post("/api/avatar/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await cargar();
    } catch {
      setError("No se pudo subir la foto. Intenta con otra imagen 🥺");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="aparecer">
      <div className="pagina-encabezado">
        <div>
          <h1>Mi foto 📸</h1>
          <p className="subtitulo">
            Tu foto de cuerpo completo: la base del probador y del render con IA
          </p>
        </div>
        <button
          className="btn btn-primario"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
        >
          {subiendo ? "Procesando… ✂️✨" : foto ? "Cambiar foto" : "Subir mi foto 💕"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={subir}
        />
      </div>

      {error && <p className="login-error">{error}</p>}

      <div className="tarjeta mifoto-tarjeta">
        {foto ? (
          <div className="mifoto-vistas">
            <figure>
              <img src={foto.image} alt="Tu foto original" />
              <figcaption>Original</figcaption>
            </figure>
            <figure>
              <img src={foto.cutout ?? foto.image} alt="Tu foto recortada" />
              <figcaption>Recortada (la que ves en el editor)</figcaption>
            </figure>
          </div>
        ) : (
          <div className="vacio">
            <span className="vacio-emoji">🤳</span>
            <p>Aún no has subido tu foto.</p>
            <p className="nota">
              Tips para que quede perfecta: de pie y de frente, cuerpo completo,
              buena luz, fondo simple (una pared lisa) y ropa ajustada o sencilla.
              Mejor si alguien te la toma 💗
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
