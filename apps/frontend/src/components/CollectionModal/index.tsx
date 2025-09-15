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
    <div className={styles.collectionModal}>
      <div className={styles["collectionModal__content"]}>
        <span className={styles["collectionModal__close"]} onClick={onClose}>
          &times;
        </span>
        <div className={styles["collectionModal__header"]}>
          <h2 className={styles["collectionModal__title"]}>{pokecat.name}</h2>
        </div>
        <div className={styles["collectionModal__body"]}>
          <img
            className={styles["collectionModal__image"]}
            src={pokecat.iconUrl}
            alt={pokecat.name}
          />
          <p className={styles["collectionModal__text"]}>Rarity: {pokecat.rarity}</p>
          <p className={styles["collectionModal__text"]}>Status: {pokecat.status}</p>
          <p className={styles["collectionModal__text"]}>
            Expires At: {new Date(pokecat.expiresAt).toLocaleString()}
          </p>
        </div>
        <div className={styles["collectionModal__footer"]}>
          <button className={styles["collectionModal__button"]} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
