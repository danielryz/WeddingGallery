import React from 'react';
import UploadForm from '../components/Upload/UploadForm';

const UploadPage: React.FC = () => {
    return (
        <main className="p-4">
            <h1 className="text-2xl font-elegant text-brown text-center mb-4">Dodaj zdjęcia i filmy</h1>
            <UploadForm />
        </main>
    );
};

export default UploadPage;
