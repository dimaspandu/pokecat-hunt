import { useState } from "react";
import { type Pokecat } from "@/types/pokecat";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  caughtList: Pokecat[];
  openModal: (pokecat: Pokecat) => void;
}

export default function Sidebar({ caughtList, openModal }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={`${styles.hamburger} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        <h2 className={styles.sidebar__title}>Your Collection</h2>
        {caughtList.length === 0 ? (
          <p className={styles.sidebar__empty}>No Pokecats caught yet.</p>
        ) : (
          <ul className={styles.sidebar__list}>
            {caughtList.map((cat) => (
              <li
                key={cat.id}
                className={styles.sidebar__item}
                onClick={() => openModal(cat)}
              >
                <span>{cat.name}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}
