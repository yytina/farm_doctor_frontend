const API_URL = 'http://localhost:8000/api/auth/login'
const ACCESS_TOKEN_KEY = 'farmDoctorAccessToken'
const TOKEN_TYPE_KEY = 'farmDoctorTokenType'

export function hasSession() { return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)) }
export function clearSession() { localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(TOKEN_TYPE_KEY) }

export async function login(username, password) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
    throw new Error('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.')
  }
  const { access_token, token_type } = await response.json()
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token)
  localStorage.setItem(TOKEN_TYPE_KEY, token_type || 'bearer')
}
