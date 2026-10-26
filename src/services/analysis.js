const API_BASE = 'http://localhost:8000/api/analysis'

function authHeaders() {
  const token = localStorage.getItem('farmDoctorAccessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function parseImageFilename(filename) {
  const match = filename.match(/^([^_]+)_([^_]+)_([^_]+)_([^_]+)_([^_]+)_([^_]+)_([^_]+)_([^_]+)_([^_]+)_(\d{8})_([^_]+)_([^_.]+)(?:_([^_.]+))?\.(png|jpe?g)$/i)
  if (!match) return null
  const [, version, projectNumber, dataType, damageCode, cropCode, cropPartCode, growthStageCode, severityCode, workerId, rawDate, collectionNumber, collectionSequence, objectSequence] = match
  return {
    version, projectNumber, dataType, damageCode, cropCode, cropPartCode, growthStageCode, severityCode, workerId,
    collectionDate: `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6)}`,
    collectionNumber, collectionSequence, ...(objectSequence ? { objectSequence } : {}),
  }
}

export async function createAnalysisUpload(file, { datasetName, orchardName, collectionDate, cropCode, confidenceThreshold }) {
  const formData = new FormData()
  formData.append('file', file)
  if (datasetName) formData.append('dataset_name', datasetName)
  if (orchardName) formData.append('orchard_name', orchardName)
  if (collectionDate) formData.append('collection_date', collectionDate)
  if (cropCode) formData.append('crop_code', cropCode)
  if (confidenceThreshold) formData.append('confidence_threshold', confidenceThreshold)
  const response = await fetch(`${API_BASE}/uploads`, { method: 'POST', headers: authHeaders(), body: formData })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || '업로드 작업을 만들 수 없습니다.')
  return data
}

export async function getAnalysisJob(jobId) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}`, { headers: authHeaders() })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || '분석 작업 상태를 불러올 수 없습니다.')
  return data
}

export async function getAnalysisDetections(jobId) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/detections`, { headers: authHeaders() })
  const data = await response.json().catch(() => [])
  if (!response.ok) throw new Error(data.detail || '검출 결과를 불러올 수 없습니다.')
  return data
}
