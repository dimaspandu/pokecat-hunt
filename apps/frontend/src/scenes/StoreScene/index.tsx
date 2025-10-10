import { useGameStore } from "~/stores/useGameStore";
import { useState } from "react";
import SceneHeader from "~/components/SceneHeader";
import CatCoin from "~/components/2D/CatCoin";
import { ITEMS } from "~/constants/items";
import type { ItemDefinition } from "~/types/ItemDefinition";
import { ITEM_CATEGORY_LABELS, ITEM_CATEGORY_COLORS } from "~/constants/itemCategories";
import styles from "./StoreScene.module.scss";

export default function StoreScene() {
  const { dirhams, addItem, spendDirhams, setNotification } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleBuy = () => {
    if (!selectedItem) return;
    const total = selectedItem.price * quantity;
    if (dirhams < total) {
      setNotification({ message: "Not enough dirhams!", type: "error" });
      return;
    }

    spendDirhams(total);
    addItem(selectedItem, quantity);
    setNotification({
      message: `You bought ${quantity} × ${selectedItem.name}!`,
      type: "success",
    });

    setSelectedItem(null);
    setQuantity(1);
  };

  const changeQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className={styles["store-scene"]}>
      <SceneHeader title="Pokecat Store" />

      <div className={styles["store-scene__balance-wrapper"]}>
        <div className={styles["store-scene__balance"]}>
          <CatCoin width={48} height={48} className={styles["store-scene__balance-icon"]} />
          <div className={styles["store-scene__balance-text"]}>
            <span className={styles["store-scene__balance-label"]}>Balance</span>
            <span className={styles["store-scene__balance-amount"]}>
              {dirhams.toLocaleString()} dirham
            </span>
          </div>
        </div>
      </div>

      <div className={styles["store-scene__grid"]}>
        {ITEMS.map((item) => {
          const Icon = item.iconComponent;
          const categoryColor = ITEM_CATEGORY_COLORS[item.category || "food"];
          return (
            <div
              key={item.id}
              className={styles["store-scene__card"]}
              onClick={() => setSelectedItem(item)}
            >
              <div
                className={styles["store-scene__icon"]}
                style={{ borderColor: categoryColor }}
              >
                {Icon ? <Icon /> : item.iconUrl && <img src={item.iconUrl} alt={item.name} />}
              </div>
              <h3 className={styles["store-scene__name"]}>{item.name}</h3>
              <p className={styles["store-scene__category"]} style={{ color: categoryColor }}>
                {ITEM_CATEGORY_LABELS[item.category || "food"]}
              </p>
              <p className={styles["store-scene__price"]}>{item.price} dirham</p>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div className={styles["store-scene__modal-overlay"]}>
          <div className={styles["store-scene__modal"]}>
            <h2>{selectedItem.name}</h2>
            <p className={styles["store-scene__desc"]}>{selectedItem.description}</p>

            <div className={styles["store-scene__modal-body"]}>
              <div className={styles["store-scene__modal-info"]}>
                <p><strong>Price:</strong> {selectedItem.price} dirham</p>
                <p><strong>Effect:</strong> {selectedItem.useEffect || "—"}</p>
                <p><strong>Rarity:</strong> {selectedItem.rarity}</p>
                <p>
                  <strong>Category:</strong>{" "}
                  <span style={{ color: ITEM_CATEGORY_COLORS[selectedItem.category || "food"] }}>
                    {ITEM_CATEGORY_LABELS[selectedItem.category || "food"]}
                  </span>
                </p>
                {selectedItem.catchRate !== undefined && (
                  <p><strong>Catch Rate:</strong> {Math.round(selectedItem.catchRate * 100)}%</p>
                )}
              </div>

              <div className={styles["store-scene__modal-quantity"]}>
                <label>Quantity:</label>
                <div className={styles["store-scene__quantity-controls"]}>
                  <button type="button" onClick={() => changeQuantity(-1)}>−</button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                  <button type="button" onClick={() => changeQuantity(1)}>+</button>
                </div>
              </div>

              <div className={styles["store-scene__modal-total"]}>
                Total: <strong>{selectedItem.price * quantity} dirham</strong>
              </div>

              <div className={styles["store-scene__modal-actions"]}>
                <button onClick={handleBuy} className={styles["store-scene__btn-buy"]}>
                  Buy
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className={styles["store-scene__btn-cancel"]}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
