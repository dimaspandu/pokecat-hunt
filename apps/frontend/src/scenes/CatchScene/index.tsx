import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { type Pokecat } from "@/types/pokecat";
import { type GameItem } from "@/types/gameitem";
import { useGameStore } from "@/stores/useGameStore";
import { ITEMS, type ItemDefinition } from "@/constants/items";
import styles from "./CatchScene.module.scss";

export default function CatchScene() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addCaught, removeItem, setNotification } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<Pokecat | null>(null);
  const [throwing, setThrowing] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "fail">("idle");
  const [dodge, setDodge] = useState<"none" | "left" | "right">("none");
  const [showBall, setShowBall] = useState(false);
  const [ballHit, setBallHit] = useState(false);
  const [catMoving, setCatMoving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!id) return;
    const s: Socket = io("http://localhost:4000");
    setSocket(s);

    s.emit("get-pokecat", { id });
    s.on("pokecat-detail", (data: Pokecat) => {
      setCat(data);
      setLoading(false);
    });

    return () => {
      s.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCatMoving(true);
      setTimeout(() => setCatMoving(false), 1000);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const foodItems: (GameItem & ItemDefinition)[] = items
    .map((i) => {
      const def = ITEMS.find((it) => it.id === i.id && it.category === "food");
      if (!def) return null;
      return { ...def, quantity: i.quantity };
    })
    .filter((i): i is GameItem & ItemDefinition => !!i && i.quantity > 0);

  const throwBall = (item: GameItem & ItemDefinition) => {
    if (!cat || !item || !socket) return;
    setThrowing(true);
    setShowBall(true);
    setBallHit(false);
    setModalOpen(false);

    const rate = item.catchRate ?? 0.7;

    setTimeout(() => {
      const dodged = Math.random() < 0.3;
      if (dodged) {
        setDodge(Math.random() < 0.5 ? "left" : "right");
        setResult("fail");
        setShowBall(false);
        setNotification({ message: `${cat.name} dodged your ${item.name}!`, type: "warning" });
        setTimeout(() => navigate("/"), 1800);
        return;
      }

      setBallHit(true);
      const success = Math.random() < rate;

      socket.emit("confirm-catch", {
        pokecatId: cat.id,
        success,
        user: {
          id: localStorage.getItem("userId") ?? "unknown",
          name: localStorage.getItem("userName") ?? "Trainer",
        },
      });

      socket.once("confirm-result", (res: { success: boolean; message?: string; pokecat: Pokecat }) => {
        setResult(res.success ? "success" : "fail");
        if (res.success) addCaught(res.pokecat);
        setNotification({
          message: res.success ? `You caught ${res.pokecat.name}!` : res.message ?? "Failed to catch",
          type: res.success ? "success" : "error",
        });
        setShowBall(false);
        removeItem(item.id, 1);
        setTimeout(() => navigate("/"), 1800);
      });
    }, 800);
  };

  if (loading) return <div className={styles["catch-scene__loading"]}>LOADING...</div>;
  if (!cat) return <div className={styles["catch-scene__error"]}>Cat not found</div>;

  return (
    <div className={styles["catch-scene"]}>
      <h2 className={styles["catch-scene__title"]}>{cat.name} appeared!</h2>

      <div className={styles["catch-scene__stage"]}>
        <img
          src={cat.iconUrl}
          alt={cat.name}
          className={[
            styles["catch-scene__cat"],
            throwing ? styles["catch-scene__cat--shake"] : "",
            result === "success" ? styles["catch-scene__cat--caught"] : "",
            result === "fail" && dodge === "left" ? styles["catch-scene__cat--dodge-left"] : "",
            result === "fail" && dodge === "right" ? styles["catch-scene__cat--dodge-right"] : "",
            catMoving ? styles["catch-scene__cat--move-random"] : "",
          ].join(" ")}
        />
        {showBall && (
          <div
            className={`${styles["catch-scene__ball"]} ${
              ballHit ? styles["catch-scene__ball--hit"] : styles["catch-scene__ball--throw"]
            }`}
          />
        )}
      </div>

      <div className={styles["catch-scene__controls"]}>
        <button
          onClick={() => foodItems.length > 0 && setModalOpen(true)}
          className={styles["catch-scene__button"]}
          disabled={foodItems.length === 0}
        >
          Throw Food
        </button>
        <button
          onClick={() => navigate("/")}
          className={[styles["catch-scene__button"], styles["catch-scene__button--run"]].join(" ")}
        >
          Run Away
        </button>
      </div>

      {modalOpen && (
        <div className={styles["catch-scene__modal"]}>
          <h3>Choose a food item</h3>
          <div className={styles["catch-scene__modal-items"]}>
            {foodItems.map((item) => (
              <div key={item.id} className={styles["catch-scene__modal-item"]}>
                <img src={item.iconUrl} alt={item.name} width={80} height={80} />
                <div>
                  <strong>{item.name}</strong> ×{item.quantity}
                  <div>{item.description}</div>
                  <div>Catch Success: {((item.catchRate ?? 0.7) * 100).toFixed(0)}%</div>
                  <button onClick={() => throwBall(item)} className={[styles["catch-scene__button"], styles["catch-scene__button--use"]].join(" ")}>
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setModalOpen(false)} className={[styles["catch-scene__button"], styles["catch-scene__button--cancel"]].join(" ")}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
