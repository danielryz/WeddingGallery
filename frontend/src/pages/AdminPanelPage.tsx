import React, { useState, useEffect } from 'react';
import {downloadArchive, downloadArchiveWithDescription} from "../api/photos.ts";
import { useAlerts } from "../components/alert/useAlerts"

export const AdminPanelPage: React.FC = () => {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [downloadUrl2, setDownloadUrl2] = useState<string | null>(null);
    const [loading2, setLoading2] = useState(false);

    const showAlert = useAlerts();

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
        try {
            const blob = await downloadArchive();
            const url = URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
            setDownloadUrl(url);
            showAlert('Link wygenerowany poprawnie.', 'success');
        } catch (e: unknown) {
            console.error(e);
            showAlert('Nie udało się pobrać archiwum.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadClick2 = async () => {
        setLoading2(true);
        try {
            const blob = await downloadArchiveWithDescription();
            const url = URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
            setDownloadUrl2(url);
            showAlert('Link wygenerowany poprawnie.', 'success');
        } catch (e: unknown) {
            console.error(e);
            showAlert('Nie udało się pobrać archiwum z opisami.', 'error');
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
