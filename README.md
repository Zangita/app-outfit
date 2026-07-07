# Clóset de Kenyi 🎀

Un probador mágico hecho con amor: fotografía tu ropa, la app le recorta el fondo
automáticamente y arma outfits sobre un avatar ilustrado para saber
**"¿cómo me quedaría este outfit?"** antes de ponértelo en la vida real. 💕

## ¿Qué puede hacer?

- 👗 **Mi clóset** — sube fotos de tus prendas; el fondo se recorta solito (rembg)
  y quedan como stickers organizados por categoría (blusas, faldas, vestidos,
  zapatos, bolsos, accesorios…).
- ✨ **Crear outfit** — arrastra tus prendas sobre el avatar, ajusta tamaño,
  rotación y el orden de las capas hasta que el look quede perfecto.
- 💖 **Mis outfits** — guarda tus combinaciones con nombre y ocasión,
  márcalas como favoritas y edítalas cuando quieras.
- 📸 **Mi foto** — sube tu foto de cuerpo completo: se convierte en la base
  real del probador (con el fondo recortado automáticamente).
- 🪄 **Ver cómo me queda (IA)** — con un clic, Gemini genera una foto
  fotorrealista tuya usando el outfit completo. Cada outfit guarda su
  galería de renders.
- 🔐 **Cuentas privadas** — sin registro público: solo las usuarias creadas
  a mano pueden entrar (JWT, contraseñas hasheadas, límite de intentos de login).

Funciona bonito tanto en la computadora como en el celular. 🌸

## Stack

| Parte | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite + TypeScript |
| Backend | Django + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) con rate limiting |
| Recorte de fondo | rembg (modelo U²-Net, corre local, sin servicios externos) |
| Try-on realista | Gemini (imagen) vía google-genai; requiere `GEMINI_API_KEY` |
| Base de datos | SQLite por defecto; PostgreSQL si defines `DB_NAME` en el `.env` |

## Instalación

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edita .env: genera un SECRET_KEY y define KENYI_PASSWORD / JOEL_PASSWORD

python manage.py migrate
python manage.py seed_users   # crea las cuentas kenyi y joel
python manage.py runserver 8001
```

> La primera prenda que subas tarda un poco más: rembg descarga su modelo
> de recorte (~170 MB) una única vez.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173 y entra con tu usuaria. 💅

### 3. Try-on realista con IA (opcional)

1. Crea una API key gratis en [Google AI Studio](https://aistudio.google.com).
2. Agrégala al `backend/.env`: `GEMINI_API_KEY=tu-clave`.
3. Sube tu foto de cuerpo completo en **Mi foto** y usa el botón
   **✨ Ver realista** en cualquier outfit.

> Nota de privacidad: al usar esta función, tu foto y las de las prendas del
> outfit se envían a la API de Google para generar la imagen.

El dev server de Vite hace proxy de `/api` y `/media` hacia el backend
(puerto 8001), así que no hay que configurar CORS en desarrollo.

## Estructura

```
backend/
  config/          # settings, urls
  closet/          # modelos Garment y Outfit, API, recorte de fondo
frontend/
  src/
    components/Avatar.tsx   # el avatar ilustrado 🩷
    pages/                  # Login, Closet, Editor, Outfits
```

## Seguridad

- Contraseñas con los validadores de Django (mínimo 10 caracteres) y hash PBKDF2.
- Login y refresh con throttling (10/min y 30/min) contra fuerza bruta.
- Todos los endpoints requieren JWT; cada usuaria solo ve **sus** prendas y outfits.
- `SECRET_KEY`, contraseñas y configuración sensible fuera del repo (`.env`).
- Límite de 10 MB por foto y validación de imagen en el backend.

---

Hecho con 💖 para Kenyi.
