import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import "./Alert.css";

interface AlertData {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface Props {
  alerts: AlertData[];
  onRemove: (id: number) => void;
}

const AlertStack = ({ alerts, onRemove }: Props) => {
  const [fadeOutIds, setFadeOutIds] = useState<number[]>([]);

  const iconMap = {
    success: <CheckCircle size={20} />,
    error: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  useEffect(() => {
    const timers = alerts.map((alert) => {
      const fadeTimer = setTimeout(
        () => setFadeOutIds((ids) => [...ids, alert.id]),
        3700,
      );
      const removeTimer = setTimeout(() => onRemove(alert.id), 8000);
      return [fadeTimer, removeTimer];
    });

    return () => {
      timers.flat().forEach(clearTimeout);
    };
  }, [alerts, onRemove]);

  return (
    <div className="alert-stack">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`alert alert-${alert.type} ${fadeOutIds.includes(alert.id) ? "fade-out" : ""}`}
        >
          <div className="alert-content">
            {iconMap[alert.type]}
            <span>{alert.message}</span>
          </div>
          <div className="alert-buttons">
            <button className="alert-close" onClick={() => onRemove(alert.id)}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertStack;
