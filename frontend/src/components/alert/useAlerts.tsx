import { createContext, useContext, useRef, useState, ReactNode } from 'react';
import AlertStack from './AlertStack';

export type AlertType = 'success' | 'error' | 'info';

interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

interface AlertsContextValue {
  showAlert: (message: string, type: AlertType) => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const nextId = useRef(0);

  const showAlert = (message: string, type: AlertType) => {
    const id = nextId.current++;
    setAlerts(prev => [...prev, { id, message, type }]);
  };

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AlertsContext.Provider value={{ showAlert }}>
      {children}
      <AlertStack alerts={alerts} onRemove={removeAlert} />
    </AlertsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAlerts = () => {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx.showAlert;
};
