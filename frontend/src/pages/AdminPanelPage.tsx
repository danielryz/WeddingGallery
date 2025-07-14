import React, { useState, useEffect } from 'react';
import {downloadArchive, downloadArchiveWithDescription} from "../api/photos.ts";

export const AdminPanelPage: React.FC = () => {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [downloadUrl2, setDownloadUrl2] = useState<string | null>(null);
    const [loading2, setLoading2] = useState(false);
    const [error2, setError2] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
            if (downloadUrl2) {
                URL.revokeObjectURL(downloadUrl2);
            }
        };
    }, [downloadUrl, downloadUrl2]);

    const handleDownloadClick1 = async () => {
        setLoading(true);
        setError(null);
        try {
            const blob = await downloadArchive();
            const url = URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
            setDownloadUrl(url);
        } catch (e: any) {
            console.error(e);
            setError('Nie udało się pobrać archiwum.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadClick2 = async () => {
        setLoading2(true);
        setError2(null);
        try {
            const blob = await downloadArchiveWithDescription();
            const url = URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
            setDownloadUrl2(url);
        } catch (e: any) {
            console.error(e);
            setError2('Nie udało się pobrać archiwum z opisami.');
        } finally {
            setLoading2(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleDownloadClick1}
                disabled={loading}
                style={{
                    padding: '0.5rem 1rem',
                    background: '#D4AF37',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    gap: '1rem'
                }}
            >
                {loading ? 'Ładowanie...' : 'Pobierz archiwum'}
            </button>

            <button
                onClick={handleDownloadClick2}
                disabled={loading2}
                style={{
                    padding: '0.5rem 1rem',
                    background: '#D4AF37',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: loading2 ? 'not-allowed' : 'pointer',
                    gap: '1rem'
                }}
            >
                {loading2 ? 'Ładowanie...' : 'Pobierz archiwum z opisami'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {error2 && <p style={{ color: 'red' }}>{error2}</p>}

            {downloadUrl && (
                <p style={{ marginTop: '1rem' }}>
                    <a
                        href={downloadUrl}
                        download="photos-archive.zip"
                        style={{ color: '#D4AF37', textDecoration: 'underline' }}
                    >
                        Kliknij tutaj, aby pobrać archiwum
                    </a>
                </p>
            )}

            {downloadUrl2 && (
                <p style={{ marginTop: '1rem' }}>
                    <a
                        href={downloadUrl2}
                        download="photos-archive-with-description.zip"
                        style={{ color: '#D4AF37', textDecoration: 'underline' }}
                        >
                        Kliknij tutaj, aby pobrać archiwum z opisami
                    </a>
                </p>
            )}
        </div>
    );
};
export default AdminPanelPage;
