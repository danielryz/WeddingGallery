import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { savePhoto } from '../../api/photos';
import './WishUploadForm.css';
import { useAlerts } from '../alert/useAlerts';

const MAX_FILE_SIZE_MB = 2000;

const WishUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const showAlert = useAlerts();

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showAlert(`Plik przekracza ${MAX_FILE_SIZE_MB}MB`, 'error');
      return;
    }
    setFile(f);
  }, [showAlert]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    try {
      await savePhoto(file, description, true, e => {
        setProgress(Math.round((e.loaded * 100) / (e.total || 1)));
      });
      showAlert('Wysłano!', 'success');
      setFile(null);
      setDescription('');
      setProgress(0);
    } catch {
      showAlert('Błąd wysyłania.', 'error');
      setProgress(0);
    }
  };

  const removeFile = () => setFile(null);

  return (
    <div className="wish-upload-container">
      <div {...getRootProps()} className="wish-dropzone">
        <input {...getInputProps()} />
        <p>Przeciągnij plik lub kliknij</p>
      </div>
      {file && (
        <div className="wish-preview">
          {file.type.startsWith('image/') ? (
            <img src={URL.createObjectURL(file)} className="wish-media" />
          ) : (
            <video src={URL.createObjectURL(file)} className="wish-media" controls />
          )}
          <button className="btn btn-danger remove-btn" onClick={removeFile}>Usuń</button>
        </div>
      )}
      <textarea
        className="wish-desc-input"
        placeholder="Dodaj opis..."
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      {file && (
        <>
          <button className="btn btn-primary upload-submit-btn" onClick={handleUpload}>
            Wyślij życzenia
          </button>
          {progress > 0 && progress < 100 && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
          {progress === 100 && <p className="upload-progress">Gotowe!</p>}
        </>
      )}
    </div>
  );
};

export default WishUploadForm;
