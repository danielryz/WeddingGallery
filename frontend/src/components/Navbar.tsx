import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-title">
                Anna &amp; Adam <span className="navbar-date">| 09.06.2024</span>
            </div>
            <button
                className="hamburger-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Otwórz menu"
            >
                <svg
                    className="hamburger-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                    />
                </svg>
            </button>
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                <Link to="/gallery" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Galeria
                </Link>
                <Link to="/upload" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Dodaj zdjęcie/film
                </Link>
                <Link to="/chat" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Kontakt
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
