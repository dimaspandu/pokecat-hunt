import React from "react";
import styles from "./CollectionModal.module.scss";

interface Pokecat {
  id: string;
  name: string;
  iconUrl: string;
  lat: number;
  lng: number;
  status: string;
  expiresAt: number;
  rarity: string;
}

interface CollectionModalProps {
  pokecat: Pokecat;
  onClose: () => void;
}

const CollectionModal: React.FC<CollectionModalProps> = ({ pokecat, onClose }) => {
  return (
    <div className={styles["collection-modal"]}>
      <div className={styles["collection-modal__content"]}>
        <span className={styles["collection-modal__close"]} onClick={onClose}>
          &times;
        </span>
        <div className={styles["collection-modal__header"]}>
          <h2 className={styles["collection-modal__title"]}>{pokecat.name}</h2>
        </div>
        <div className={styles["collection-modal__body"]}>
          <img
            className={styles["collection-modal__image"]}
            src={pokecat.iconUrl}
            alt={pokecat.name}
          />
          <p className={styles["collection-modal__text"]}>Rarity: {pokecat.rarity}</p>
          <p className={styles["collection-modal__text"]}>Status: {pokecat.status}</p>
          <p className={styles["collection-modal__text"]}>
            Expires At: {new Date(pokecat.expiresAt).toLocaleString()}
          </p>
        </div>
        <div className={styles["collection-modal__footer"]}>
          <button className={styles["collection-modal__button"]} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
