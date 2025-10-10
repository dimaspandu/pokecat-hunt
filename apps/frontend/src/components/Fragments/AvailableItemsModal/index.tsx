import { type GameItem } from "~/types/GameItem";
import { type ItemDefinition } from "~/types/ItemDefinition";
import styles from "./AvailableItemsModal.module.scss";

interface AvailableItemsModalProps {
  items: (GameItem & ItemDefinition)[];
  onUse: (item: GameItem & ItemDefinition) => void;
  onClose: () => void;
}

/**
 * AvailableItemsModal component
 * 
 * Displays a list of available items to use during the catch sequence.
 * Each item includes its icon, name, description, quantity, and success rate.
 * Modal can be closed via the Cancel button.
 */
export default function AvailableItemsModal({ items, onUse, onClose }: AvailableItemsModalProps) {
  return (
    <div className={styles["available-modal"]}>
      <h3 className={styles["available-modal__title"]}>Choose a food item</h3>

      <div className={styles["available-modal__items"]}>
        {items.map((item) => (
          <div key={item.id} className={styles["available-modal__item"]}>
            <img src={item.iconUrl} alt={item.name} className={styles["available-modal__item-image"]} />
            <div className={styles["available-modal__item-info"]}>
              <strong>{item.name}</strong> ×{item.quantity}
              <div>{item.description}</div>
              <div>Catch Success: {((item.catchRate ?? 0.7) * 100).toFixed(0)}%</div>
              <button
                onClick={() => onUse(item)}
                className={styles["available-modal__btn-use"]}
              >
                Use
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onClose} className={styles["available-modal__btn-cancel"]}>
        Cancel
      </button>
    </div>
  );
}
