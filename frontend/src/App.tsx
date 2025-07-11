import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import PhotoDetailPage from './pages/PhotoDetailPage';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import { login } from './api/auth';

function App() {
  const [isAuth, setIsAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    if (!token || !expiresAt) return false;
    if (Date.now() > Number(expiresAt)) {
      localStorage.removeItem('token');
      localStorage.removeItem('expiresAt');
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (isAuth) {
      const expiresAt = localStorage.getItem('expiresAt');
      if (expiresAt) {
        const timeout = Number(expiresAt) - Date.now();
        if (timeout > 0) {
          const timer = setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            setIsAuth(false);
            alert('Sesja wygasła. Zaloguj się ponownie.');
          }, timeout);
          return () => clearTimeout(timer);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('expiresAt');
          setIsAuth(false);
        }
      }
    }
  }, [isAuth]);

  const handleLogin = async (username: string, password: string, name?: string) => {
    try {
      await login({ username, password, name });

      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
      localStorage.setItem('expiresAt', expiresAt.toString());

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
