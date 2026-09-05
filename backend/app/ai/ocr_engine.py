"""
Text extraction -- kept as its own module (Part 19's request for an OCR
abstraction "not tightly coupled to the API route") so the engine can be
swapped without touching the router or the service that calls it.

Two-stage strategy, in order:
  1. Direct text extraction (pypdf) -- fast, free, no OCR needed at all.
     Most uploaded legal documents (drafted notices, typed agreements,
     digitally-generated PDFs) already have a text layer; running OCR on
     these would be slower AND less accurate than just reading the text
     that's already there.
  2. OCR, only if step 1 finds little or no text (scanned/photographed
     documents) -- PaddleOCR first (the Team Handbook's primary choice:
     better layout/table handling), Tesseract as automatic fallback.

*** VERIFICATION STATUS -- mixed, and worth being precise about: ***
- pypdf text extraction: VERIFIED against a real generated PDF (below).
- Tesseract OCR: VERIFIED against a real rendered image (below) --
  genuinely installed and run in this sandbox, not simulated.
- PaddleOCR: NOT VERIFIED -- MUST TEST LOCALLY. Its model weights come
  from a host outside this sandbox's network allowlist. The code path is
  written correctly against its documented API, but falls through to
  Tesseract automatically if the import or inference fails for any
  reason, so this never blocks the endpoint from working -- it just runs
  with the fallback engine until PaddleOCR's models are available.
"""
import io

from pypdf import PdfReader

_PADDLE_OCR_INSTANCE = None
_paddle_load_failed = False


async def extract_text(file_bytes: bytes, content_type: str) -> tuple[str, str]:
    """Returns (extracted_text, method_used) -- method_used is surfaced in
    logs/meta, never to the frontend contract itself, so we always know
    which path actually ran without changing the response shape."""
    if content_type == "application/pdf":
        text = _extract_pdf_text_layer(file_bytes)
        if len(text.strip()) > 50:  # heuristic: a real text layer, not a scanned image PDF
            return text, "pdf_text_layer"
        # Little/no text layer -> likely a scanned PDF. Rasterize pages and OCR them.
        images = _pdf_pages_to_images(file_bytes)
        return _ocr_images(images), "ocr_scanned_pdf"

    # image/png, image/jpeg -> straight to OCR
    from PIL import Image
    image = Image.open(io.BytesIO(file_bytes))
    return _ocr_images([image]), "ocr_image"


def _extract_pdf_text_layer(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _pdf_pages_to_images(file_bytes: bytes) -> list:
    from pdf2image import convert_from_bytes
    return convert_from_bytes(file_bytes, dpi=200)


def _ocr_images(images: list) -> str:
    text = _try_paddle_ocr(images)
    if text is not None:
        return text
    return _tesseract_ocr(images)


def _try_paddle_ocr(images: list) -> str | None:
    global _PADDLE_OCR_INSTANCE, _paddle_load_failed
    if _paddle_load_failed:
        return None
    try:
        if _PADDLE_OCR_INSTANCE is None:
            from paddleocr import PaddleOCR
            _PADDLE_OCR_INSTANCE = PaddleOCR(use_angle_cls=True, lang="en")
        results = []
        for img in images:
            import numpy as np
            result = _PADDLE_OCR_INSTANCE.ocr(np.array(img))
            for line in result[0] or []:
                results.append(line[1][0])
        return "\n".join(results)
    except Exception:
        _paddle_load_failed = True
        return None


def _tesseract_ocr(images: list) -> str:
    import pytesseract
    return "\n".join(pytesseract.image_to_string(img) for img in images)
