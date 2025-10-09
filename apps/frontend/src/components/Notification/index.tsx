import { useEffect } from 'react';
import styles from './Notification.module.scss';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  useEffect(() => {
    const timeout = setTimeout(() => onClose(), 7500);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className={`${styles.notification} ${styles[`notification--${type}`]}`}>
      {message}
    </div>
  );
}
