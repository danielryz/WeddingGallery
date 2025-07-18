import React from 'react';
import GalleryTabs from '../components/Gallery/GalleryTabs';
import { useNavigate, Link } from 'react-router-dom';
import './GalleryPage.css';

const GalleryPage: React.FC = () => {
    const navigate = useNavigate();

    const handleItemClick = (id: number) => {
        navigate(`/photo/${id}`);
    };

    return (
        <main className="gallery-page">
            <h1 className="gallery-title">Nasza Galeria Ślubna</h1>
            <GalleryTabs
                onItemClick={handleItemClick}
                headerExtra={(
                    <Link to="/slider" className="browse-btn">Przeglądaj</Link>
                )}
            />
        </main>
    );
};

export default GalleryPage;
