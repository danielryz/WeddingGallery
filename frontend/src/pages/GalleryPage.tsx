import React, { useState } from 'react';
import GalleryTabs from '../components/Gallery/GalleryTabs';
import SliderModal from '../components/SliderModal';
import { useNavigate } from 'react-router-dom';
import './GalleryPage.css';

const GalleryPage: React.FC = () => {
    const navigate = useNavigate();
    const [showSlider, setShowSlider] = useState(false);

    const handleItemClick = (id: number) => {
        navigate(`/photo/${id}`);
    };

    return (
        <main className="gallery-page">
            <h1 className="gallery-title">Nasza Galeria Ślubna</h1>
            <GalleryTabs
                onItemClick={handleItemClick}
                headerExtra={(
                    <button
                        type="button"
                        className="tab-button browse-btn"
                        onClick={() => setShowSlider(true)}
                    >
                        Przeglądaj
                    </button>
                )}
            />
            {showSlider && (
                <SliderModal startId={0} onClose={() => setShowSlider(false)} />
            )}
        </main>
    );
};

export default GalleryPage;
