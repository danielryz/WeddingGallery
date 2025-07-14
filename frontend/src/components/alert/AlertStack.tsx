import { useEffect, useState } from "react";
import "./Alert.css";

interface AlertData {
  id: number;
  message: string;
  type: "success" | "error";
}

interface Props {
  alerts: AlertData[];
  onRemove: (id: number) => void;
}

const AlertStack = ({ alerts, onRemove }: Props) => {
  const [fadeOutIds, setFadeOutIds] = useState<number[]>([]);

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
          <span>{alert.message}</span>
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
