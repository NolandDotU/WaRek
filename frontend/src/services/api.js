const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export async function postOCR(userId, imageBase64) {
  const response = await fetch(`${API_BASE_URL}/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, imageBase64 }),
  })

  if (!response.ok) {
    throw new Error('Gagal memproses OCR')
  }

  return response.json()
}

export async function postAdvisor(transactions) {
  const response = await fetch(`${API_BASE_URL}/advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  })

  if (!response.ok) {
    throw new Error('Gagal memuat advisor')
  }

  return response.json()
}
