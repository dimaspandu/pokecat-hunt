import { useGameStore } from "~/stores/useGameStore";
import SceneHeader from "~/components/SceneHeader";
import styles from "./CollectionScene.module.scss";

export default function CollectionScene() {
  const { caughtList, openModal } = useGameStore();

  return (
    <div className={styles["collection-scene"]}>
      <SceneHeader title="Your Pokecat Collection" />

      {caughtList.length === 0 ? (
        <p className={styles["collection-scene__empty"]}>
          You haven't caught any Pokecats yet.
        </p>
      ) : (
        <div className={styles["collection-scene__grid"]}>
          {caughtList.map((cat) => (
            <div
              key={cat.id}
              className={`${styles["collection-scene__card"]} ${
                styles[`collection-scene__card--${cat.rarity}`]
              }`}
              onClick={() => openModal(cat)}
            >
              <img
                src={cat.iconUrl}
                alt={cat.name}
                className={styles["collection-scene__image"]}
              />
              <div className={styles["collection-scene__info"]}>
                <h3 className={styles["collection-scene__name"]}>{cat.name}</h3>
                <p className={styles["collection-scene__rarity"]}>
                  {cat.rarity}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
