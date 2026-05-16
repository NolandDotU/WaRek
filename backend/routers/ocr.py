from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from google.cloud import firestore

from models.transaction import OCRRequest, OCRResponse, TransactionRecord
from services.gemini_ocr import OCRServiceError, extract_transactions_from_image_base64


router = APIRouter(prefix="/ocr", tags=["OCR"])

_firestore_client: firestore.Client | None = None


def get_firestore_client() -> firestore.Client:
    global _firestore_client
    if _firestore_client is None:
        _firestore_client = firestore.Client()
    return _firestore_client


@router.post("", response_model=OCRResponse)
def run_ocr(payload: OCRRequest) -> OCRResponse:
    try:
        raw_items = extract_transactions_from_image_base64(payload.image_base64)
    except OCRServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    validated: list[TransactionRecord] = []
    for item in raw_items:
        try:
            validated.append(TransactionRecord.model_validate(item))
        except Exception:  # noqa: BLE001
            # Skip baris transaksi yang tidak valid agar proses tetap berjalan.
            continue

    if not validated:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tidak ada transaksi valid yang berhasil diekstrak dari gambar",
        )

    db = get_firestore_client()
    records_ref = db.collection("transactions").document(payload.user_id).collection("records")

    for tx in validated:
        tx_data = tx.model_dump(mode="json")
        if payload.image_url:
            tx_data["image_url"] = payload.image_url
        tx_data["created_at"] = firestore.SERVER_TIMESTAMP
        records_ref.add(tx_data)

    return OCRResponse(transactions=validated)
