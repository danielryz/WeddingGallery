import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="bg-cream text-brown font-elegant px-4 py-3 flex items-center justify-between shadow">
            {/* Tytuł/nazwa pary */}
            <div className="text-2xl">
                Anna &amp; Adam <span className="text-lg">| 09.06.2024</span>
            </div>

            {/* Przycisk hamburger (widoczny tylko na mobile) */}
            <button
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Otwórz menu"
            >
                <svg
                    className="w-6 h-6 text-brown" fill="none" stroke="currentColor" strokeWidth={1.5}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
            </button>

            {/* Linki nawigacyjne (pokazywane w zależności od menu/rozmiaru ekranu) */}
            <div className={`absolute top-full left-0 w-full bg-cream md:static md:w-auto 
        ${menuOpen ? 'block' : 'hidden'} md:flex md:items-center`}>
                <Link
                    to="/gallery"
                    className="block md:inline-block px-4 py-2 md:py-0 hover:text-gold"
                    onClick={() => setMenuOpen(false)}
                >
                    Galeria
                </Link>
                <Link
                    to="/upload"
                    className="block md:inline-block px-4 py-2 md:py-0 hover:text-gold"
                    onClick={() => setMenuOpen(false)}
                >
                    Dodaj zdjęcie/film
                </Link>
                <Link
                    to="/chat"
                    className="block md:inline-block px-4 py-2 md:py-0 hover:text-gold"
                    onClick={() => setMenuOpen(false)}
                >
                    Kontakt
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
