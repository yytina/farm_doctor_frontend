import { useState } from 'react'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import { clearSession, hasSession } from './services/auth'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(hasSession)
  if (isLoggedIn) return <Dashboard onLogout={() => { clearSession(); setIsLoggedIn(false) }} />
  return <LoginPage onLogin={() => setIsLoggedIn(true)} />
}

export default App
