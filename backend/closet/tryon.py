"""Generación fotorrealista del outfit con Gemini (imagen "nano banana").

Toma la foto real de la usuaria + las fotos de las prendas del outfit y
devuelve una imagen de ella usando esa ropa.
"""

import logging
import os

from PIL import Image

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "gemini-2.5-flash-image"

CATEGORY_EN = {
    "top": "top",
    "bottom": "skirt/pants",
    "dress": "dress",
    "outerwear": "jacket/coat",
    "shoes": "shoes",
    "bag": "bag",
    "accessory": "accessory",
}


class TryOnError(Exception):
    """Error esperable del try-on, con mensaje apto para mostrar a la usuaria."""


def render_outfit(avatar_image_field, garments) -> bytes:
    """Devuelve los bytes PNG de la imagen generada.

    garments: lista de instancias Garment en orden de capas (de abajo hacia arriba).
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise TryOnError(
            "Falta la API key de Gemini: agrega GEMINI_API_KEY al archivo backend/.env."
        )

    from google import genai

    avatar_image_field.open("rb")
    person = Image.open(avatar_image_field)
    person.load()

    garment_images = []
    descriptions = []
    for i, garment in enumerate(garments, start=2):
        field = garment.cutout or garment.image
        field.open("rb")
        img = Image.open(field)
        img.load()
        garment_images.append(img)
        category = CATEGORY_EN.get(garment.category, "garment")
        descriptions.append(f"- Image {i}: a {category} ({garment.name}, {garment.color or 'as shown'})")

    prompt = (
        "Create a photorealistic full-body photo of the woman from image 1 "
        "wearing ALL of these clothing items together as one outfit:\n"
        + "\n".join(descriptions)
        + "\n\nRequirements:\n"
        "- Keep her face, skin tone, hairstyle and body shape exactly as in image 1.\n"
        "- She is standing in a natural, relaxed front-facing pose, full body visible from head to feet.\n"
        "- The clothes must drape naturally on her body with realistic fabric, fit and shadows.\n"
        "- Soft, flattering natural lighting on a simple light pink studio background.\n"
        "- Do not add any clothing items that are not listed above."
    )

    client = genai.Client(api_key=api_key)
    model = os.environ.get("GEMINI_IMAGE_MODEL", DEFAULT_MODEL)

    try:
        response = client.models.generate_content(
            model=model,
            contents=[prompt, person, *garment_images],
        )
    except Exception as exc:
        logger.exception("Fallo llamando a Gemini")
        raise TryOnError(f"Gemini devolvió un error: {exc}") from exc

    for candidate in response.candidates or []:
        for part in candidate.content.parts or []:
            if getattr(part, "inline_data", None) and part.inline_data.data:
                return part.inline_data.data

    raise TryOnError(
        "La IA no devolvió ninguna imagen. Intenta de nuevo en unos segundos."
    )
