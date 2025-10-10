import { useNavigate } from "react-router-dom";
import ArrowIcon from "~/components/Icons/ArrowIcon";
import styles from "./SceneHeader.module.scss";

interface SceneHeaderProps {
  title: string;
  backTo?: string;
}

export default function SceneHeader({ title, backTo = "/" }: SceneHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={styles["scene-header"]}>
      <button
        className={styles["scene-header__back"]}
        onClick={() => navigate(backTo)}
      >
        <ArrowIcon />
        <span>Back</span>
      </button>
      <h1 className={styles["scene-header__title"]}>{title}</h1>
    </div>
  );
}
