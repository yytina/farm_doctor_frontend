import { useState } from 'react'
import BrandMark from './BrandMark'
import { login } from '../services/auth'

export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage('')
    setIsSubmitting(true)
    try {
      await login(form.get('username'), form.get('password'))
      setMessageType('success')
      setMessage('로그인되었습니다. Farm Doctor로 이동합니다.')
      window.setTimeout(onLogin, 450)
    } catch (error) {
      setMessageType('error')
      setMessage(error instanceof Error ? error.message : '서버에 연결할 수 없습니다.')
    } finally { setIsSubmitting(false) }
  }

  return <main className="login-page">
    <div className="background-orb orb-left"/><div className="background-orb orb-right"/>
    <header className="login-header"><a className="brand" href="#top" aria-label="Farm Doctor 홈"><BrandMark/><span><strong>Farm Doctor</strong><small>과수 화상병 AI 진단</small></span></a><div className="header-status"><i/> AI 진단 시스템</div></header>
    <section className="login-layout" id="top"><aside className="welcome-panel"><div className="eyebrow"><span>●</span> SMART ORCHARD CARE</div><h1>건강한 과수원,<br/>더 빠른 진단으로.</h1><p>AI가 과수의 이상 징후를 꼼꼼히 살피고, 필요한 대응을 함께 안내합니다.</p><div className="plant-illustration" aria-hidden="true"><div className="sun"/><div className="hill hill-back"/><div className="hill hill-front"/><div className="tree tree-one"><b/><i/><em/></div><div className="tree tree-two"><b/><i/><em/></div><div className="tree tree-three"><b/><i/><em/></div></div><div className="welcome-note"><span>✦</span><p><strong>농가와 함께하는 AI 파트너</strong><br/>더 안전한 과수 재배를 지원합니다.</p></div></aside>
      <section className="login-card" aria-labelledby="login-title"><div className="card-icon">⌑</div><p className="card-kicker">WELCOME BACK</p><h2 id="login-title">로그인</h2><p className="card-description">Farm Doctor 서비스를 이용하려면<br/>계정 정보를 입력해 주세요.</p><form onSubmit={handleSubmit}><label htmlFor="username">아이디</label><div className="input-wrap"><span>♙</span><input id="username" name="username" autoComplete="username" placeholder="아이디를 입력하세요" required disabled={isSubmitting}/></div><div className="label-row"><label htmlFor="password">비밀번호</label><a href="#forgot">비밀번호를 잊으셨나요?</a></div><div className="input-wrap"><span>♧</span><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="비밀번호를 입력하세요" required disabled={isSubmitting}/><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting}>{showPassword ? '숨김' : '보기'}</button></div><label className="remember"><input type="checkbox"/><span>로그인 상태 유지</span></label><button className="login-button" type="submit" disabled={isSubmitting}>{isSubmitting ? '로그인 중...' : <>로그인 <span>→</span></>}</button>{message && <p className={`form-message ${messageType}`} role="status">{message}</p>}</form><p className="signup">아직 계정이 없으신가요? <a href="#signup">회원가입</a></p></section>
    </section><footer>© 2026 Farm Doctor &nbsp;·&nbsp; 과수 화상병 AI 진단 및 대응 가이드</footer>
  </main>
}
