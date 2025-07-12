import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (username: string, password: string, name?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [deviceName, setDeviceName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password, deviceName);
        // (Ewentualna obsługa błędów logowania jest w App.onLogin)
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-cream">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg w-full max-w-sm">
                <h1 className="text-3xl font-elegant text-brown text-center mb-6">
                    Anna &amp; Adam <br /><span className="text-lg font-normal">09.06.2024</span>
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <input
                        type="text"
                        className="w-full mb-3 border border-brown rounded px-3 py-2 focus:outline-none focus:ring focus:border-gold"
                        placeholder="Login"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="w-full mb-3 border border-brown rounded px-3 py-2 focus:outline-none focus:ring focus:border-gold"
                        placeholder="Hasło"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        className="w-full mb-4 border border-brown rounded px-3 py-2 focus:outline-none focus:ring focus:border-gold"
                        placeholder="Imię (nazwa urządzenia)"
                        value={deviceName}
                        onChange={e => setDeviceName(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-gold text-white font-semibold px-4 py-2 rounded hover:opacity-90"
                    >
                        Zaloguj
                    </button>
                </form>
            </div>
        </main>
    );
};

export default LoginPage;
