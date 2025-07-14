import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import {isAdmin} from "../utils/authUtils.ts";

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-title">
                Ania &amp; Kamil <span className="navbar-date">| 23.08.2025</span>
            </div>
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                <Link to="/gallery" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Galeria
                </Link>
                <Link to="/upload" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Dodaj zdjęcie/film
                </Link>
                <Link to="/chat" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Chat
                </Link>
                {isAdmin() && (
                    <Link to="/admin/download-panel" className="nav-link" onClick={() => setMenuOpen(false)}>
                        Admin Panel
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
