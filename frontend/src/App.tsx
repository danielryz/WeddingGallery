import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import PhotoDetailPage from './pages/PhotoDetailPage';
import SliderPage from './pages/SliderPage';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import WishesPage from './pages/WishesPage';
import { login } from './api/auth';
import AdminPanelPage from "./pages/AdminPanelPage.tsx";
import { useAlerts } from './components/alert/useAlerts'

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
  const showAlert = useAlerts();

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
      showAlert('Niepoprawne dane logowania: ' + err, 'error');
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
          <Route path="/slider" element={<SliderPage />} />
          <Route path="/photo/:id" element={<PhotoDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/wishes" element={<WishesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/admin/download-panel/" element={<AdminPanelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
  );
}

export default App;
