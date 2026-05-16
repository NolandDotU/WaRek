from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from models.transaction import AdvisorInsight, AdvisorRequest, AdvisorResponse
from services.gemini_advisor import AdvisorServiceError, generate_advisor_insight


router = APIRouter(prefix="/advisor", tags=["Advisor"])


@router.post("", response_model=AdvisorResponse)
def get_advice(payload: AdvisorRequest) -> AdvisorResponse:
    if not payload.transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Daftar transaksi tidak boleh kosong",
        )

    tx_json = [item.model_dump(mode="json") for item in payload.transactions]

    try:
        insight_obj = generate_advisor_insight(tx_json)
        insight = AdvisorInsight.model_validate(insight_obj)
    except AdvisorServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Format insight dari model tidak valid: {exc}",
        ) from exc

    return AdvisorResponse(data=insight)
