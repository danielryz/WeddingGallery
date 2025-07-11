import React, { useState } from 'react';

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="bg-cream text-brown font-elegant px-4 py-3 flex items-center justify-between shadow">
            {/* Logo lub tytuł strony */}
            <div className="text-2xl">WeddingGallery</div>

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
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
            </button>

            {/* Linki nawigacyjne: widoczne w zależności od stanu menu / rozmiaru ekranu */}
            <div className={`absolute top-full left-0 w-full bg-cream md:static md:w-auto 
                      ${menuOpen ? 'block' : 'hidden'} md:flex md:items-center`}>
                <a href="#" className="block md:inline-block px-4 py-2 md:py-0 hover:text-gold">
                    Galeria
                </a>
                <a href="#" className="block md:inline-block px-4 py-2 md:py-0 hover:text-gold">
                    Dodaj zdjęcie/film
                </a>
                <a href="#" className="block md:inline-block px-4 py-2 md:py-0 hover:text-gold">
                    Kontakt
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
