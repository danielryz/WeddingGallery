import React, { useState } from 'react';

const UploadForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <form className="bg-cream p-4 rounded shadow max-w-md">
            {/* Obszar drag-and-drop / wybór pliku */}
            <label
                htmlFor="fileUpload"
                className="block cursor-pointer border-2 border-dashed border-gold rounded-lg p-6 text-center"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setFile(e.dataTransfer.files[0]);
                    }
                }}
            >
                {file ? (
                    <div>
                        {file.type.startsWith('image') ? (
                            <img
                                src={URL.createObjectURL(file)}
                                alt="podgląd"
                                className="mx-auto mb-4 max-h-40"
                            />
                        ) : (
                            <video
                                src={URL.createObjectURL(file)}
                                className="mx-auto mb-4 max-h-40"
                                controls
                            />
                        )}
                        <p className="text-sm text-brown">Zmień plik</p>
                    </div>
                ) : (
                    <p className="text-brown">
                        Przeciągnij i upuść plik tutaj lub kliknij, aby wybrać
                    </p>
                )}
                <input
                    id="fileUpload"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>

            {/* Przycisk Wyślij */}
            <button
                type="submit"
                className="mt-4 px-4 py-2 bg-cream text-brown border border-gold rounded
                   hover:bg-gold hover:text-white transition-colors"
            >
                Wyślij
            </button>
        </form>
    );
};

export default UploadForm;
