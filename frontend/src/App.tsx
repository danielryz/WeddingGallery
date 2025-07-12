import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import PhotoDetailPage from './pages/PhotoDetailPage';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import {login} from "./api/auth.ts";

function App() {
  const [isAuth, setIsAuth] = useState(() => Boolean(localStorage.getItem('token')));

  const handleLogin = async (username: string, password: string, name?: string) => {
    try {
      const res = await login({ username, password, name });
      localStorage.setItem('deviceName', res.deviceName);
      setIsAuth(true);
    } catch (err) {
      console.error('Błąd logowania:', err);
      alert('Niepoprawne dane logowania');
    }
  };

  if (!isAuth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/photo/:id" element={<PhotoDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
  );
}

export default App;
