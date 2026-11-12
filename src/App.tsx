import { useEffect, useState } from 'react'
import EditPage from './pages/EditPage'
import HomePage from './pages/HomePage'

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path.replace(/\/$/, '') === '/edit' ? <EditPage /> : <HomePage />
}
