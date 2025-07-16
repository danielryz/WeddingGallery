import React, { useState } from 'react';
import GalleryTabs from '../components/Gallery/GalleryTabs';
import SliderModal from '../components/SliderModal';
import './GalleryPage.css';

const GalleryPage: React.FC = () => {
    const [openId, setOpenId] = useState<number | null>(null);

    const handleItemClick = (id: number) => {
        setOpenId(id);
    };

    const closeModal = () => setOpenId(null);

    return (
        <main className="gallery-page">
            <h1 className="gallery-title">Nasza Galeria Ślubna</h1>
            <GalleryTabs onItemClick={handleItemClick} />
            {openId !== null && (
                <SliderModal startId={openId} onClose={closeModal} />
            )}
        </main>
    );
};

export default GalleryPage;
