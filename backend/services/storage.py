from __future__ import annotations

import base64
import imghdr
import os
import uuid
from datetime import timedelta

from google.cloud import storage


class StorageServiceError(Exception):
    pass


_storage_client: storage.Client | None = None


def get_storage_client() -> storage.Client:
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client()
    return _storage_client


def _get_bucket_name() -> str:
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise StorageServiceError("Environment variable GCS_BUCKET_NAME belum diset")
    return bucket_name


def _decode_base64_image(image_base64: str) -> tuple[bytes, str]:
    raw = image_base64
    if image_base64.startswith("data:") and "," in image_base64:
        raw = image_base64.split(",", maxsplit=1)[1]

    try:
        image_bytes = base64.b64decode(raw)
    except Exception as exc:  # noqa: BLE001
        raise StorageServiceError("imageBase64 tidak valid") from exc

    image_type = imghdr.what(None, h=image_bytes)
    extension = "jpg" if image_type in {"jpeg", None} else image_type
    if extension not in {"jpg", "png", "webp", "gif"}:
        extension = "jpg"

    return image_bytes, extension


def upload_notebook_image(image_base64: str, user_id: str) -> dict[str, str]:
    image_bytes, extension = _decode_base64_image(image_base64)
    bucket_name = _get_bucket_name()
    client = get_storage_client()

    blob_name = f"notebooks/{user_id}/{uuid.uuid4().hex}.{extension}"
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    content_type = f"image/{'jpeg' if extension == 'jpg' else extension}"
    blob.upload_from_string(image_bytes, content_type=content_type)

    # Signed URL dipakai agar aman walau bucket tidak public.
    signed_url = blob.generate_signed_url(version="v4", expiration=timedelta(days=7), method="GET")

    return {
      "object_path": blob_name,
      "image_url": signed_url,
      "gs_url": f"gs://{bucket_name}/{blob_name}",
    }
