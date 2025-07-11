import React from 'react';
import { useNavigate } from 'react-router-dom';
import GalleryTabs from '../components/Gallery/GalleryTabs';
import './GalleryPage.css';

const GalleryPage: React.FC = () => {
    const navigate = useNavigate();

    const handleItemClick = (id: number) => {
        navigate(`/photo/${id}`);
    };

    return (
        <main className="gallery-page">
            <h1 className="gallery-title">Nasza Galeria Ślubna</h1>
            <GalleryTabs onItemClick={handleItemClick} />
        </main>
    );
};

export default GalleryPage;
