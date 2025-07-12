import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { savePhotos } from '../../api/photos';
import './UploadForm.css';

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

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const validFiles = acceptedFiles.filter(file => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
        const newItems = validFiles.map(file => ({ file, description: '' }));
        const totalCount = files.length + newItems.length;
        if (totalCount > MAX_FILES) {
            alert(`Możesz dodać maksymalnie ${MAX_FILES} plików.`);
            return;
        }
        if (validFiles.length < acceptedFiles.length) {
            alert(`Niektóre pliki przekroczyły limit ${MAX_FILE_SIZE_MB}MB i zostały pominięte.`);
        }
        setFiles(prev => [...prev, ...newItems]);
    }, [files]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': [], 'video/*': [] },
        multiple: true
    });

    const handleDescriptionChange = (index: number, desc: string) => {
        setFiles(prev => {
            const updated = [...prev];
            updated[index].description = desc;
            return updated;
        });
    };

    const handleRemove = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        const fileList = files.map(item => item.file);
        const descList = files.map(item => item.description);
        try {
            await savePhotos(fileList, descList, e => {
                setProgress(Math.round((e.loaded * 100) / (e.total || 1)));
            });
            alert('Pliki zostały dodane do galerii!');
            setFiles([]);
            setProgress(0);
            navigate('/gallery');
        } catch (err) {
            console.error('Błąd wysyłania plików:', err);
            alert('Wystąpił błąd podczas wysyłania. Spróbuj ponownie.');
        }
    };

    return (
        <div className="upload-form-container">
            {/* Obszar "przeciągnij i upuść" */}
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Przeciągnij zdjęcia/filmy tutaj lub kliknij, aby wybrać pliki</p>
            </div>

            {/* Lista dodanych plików z podglądem i opisem */}
            {files.map((item, index) => (
                <div key={index} className="preview-item">
                    {item.file.type.startsWith('image/') ? (
                        <img
                            src={URL.createObjectURL(item.file)}
                            alt="podgląd"
                            className="preview-media"
                        />
                    ) : (
                        <video
                            src={URL.createObjectURL(item.file)}
                            className="preview-media"
                            controls
                        />
                    )}
                    <textarea
                        placeholder="Dodaj opis..."
                        className="desc-input"
                        value={item.description}
                        onChange={e => handleDescriptionChange(index, e.target.value)}
                    />
                    <button
                        onClick={() => handleRemove(index)}
                        className="remove-btn"
                    >
                        Usuń
                    </button>
                </div>
            ))}

            {/* Przycisk wysyłania oraz wskaźnik postępu */}
            {files.length > 0 && (
                <>
                    <button onClick={handleUpload} className="upload-submit-btn">
                        Wyślij do galerii
                    </button>
                    {progress > 0 && (
                        <p className="upload-progress">Wysyłanie: {progress}%</p>
                    )}
                </>
            )}
        </div>
    );
};

export default UploadForm;
