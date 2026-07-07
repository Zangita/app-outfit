"""Recorte automático de fondo de las fotos de prendas usando rembg."""

import io
import logging

from django.core.files.base import ContentFile
from PIL import Image

logger = logging.getLogger(__name__)

# La sesión de rembg carga el modelo ONNX una sola vez por proceso.
_session = None

MAX_DIMENSION = 1600  # px; las fotos de celular vienen enormes


def _get_session():
    global _session
    if _session is None:
        from rembg import new_session

        _session = new_session("u2net")
    return _session


def remove_background(image_field) -> ContentFile | None:
    """Devuelve la prenda recortada como PNG con transparencia, o None si falla."""
    try:
        from rembg import remove

        image_field.open("rb")
        original = Image.open(image_field)
        original = original.convert("RGBA")
        original.thumbnail((MAX_DIMENSION, MAX_DIMENSION))

        result = remove(original, session=_get_session())

        # Recortar al contenido visible para que el sticker no traiga aire alrededor
        bbox = result.getbbox()
        if bbox:
            result = result.crop(bbox)

        buffer = io.BytesIO()
        result.save(buffer, format="PNG", optimize=True)
        return ContentFile(buffer.getvalue())
    except Exception:
        logger.exception("No se pudo recortar el fondo de la prenda")
        return None
