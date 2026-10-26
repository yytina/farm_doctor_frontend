import { useState } from 'react'
import BrandMark from './BrandMark'

const stats = [['전체 검사', '12', '오늘 업로드한 과수 이미지', '▣', 'sage'], ['정상 과수', '8', '건강한 생육 상태', '✦', 'green'], ['배 화상병 감염', '2', '주의 및 방제 필요', '!', 'amber'], ['사과 화상병 감염', '2', '긴급 신고 및 조치 필요', '●', 'coral']]

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [files, setFiles] = useState([])
  return <main className="dashboard-page">
    <header className="dashboard-header"><div className="dashboard-brand"><BrandMark/><span><strong>Farm Doctor</strong><small>과수 화상병 AI 진단 및 대응 가이드</small></span></div><div className="dashboard-actions"><span className="model-status"><i/> AI 모델 정상 작동</span><button onClick={onLogout}>로그아웃</button></div></header>
    <nav className="floating-nav" aria-label="대시보드 메뉴"><button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')} title="대시보드">⌂</button><button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')} title="진단 갤러리">▦</button><button className={activeTab === 'assistant' ? 'active' : ''} onClick={() => setActiveTab('assistant')} title="AI 도우미">✦</button><span/><button className="alert-nav" title="긴급 신고">!</button></nav>
    <section className="dashboard-content"><div className="dashboard-intro"><div><p>GOOD AFTERNOON, FARMER</p><h1>오늘의 과수원 진단 현황</h1><span>AI가 분석한 최신 결과를 확인하고 필요한 조치를 시작하세요.</span></div><button className="report-button">▣ &nbsp; 진단 보고서</button></div><div className="stats-grid">{stats.map(([title, value, caption, icon, theme]) => <article className={`stat-card ${theme}`} key={title}><div><p>{title}</p><strong>{value}</strong><span>{caption}</span></div><b>{icon}</b></article>)}</div><section className="urgent-alert"><div className="alert-symbol">!</div><div><p><span>긴급 알림</span> 화상병 의심 감염 4건이 확인되었습니다</p><small>과수 화상병은 빠른 대응이 중요합니다. 감염 의심 시 즉시 신고하고 방제 지침을 확인해 주세요.</small></div><button>1399 신고 안내 →</button></section><section className="analysis-card"><div className="section-heading"><div><h2>과수 이미지 업로드 및 AI 분석</h2><p>사과 또는 배 과수 사진을 업로드하면 AI가 이상 증상을 분석합니다.</p></div><span>모델 상태: <strong>best.pt (Active)</strong></span></div><label className="upload-zone"><input type="file" accept="image/*" multiple onChange={(event) => setFiles([...event.target.files].slice(0, 4))}/><div className="upload-icon">⌁</div><h3>과수 이미지를 여기에 끌어다 놓으세요</h3><p>PNG, JPG, JPEG · 최대 10장까지 동시에 분석할 수 있습니다.</p><b>파일 선택하기</b></label>{files.length > 0 && <div className="file-list">{files.map((file) => <span key={file.name}>✓ {file.name}</span>)}</div>}</section><section className="recent-section"><div><h2>최근 진단 결과</h2><p>최근 7일간 분석한 과수 이미지입니다.</p></div><button>전체 보기 →</button></section></section>
  </main>
}
