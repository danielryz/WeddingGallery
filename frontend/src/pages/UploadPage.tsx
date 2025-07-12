import React from 'react';
import UploadForm from '../components/Upload/UploadForm';
import './UploadPage.css';

const UploadPage: React.FC = () => {
    return (
        <main className="upload-page">
            <h1 className="upload-title">Dodaj zdjęcia i filmy</h1>
            <UploadForm />
        </main>
    );
};

export default UploadPage;
