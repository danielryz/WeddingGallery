import React from 'react';
import { useNavigate } from 'react-router-dom';
import GalleryTabs from '../components/Gallery/GalleryTabs';

const GalleryPage: React.FC = () => {
    const navigate = useNavigate();

    // Po kliknięciu elementu galerii przejdź do strony szczegółów zdjęcia
    const handleItemClick = (id: number) => {
        navigate(`/photo/${id}`);
    };

    return (
        <main className="p-4">
            <h1 className="text-2xl font-elegant text-brown text-center mb-6">
                Nasza Galeria Ślubna
            </h1>
            {/* Komponent z zakładkami "Zdjęcia / Filmy" oraz siatką miniatur */}
            <GalleryTabs onItemClick={handleItemClick} />
        </main>
    );
};

export default GalleryPage;
