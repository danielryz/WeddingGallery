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
    const [progress, setProgress] = useState<number>(0);
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const validFiles = acceptedFiles.filter((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
        const newItems = validFiles.map((file) => ({ file, description: '' }));
        const total = files.length + newItems.length;

        if (total > MAX_FILES) {
            alert(`Możesz dodać maksymalnie ${MAX_FILES} plików.`);
            return;
        }

        if (validFiles.length < acceptedFiles.length) {
            alert(`Niektóre pliki przekroczyły limit ${MAX_FILE_SIZE_MB} MB i zostały pominięte.`);
        }

        setFiles((prev) => [...prev, ...newItems]);
    }, [files]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': [], 'video/*': [] },
        multiple: true,
    });

    const handleDescriptionChange = (index: number, desc: string) => {
        const updated = [...files];
        updated[index].description = desc;
        setFiles(updated);
    };

    const handleRemove = (index: number) => {
        const updated = [...files];
        updated.splice(index, 1);
        setFiles(updated);
    };

    const resetForm = () => {
        setFiles([]);
        setProgress(0);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        const fileList = files.map((f) => f.file);
        const descriptionList = files.map((f) => f.description);

        try {
            await savePhotos(fileList, descriptionList, (e) => {
                setProgress(Math.round((e.loaded * 100) / (e.total || 1)));
            });
            alert('Pliki zostały dodane do galerii!');
            resetForm();
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Błąd podczas wysyłania.');
        }
    };

    return (
        <div className="bg-cream p-4 rounded shadow max-w-md mx-auto">
            <div
                {...getRootProps()}
                className="border-2 border-dashed border-gold rounded p-6 text-center cursor-pointer mb-4"
            >
                <input {...getInputProps()} />
                <p className="text-brown font-semibold">
                    Przeciągnij zdjęcia/filmy tutaj lub kliknij, aby wybrać
                </p>
            </div>

            {files.map((item, index) => (
                <div key={index} className="mb-4 border border-gold p-2 rounded bg-white">
                    {item.file.type.startsWith('image/') ? (
                        <img
                            src={URL.createObjectURL(item.file)}
                            alt="preview"
                            className="w-full h-48 object-cover rounded"
                        />
                    ) : (
                        <video
                            src={URL.createObjectURL(item.file)}
                            controls
                            className="w-full h-48 object-cover rounded"
                        />
                    )}

                    <textarea
                        placeholder="Dodaj opis..."
                        className="w-full mt-2 border rounded p-2 text-sm resize-none"
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    />

                    <button
                        onClick={() => handleRemove(index)}
                        className="mt-2 text-xs text-red-500 underline"
                    >
                        Usuń
                    </button>
                </div>
            ))}

            {files.length > 0 && (
                <>
                    <button
                        onClick={handleUpload}
                        className="px-4 py-2 bg-gold text-white rounded hover:opacity-90 transition w-full mt-2"
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
