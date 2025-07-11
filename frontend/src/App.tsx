import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { login } from './api/auth'
import Home from './pages/Home'
import GalleryPage from './pages/GalleryPage'
import PhotoDetailPage from './pages/PhotoDetailPage'
import ChatPage from './pages/ChatPage'
import MenuPage from './pages/MenuPage'
import UploadPage from "./pages/UploadPage.tsx";

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isAuth, setIsAuth] = useState(() => Boolean(localStorage.getItem('token')))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login({ username, password, name })
    setUsername('')
    setPassword('')
    setName('')
    setIsAuth(true)
  }

  if (!isAuth) {
    return (
      <div>
        <h1>Wedding Gallery</h1>
        <form onSubmit={handleLogin}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Device Name"
          />
          <button type="submit">Login</button>
        </form>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/photo/:id" element={<PhotoDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </>
  )
}

export default App
