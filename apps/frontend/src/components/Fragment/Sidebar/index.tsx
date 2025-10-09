import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/stores/useGameStore";
import {
  CollectionIcon,
  BackpackIcon,
  StoreIcon,
  ScannerIcon,
  CreatorIcon,
} from "@/components/Icons/SidebarMenu";
import PokecatIcon from "@/components/Icons/PokecatIcon";
import ChevronRightIcon from "@/components/Icons/ChevronRightIcon";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  const { caughtList, openModal } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menus = [
    { label: "Collection", path: "/collection", icon: <CollectionIcon /> },
    { label: "Backpack", path: "/backpack", icon: <BackpackIcon /> },
    { label: "Store", path: "/store", icon: <StoreIcon /> },
    { label: "Scanner", path: "/scanner", icon: <ScannerIcon /> },
    { label: "Creator", path: "/creator", icon: <CreatorIcon /> },
  ];

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
        className={`${styles.sidebar} ${isOpen ? styles["sidebar--open"] : ""}`}
      >
        <h2 className={styles["sidebar__title"]}>Menu</h2>

        <nav className={styles["sidebar__nav"]}>
          <ul className={styles["sidebar__menu-list"]}>
            {menus.map((menu) => (
              <li
                key={menu.path}
                className={styles["sidebar__menu-item"]}
                onClick={() => {
                  setIsOpen(false);
                  navigate(menu.path);
                }}
              >
                <div className={styles["sidebar__menu-left"]}>
                  <span className={styles["sidebar__menu-icon"]}>
                    {menu.icon}
                  </span>
                  <span className={styles["sidebar__menu-label"]}>
                    {menu.label}
                  </span>
                </div>
                <ChevronRightIcon className={styles["sidebar__menu-chevron"]} />
              </li>
            ))}
          </ul>
        </nav>

        <h3 className={styles["sidebar__subtitle"]}>Your Cats</h3>
        {caughtList.length === 0 ? (
          <p className={styles["sidebar__empty"]}>No Pokecats caught yet.</p>
        ) : (
          <ul className={styles["sidebar__list"]}>
            {caughtList.map((cat) => (
              <li
                key={cat.id}
                className={styles["sidebar__item"]}
                onClick={() => openModal(cat)}
              >
                <div className={styles["sidebar__item-left"]}>
                  <span className={styles["sidebar__cat-icon"]}>
                    <PokecatIcon />
                  </span>
                  <span className={styles["sidebar__cat-name"]}>{cat.name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {caughtList.length > 0 && (
          <button
            className={styles["sidebar__view-all"]}
            onClick={() => {
              setIsOpen(false);
              navigate("/collection");
            }}
          >
            View All
          </button>
        )}
      </aside>
    </>
  );
}
