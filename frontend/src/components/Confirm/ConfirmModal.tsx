import './ConfirmModal.css';

interface ConfirmModalProps {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({ title = 'Potwierdzenie', message, onConfirm, onCancel }: ConfirmModalProps) => {
    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-actions">
                    <button onClick={onConfirm} className="confirm-yes">Tak</button>
                    <button onClick={onCancel} className="confirm-no">Anuluj</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
