import React, { useState } from 'react';
import './LoginPage.css';

interface LoginPageProps {
    onLogin: (username: string, password: string, name?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('Ania&Kamil2025');
    const [password, setPassword] = useState('');
    const [deviceName, setDeviceName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password, deviceName);
    };

    return (
        <main className="login-page">
            <div className="login-box">
                <h1 className="login-title">
                    Anna &amp; Adam <br /><span className="login-date">09.06.2024</span>
                </h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        className="login-input"
                        placeholder="Login"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="login-input"
                        placeholder="Hasło"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        className="login-input login-input-last"
                        placeholder="Imię (nazwa wyświetlana)"
                        value={deviceName}
                        onChange={e => setDeviceName(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">
                        Zaloguj
                    </button>
                </form>
            </div>
        </main>
    );
};

export default LoginPage;
