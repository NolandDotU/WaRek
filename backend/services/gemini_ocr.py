from __future__ import annotations

import base64
import json
import os
import re
from datetime import date
from typing import Any

import google.generativeai as genai


OCR_PROMPT = """Kamu adalah asisten keuangan warung. Ekstrak semua transaksi dari gambar buku catatan ini.
Return ONLY valid JSON array, no markdown, no explanation:
[{\"tanggal\": \"YYYY-MM-DD\", \"keterangan\": \"string\", \"jumlah\": number, \"tipe\": \"pemasukan\"|\"pengeluaran\", \"kategori\": \"penjualan\"|\"bahan_baku\"|\"gaji\"|\"operasional\"|\"lainnya\"}]
Jika tanggal tidak jelas, gunakan tanggal hari ini. Jumlah dalam Rupiah tanpa titik/koma."""


class OCRServiceError(Exception):
    pass


def _setup_gemini() -> None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise OCRServiceError("Environment variable GEMINI_API_KEY belum diset")
    genai.configure(api_key=api_key)


def _extract_json_array(text: str) -> list[dict[str, Any]]:
    cleaned = text.strip()

    # Toleransi jika model tetap membungkus output dalam code fence.
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    if cleaned.startswith("[") and cleaned.endswith("]"):
        payload = cleaned
    else:
        match = re.search(r"\[(.|\n|\r)*\]", cleaned)
        if not match:
            raise OCRServiceError("Gemini tidak mengembalikan JSON array yang valid")
        payload = match.group(0)

    try:
        parsed = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise OCRServiceError(f"JSON OCR tidak valid: {exc}") from exc

    if not isinstance(parsed, list):
        raise OCRServiceError("Respons OCR harus berupa array")

    # Normalisasi ringan bila ada field tanggal kosong.
    today = date.today().isoformat()
    normalized: list[dict[str, Any]] = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        item.setdefault("tanggal", today)
        normalized.append(item)

    return normalized


def extract_transactions_from_image_base64(image_base64: str) -> list[dict[str, Any]]:
    _setup_gemini()

    # Support data URL (data:image/jpeg;base64,....) dan raw base64.
    if "," in image_base64 and image_base64.startswith("data:"):
        image_base64 = image_base64.split(",", maxsplit=1)[1]

    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as exc:  # noqa: BLE001
        raise OCRServiceError("imageBase64 tidak valid") from exc

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        [
            OCR_PROMPT,
            {"mime_type": "image/jpeg", "data": image_bytes},
        ],
        generation_config={
            "temperature": 0.1,
            "response_mime_type": "application/json",
        },
    )

    text = (response.text or "").strip()
    if not text:
        raise OCRServiceError("Respons Gemini kosong untuk OCR")

    return _extract_json_array(text)
