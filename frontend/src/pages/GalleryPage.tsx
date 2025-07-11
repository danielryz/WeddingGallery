import React from 'react';
import GalleryTabs from '../components/Gallery/GalleryTabs';

const GalleryPage: React.FC = () => {
    return (
        <main className="p-4">
            <h1 className="text-2xl font-elegant text-brown text-center mb-6">
                Nasza Galeria Ślubna
            </h1>
            <GalleryTabs />
        </main>
    );
};

export default GalleryPage;
