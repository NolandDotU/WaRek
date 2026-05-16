from __future__ import annotations

import json
import os
import re
from typing import Any

import google.generativeai as genai


ADVISOR_PROMPT_TEMPLATE = """Kamu adalah konsultan keuangan warung yang ramah dan berbicara seperti teman.
Analisis data transaksi warung berikut dan berikan 1 insight paling penting dalam 2 kalimat.
Gunakan bahasa Indonesia yang santai dan mudah dipahami pemilik warung biasa.
Fokus pada: tren pengeluaran, produk terlaris, atau peringatan cash-flow.
Data: {transactions_json}
Format respons: JSON {"insight": "string", "tipe": "warning"|"tip"|"positive", "aksi": "string singkat"}"""


class AdvisorServiceError(Exception):
    pass


def _setup_gemini() -> None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise AdvisorServiceError("Environment variable GEMINI_API_KEY belum diset")
    genai.configure(api_key=api_key)


def _extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    if cleaned.startswith("{") and cleaned.endswith("}"):
        payload = cleaned
    else:
        match = re.search(r"\{(.|\n|\r)*\}", cleaned)
        if not match:
            raise AdvisorServiceError("Gemini tidak mengembalikan JSON object")
        payload = match.group(0)

    try:
        parsed = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise AdvisorServiceError(f"JSON advisor tidak valid: {exc}") from exc

    if not isinstance(parsed, dict):
        raise AdvisorServiceError("Respons advisor harus berupa object")

    return parsed


def generate_advisor_insight(transactions: list[dict[str, Any]]) -> dict[str, Any]:
    _setup_gemini()

    transactions_json = json.dumps(transactions, ensure_ascii=False)
    prompt = ADVISOR_PROMPT_TEMPLATE.format(transactions_json=transactions_json)

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.3,
            "response_mime_type": "application/json",
        },
    )

    text = (response.text or "").strip()
    if not text:
        raise AdvisorServiceError("Respons Gemini kosong untuk advisor")

    return _extract_json_object(text)
