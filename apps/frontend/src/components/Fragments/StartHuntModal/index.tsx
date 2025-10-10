import { useEffect, useRef, useState } from "react";
import styles from "./StartHuntModal.module.scss";

interface StartHuntModalProps {
  onStart: (name: string) => void;
}

export default function StartHuntModal({ onStart }: StartHuntModalProps) {
  const [userName, setUserName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Automatically focus input when modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = userName.trim();
    if (!trimmed) return;
    onStart(trimmed);
  };

  return (
    <div className={styles["start-hunt-modal"]}>
      <div className={styles["start-hunt-modal__backdrop"]}>
        <div className={styles["start-hunt-modal__content"]}>
          <h2 className={styles["start-hunt-modal__title"]}>
            Enter Your Trainer Name
          </h2>
          <input
            ref={inputRef}
            type="text"
            className={styles["start-hunt-modal__input"]}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ash, Misty, etc."
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            className={styles["start-hunt-modal__button"]}
            onClick={handleSubmit}
          >
            Start Hunting
          </button>
        </div>
      </div>
    </div>
  );
}
