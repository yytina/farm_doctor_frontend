import { useEffect, useState } from 'react'
import BrandMark from './BrandMark'
import { createAnalysisUpload, getAnalysisDetections, getAnalysisJob, parseImageFilename } from '../services/analysis'

const stats = [['전체 검사', '12', '오늘 업로드한 과수 이미지', '▣', 'sage'], ['정상 과수', '8', '건강한 생육 상태', '✦', 'green'], ['배 화상병 감염', '2', '주의 및 방제 필요', '!', 'amber'], ['사과 화상병 감염', '2', '긴급 신고 및 조치 필요', '●', 'coral']]
const cropModels = { '01': { name: '배', model: 'pear_v11_0', icon: '🍐' }, '02': { name: '사과', model: 'apple_v11_0', icon: '🍎' } }

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [file, setFile] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [orchardName, setOrchardName] = useState('')
  const [confidenceThreshold, setConfidenceThreshold] = useState('0.25')
  const [uploadState, setUploadState] = useState({ status: '', message: '', jobId: '' })
  const [detections, setDetections] = useState([])
  const [showResultDetails, setShowResultDetails] = useState(false)
  const [pollError, setPollError] = useState('')

  function selectFile(event) {
    const selected = event.target.files[0] || null
    setFile(selected)
    setMetadata(selected ? parseImageFilename(selected.name) : null)
    setUploadState({ status: '', message: '', jobId: '' })
    setDetections([])
    setShowResultDetails(false)
    setPollError('')
  }

  async function applyJob(job) {
    const nextState = { status: job.status, message: job.error_message || `분석 상태: ${job.status}`, jobId: job.id, cropCode: job.crop_code, modelName: job.model_name, confidenceThreshold: job.confidence_threshold, resultSummary: job.result_summary }
    setUploadState(nextState)
    if (job.status === 'completed') setDetections(await getAnalysisDetections(job.id))
  }

  async function uploadFile() {
    if (!file || !metadata) return
    if (!cropModels[metadata.cropCode]) {
      setUploadState({ status: 'error', message: '작물코드 01(배) 또는 02(사과) 이미지만 분석할 수 있습니다.', jobId: '' })
      return
    }
    setUploadState({ status: 'uploading', message: '파일을 업로드하고 분석 작업을 만들고 있습니다.', jobId: '' })
    setPollError('')
    try {
      const job = await createAnalysisUpload(file, { datasetName: file.name.replace(/\.[^.]+$/, ''), orchardName, collectionDate: metadata.collectionDate, cropCode: metadata.cropCode, confidenceThreshold })
      setUploadState({ status: job.status, message: '업로드가 완료되었습니다. 분석 작업이 대기 중입니다.', jobId: job.job_id, cropCode: job.crop_code, confidenceThreshold: job.confidence_threshold })
    } catch (error) { setUploadState({ status: 'error', message: error instanceof Error ? error.message : '업로드에 실패했습니다.', jobId: '' }) }
  }

  async function refreshJob() {
    if (!uploadState.jobId) return
    try { await applyJob(await getAnalysisJob(uploadState.jobId)); setPollError('') }
    catch (error) { setPollError(error instanceof Error ? error.message : '상태를 확인할 수 없습니다.') }
  }

  useEffect(() => {
    const isPending = uploadState.status === 'queued' || uploadState.status === 'processing'
    if (!uploadState.jobId || !isPending) return undefined
    let isCurrent = true
    const poll = async () => {
      try {
        const job = await getAnalysisJob(uploadState.jobId)
        if (!isCurrent) return
        await applyJob(job)
        if (isCurrent) setPollError('')
      } catch (error) {
        if (isCurrent) setPollError(error instanceof Error ? error.message : '상태를 확인할 수 없습니다.')
      }
    }
    poll()
    const timer = window.setInterval(poll, 2000)
    return () => { isCurrent = false; window.clearInterval(timer) }
  }, [uploadState.jobId, uploadState.status])

  const selectedModel = metadata && cropModels[metadata.cropCode]
  const appliedThreshold = uploadState.confidenceThreshold || confidenceThreshold

  return <main className="dashboard-page">
    <header className="dashboard-header"><div className="dashboard-brand"><BrandMark/><span><strong>Farm Doctor</strong><small>과수 화상병 AI 진단 및 대응 가이드</small></span></div><div className="dashboard-actions"><span className="model-status"><i/> AI 모델 정상 작동</span><button onClick={onLogout}>로그아웃</button></div></header>
    <nav className="floating-nav" aria-label="대시보드 메뉴"><button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>⌂</button><button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>▦</button><button className={activeTab === 'assistant' ? 'active' : ''} onClick={() => setActiveTab('assistant')}>✦</button><span/><button className="alert-nav">!</button></nav>
    <section className="dashboard-content">
      <div className="dashboard-intro"><div><p>GOOD AFTERNOON, FARMER</p><h1>오늘의 과수원 진단 현황</h1><span>AI가 분석한 최신 결과를 확인하고 필요한 조치를 시작하세요.</span></div><button className="report-button">▣ &nbsp; 진단 보고서</button></div>
      <div className="stats-grid">{stats.map(([title, value, caption, icon, theme]) => <article className={`stat-card ${theme}`} key={title}><div><p>{title}</p><strong>{value}</strong><span>{caption}</span></div><b>{icon}</b></article>)}</div>
      <section className="urgent-alert"><div className="alert-symbol">!</div><div><p><span>긴급 알림</span> 화상병 의심 감염 4건이 확인되었습니다</p><small>과수 화상병은 빠른 대응이 중요합니다. 감염 의심 시 즉시 신고하고 방제 지침을 확인해 주세요.</small></div><button>1399 신고 안내 →</button></section>
      <section className="analysis-card">
        <div className="section-heading"><div><h2>이미지 업로드 및 AI 분석</h2><p>표준 파일명에서 수집 메타데이터를 확인한 뒤 한 장의 이미지를 분석합니다.</p></div><span>모델 상태: <strong>best.pt (Active)</strong></span></div>
        <label className="upload-zone"><input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={selectFile}/><div className="upload-icon">⌁</div><h3>분석할 과수 이미지 한 장을 선택하세요</h3><p>PNG, JPG, JPEG · 최대 10MB · 표준 메타데이터 파일명을 사용해 주세요.</p><b>파일 선택하기</b></label>
        {file && <div className="upload-details"><div className="selected-file">✓ <strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></div>{metadata ? <div className="metadata-content"><div className="metadata-grid">{Object.entries(metadata).map(([key, value]) => <span key={key}><small>{key}</small>{value}</span>)}</div><label className="orchard-field">과수원 이름 (선택)<input value={orchardName} onChange={(event) => setOrchardName(event.target.value)} placeholder="예: 청송 사과 과수원"/></label><label className="threshold-field upload-threshold">검출 신뢰도 기준 <strong>{Math.round(Number(confidenceThreshold) * 100)}%</strong><input type="range" min="0.1" max="0.9" step="0.05" value={confidenceThreshold} onChange={(event) => setConfidenceThreshold(event.target.value)}/><small>이 기준 이상인 객체만 검출 결과에 포함됩니다.</small></label><div className="upload-actions"><button onClick={uploadFile} disabled={uploadState.status === 'uploading'}>{uploadState.status === 'uploading' ? '업로드 중...' : '업로드하고 분석 시작'}</button>{uploadState.jobId && <button className="status-button" onClick={refreshJob}>상태 새로고침</button>}</div>{uploadState.message && <p className={`upload-message ${uploadState.status}`}>{uploadState.message}{uploadState.jobId && <small>Job ID: {uploadState.jobId}</small>}</p>}</div> : <p className="filename-error">파일명이 표준 형식과 다릅니다. 예: V006_77_1_05_03_05_2_3_ABCD123_20200911_001_S01.PNG 또는 V006_80_0_00_01_01_25_0_b06_20201005_0002_S01_1.jpg</p>}</div>}
      </section>
      <section className="recent-section"><div><h2>최근 진단 결과</h2><p>최근 7일간 분석한 과수 이미지입니다.</p></div><button>전체 보기 →</button></section>
    </section>
    {metadata && <section className="model-panel"><div className="model-heading"><span>{selectedModel?.icon}</span><div><p>FILENAME CROP CODE: {metadata.cropCode}</p><h2>{selectedModel?.name || '지원되지 않는 작물'} 분석 모델</h2><small>{selectedModel?.model || '지원되지 않는 crop code'}가 업로드 시 백엔드에서 실행됩니다.</small></div></div>{uploadState.status === 'completed' && <div className="detection-results"><div><p>ANALYSIS COMPLETED</p><h2>검출 결과 {detections.length}건</h2><small>모델: {uploadState.modelName || cropModels[uploadState.cropCode]?.model} · 적용 기준: {Math.round(Number(appliedThreshold) * 100)}%</small></div><div className="detection-list">{detections.length ? detections.map((detection, index) => <article key={`${detection.class_name}-${index}`}><strong>{detection.class_name}</strong><b>{(detection.confidence * 100).toFixed(1)}%</b><small>class {detection.class_id} · x {detection.bounding_box.x ?? detection.bounding_box.x1}, y {detection.bounding_box.y ?? detection.bounding_box.y1}</small></article>) : <p>검출된 객체가 없습니다.</p>}</div></div>}</section>}
    {pollError && (uploadState.status === 'queued' || uploadState.status === 'processing') && <p className="auto-poll-notice">상태 확인을 다시 시도하고 있습니다. {pollError}</p>}
    {uploadState.status === 'completed' && uploadState.resultSummary && <section className="result-details"><button onClick={() => setShowResultDetails((value) => !value)}>{showResultDetails ? '결과 상세 닫기' : '결과 상세 보기'}</button>{showResultDetails && <pre>{JSON.stringify(uploadState.resultSummary, null, 2)}</pre>}</section>}
  </main>
}
