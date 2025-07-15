// src/components/UploadForm.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { savePhotos } from '../../api/photos';
import './UploadForm.css';
import { useAlerts } from '../../components/alert/useAlerts'

interface UploadItem {
    file: File;
    description: string;
}

const MAX_FILES = 9;
const MAX_FILE_SIZE_MB = 2000;

const UploadForm: React.FC = () => {
    const [files, setFiles] = useState<UploadItem[]>([]);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();
    const showAlert = useAlerts();

    const onDrop = useCallback((accepted: File[]) => {
        const valid = accepted.filter(f => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
        const newItems = valid.map(f => ({ file: f, description: '' }));
        if (files.length + newItems.length > MAX_FILES) {
            showAlert(`Możesz dodać max ${MAX_FILES} plików.`, 'error');
            return;
        }
        if (valid.length < accepted.length) {
            showAlert(`Niektóre pliki przekroczyły ${MAX_FILE_SIZE_MB}MB i pominięto.`, 'error');
        }
        setFiles(prev => [...prev, ...newItems]);
    }, [files, showAlert]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop, accept: { 'image/*': [], 'video/*': [] }, multiple: true
    });

    const handleDesc = (i: number, desc: string) =>
        setFiles(prev => prev.map((it, j) => j === i ? { ...it, description: desc } : it));

    const handleRemove = (i: number) =>
        setFiles(prev => prev.filter((_, j) => j !== i));

    const handleUpload = async () => {
        if (!files.length) return;
        try {
            await savePhotos(
                files.map(x => x.file),
                files.map(x => x.description),
                e => setProgress(Math.round(e.loaded * 100 / (e.total || 1)))
            );
            showAlert('Wysłano!', 'success');
            setFiles([]); setProgress(0);
            navigate('/gallery');
        } catch {
            showAlert('Błąd wysyłania.', 'error');
            setProgress(0);
            setFiles(
                files.map(x => ({ ...x, description: '' }))
            )
        }
    };

    return (
        <div className="upload-form-container">
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Przeciągnij zdjęcia/filmy lub kliknij</p>
            </div>

            {files.length > 0 && (
                <div className="previews-grid">
                    {files.map((it, i) => (
                        <div key={i} className="preview-item">
                            {it.file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(it.file)}
                                    alt="podgląd"
                                    className="preview-media"
                                />
                            ) : (
                                <video
                                    src={URL.createObjectURL(it.file)}
                                    className="preview-media"
                                    controls
                                />
                            )}
                            <textarea
                                className="desc-input"
                                placeholder="Dodaj opis..."
                                value={it.description}
                                onChange={e => handleDesc(i, e.target.value)}
                            />
                            <button
                                className="remove-btn"
                                onClick={() => handleRemove(i)}
                            >Usuń</button>
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <>
                    <button
                        className="upload-submit-btn"
                        onClick={handleUpload}
                    >Wyślij do galerii</button>

                    {/* pasek postępu */}
                    {progress > 0 && progress < 100 && (
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                    {progress === 100 && (
                        <p className="upload-progress">Gotowe!</p>
                    )}
                </>
            )}
        </div>
    );
};

export default UploadForm;
