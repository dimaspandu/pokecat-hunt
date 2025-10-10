import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "~/stores/useGameStore";
import { ITEMS } from "~/constants/items";
import type { ItemDefinition } from "~/types/ItemDefinition";
import SceneHeader from "~/components/SceneHeader";
import styles from "./BackpackScene.module.scss";

export default function BackpackScene() {
  const [selectedItem, setSelectedItem] = useState<(ItemDefinition & { quantity: number }) | null>(null);
  const navigate = useNavigate();

  const { items } = useGameStore();


  return (
    <div className={styles["backpack-scene"]}>
      <SceneHeader title="Your Backpack" />

      <div className={styles["backpack-scene__content"]}>
        {items.length === 0 ? (
          <div className={styles["backpack-scene__empty-wrapper"]}>
            <p className={styles["backpack-scene__empty"]}>Your backpack is empty.</p>
            <button
              className={styles["backpack-scene__btn-store"]}
              onClick={() => navigate("/store")}
            >
              Go to Store
            </button>
          </div>
        ) : (
          <ul className={styles["backpack-scene__list"]}>
            {items.map((item) => {
              const Icon = item.iconComponent;
              const handleClick = () => {
                const fullItem = ITEMS.find((i) => i.id === item.id);
                if (!fullItem) return;
                setSelectedItem({ ...fullItem, quantity: item.quantity });
              };

              return (
                <li
                  key={item.id}
                  className={styles["backpack-scene__item"]}
                  onClick={handleClick}
                >
                  <div className={styles["backpack-scene__item-icon"]}>
                    {Icon ? (
                      <Icon width={48} height={48} />
                    ) : item.iconUrl ? (
                      <img src={item.iconUrl} alt={item.name} />
                    ) : null}
                  </div>
                  <div className={styles["backpack-scene__item-name"]}>{item.name}</div>
                  <div className={styles["backpack-scene__item-count"]}>×{item.quantity}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedItem && (
        <div className={styles["backpack-scene__modal-overlay"]}>
          <div className={styles["backpack-scene__modal"]}>
            <div className={styles["backpack-scene__modal-image"]}>
              {selectedItem.iconComponent ? (
                <selectedItem.iconComponent width={120} height={120} />
              ) : selectedItem.iconUrl ? (
                <img src={selectedItem.iconUrl} alt={selectedItem.name} />
              ) : null}
            </div>

            <h2>{selectedItem.name}</h2>

            <p className={styles["backpack-scene__desc"]}>
              {selectedItem.description}
            </p>

            <div className={styles["backpack-scene__modal-body"]}>
              <p><strong>Category:</strong> {selectedItem.category}</p>
              <p><strong>Rarity:</strong> {selectedItem.rarity}</p>
              {selectedItem.useEffect && (
                <p><strong>Effect:</strong> {selectedItem.useEffect}</p>
              )}
              {selectedItem.catchRate !== undefined && (
                <p><strong>Catch Rate:</strong> {Math.round(selectedItem.catchRate * 100)}%</p>
              )}
              <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
              <button
                className={styles["backpack-scene__btn-cancel"]}
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
