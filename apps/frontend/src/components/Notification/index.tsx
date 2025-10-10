import { useEffect } from "react";
import type { NotificationProps } from "~/types/NotificationProps";
import styles from "./Notification.module.scss";

interface NotificationPropsExtended extends NotificationProps {
  onClose: () => void;
}

export default function Notification({ message, type, onClose }: NotificationPropsExtended) {
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
