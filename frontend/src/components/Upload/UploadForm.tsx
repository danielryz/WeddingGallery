import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { savePhotos } from '../../api/photos';

interface UploadItem {
    file: File;
    description: string;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 100;

const UploadForm: React.FC = () => {
    const [files, setFiles] = useState<UploadItem[]>([]);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    // Obsługa dodawania plików przez dropzone
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Odfiltruj zbyt duże pliki
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
            // Wyślij pliki do API (z opcją śledzenia postępu)
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
        <div className="bg-cream p-4 rounded-xl shadow max-w-md mx-auto">
            {/* Obszar "przeciągnij i upuść" */}
            <div
                {...getRootProps()}
                className="border-2 border-dashed border-gold rounded p-6 text-center cursor-pointer mb-4"
            >
                <input {...getInputProps()} />
                <p className="text-brown font-semibold">
                    Przeciągnij zdjęcia/filmy tutaj lub kliknij, aby wybrać pliki
                </p>
            </div>

            {/* Lista dodanych plików z podglądem i opisem */}
            {files.map((item, index) => (
                <div key={index} className="mb-4 border border-gold p-2 rounded bg-white">
                    {item.file.type.startsWith('image/') ? (
                        <img
                            src={URL.createObjectURL(item.file)}
                            alt="podgląd"
                            className="w-full h-48 object-cover rounded"
                        />
                    ) : (
                        <video
                            src={URL.createObjectURL(item.file)}
                            className="w-full h-48 object-cover rounded"
                            controls
                        />
                    )}
                    <textarea
                        placeholder="Dodaj opis..."
                        className="w-full mt-2 border rounded p-2 text-sm resize-none"
                        value={item.description}
                        onChange={e => handleDescriptionChange(index, e.target.value)}
                    />
                    <button
                        onClick={() => handleRemove(index)}
                        className="mt-2 text-xs text-red-500 underline"
                    >
                        Usuń
                    </button>
                </div>
            ))}

            {/* Przycisk wysyłania oraz wskaźnik postępu */}
            {files.length > 0 && (
                <>
                    <button
                        onClick={handleUpload}
                        className="px-4 py-2 bg-gold text-white rounded hover:opacity-90 transition w-full"
                    >
                        Wyślij do galerii
                    </button>
                    {progress > 0 && (
                        <p className="mt-2 text-sm text-brown">Wysyłanie: {progress}%</p>
                    )}
                </>
            )}
        </div>
    );
};

export default UploadForm;
