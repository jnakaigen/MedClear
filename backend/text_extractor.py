import io
import shutil

import fitz  # PyMuPDF
from PIL import Image

# Check tesseract availability at import time
TESSERACT_AVAILABLE = shutil.which("tesseract") is not None

if TESSERACT_AVAILABLE:
    import pytesseract


def _clean_private_use_area(text: str) -> str:
    """Map Unicode Private Use Area characters (U+F000-U+F0FF) back to ASCII.

    Many lab report PDFs use custom fonts that encode standard characters
    in the PUA range, offset by 0xF000 from their real codepoints.
    """
    cleaned = []
    for ch in text:
        code = ord(ch)
        if 0xF000 <= code <= 0xF0FF:
            cleaned.append(chr(code - 0xF000))
        else:
            cleaned.append(ch)
    return "".join(cleaned)


def extract_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF. Falls back to OCR for scanned/image-only PDFs."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text_parts = []

    for page in doc:
        text = page.get_text()
        if text.strip():
            text_parts.append(text)

    # If we got text from at least one page, return it
    if text_parts:
        doc.close()
        return "\n\n".join(text_parts)

    # Fallback: scanned PDF — OCR each page with Tesseract
    if not TESSERACT_AVAILABLE:
        doc.close()
        raise ValueError(
            "This PDF appears to be a scanned document and requires OCR, "
            "but Tesseract is not installed. Install it with: brew install tesseract"
        )

    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        ocr_text = pytesseract.image_to_string(img)
        if ocr_text.strip():
            text_parts.append(ocr_text)

    doc.close()
    return "\n\n".join(text_parts)


def extract_from_image(file_bytes: bytes) -> str:
    """Extract text from an image using Tesseract OCR."""
    if not TESSERACT_AVAILABLE:
        # No OCR available — return empty so the caller can use multimodal LLM
        return ""

    img = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(img)


def extract_text(file_bytes: bytes, content_type: str) -> str:
    """Route to the correct extractor based on file type."""
    if content_type == "application/pdf":
        text = extract_from_pdf(file_bytes)
    elif content_type.startswith("image/"):
        text = extract_from_image(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {content_type}")

    text = _clean_private_use_area(text).strip()
    if not text:
        raise ValueError(
            "Could not extract any text from the uploaded file. "
            "Please ensure the document is readable and not blank."
        )

    return text
