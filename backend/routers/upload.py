from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from services.storage import StorageServiceError, upload_notebook_image


class UploadPhotoRequest(BaseModel):
    user_id: str = Field(alias="userId", min_length=3, max_length=128)
    image_base64: str = Field(alias="imageBase64", min_length=50)

    model_config = ConfigDict(populate_by_name=True)


class UploadPhotoResponse(BaseModel):
    image_url: str = Field(alias="imageUrl")
    object_path: str = Field(alias="objectPath")
    gs_url: str = Field(alias="gsUrl")

    model_config = ConfigDict(populate_by_name=True)


router = APIRouter(prefix="/upload-photo", tags=["Storage"])


@router.post("", response_model=UploadPhotoResponse)
def upload_photo(payload: UploadPhotoRequest) -> UploadPhotoResponse:
    try:
        uploaded = upload_notebook_image(payload.image_base64, payload.user_id)
        return UploadPhotoResponse(
            imageUrl=uploaded["image_url"],
            objectPath=uploaded["object_path"],
            gsUrl=uploaded["gs_url"],
        )
    except StorageServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
