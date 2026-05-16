from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TransactionType(str, Enum):
    PEMASUKAN = "pemasukan"
    PENGELUARAN = "pengeluaran"


class TransactionCategory(str, Enum):
    PENJUALAN = "penjualan"
    BAHAN_BAKU = "bahan_baku"
    GAJI = "gaji"
    OPERASIONAL = "operasional"
    LAINNYA = "lainnya"


class TransactionRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    tanggal: date
    keterangan: str = Field(min_length=1, max_length=160)
    jumlah: int = Field(gt=0)
    tipe: TransactionType
    kategori: TransactionCategory

    @field_validator("keterangan")
    @classmethod
    def validate_keterangan(cls, value: str) -> str:
        if not value:
            raise ValueError("keterangan tidak boleh kosong")
        return value


class OCRRequest(BaseModel):
    user_id: str = Field(alias="userId", min_length=3, max_length=128)
    image_base64: str = Field(alias="imageBase64", min_length=50)
    image_url: str | None = Field(default=None, alias="imageUrl")

    model_config = ConfigDict(populate_by_name=True)


class OCRResponse(BaseModel):
    transactions: list[TransactionRecord]


class AdvisorRequest(BaseModel):
    transactions: list[TransactionRecord]


class InsightType(str, Enum):
    WARNING = "warning"
    TIP = "tip"
    POSITIVE = "positive"


class AdvisorInsight(BaseModel):
    insight: str = Field(min_length=5, max_length=300)
    tipe: InsightType
    aksi: str = Field(min_length=3, max_length=120)


class AdvisorResponse(BaseModel):
    data: AdvisorInsight
