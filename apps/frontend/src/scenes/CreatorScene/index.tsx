import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "~/stores/useGameStore";
import SceneHeader from "~/components/SceneHeader";
import type { Pokecat } from "~/types/Pokecat";
import UploaderIcon from "~/components/Icons/UploaderIcon";
import styles from "./CreatorScene.module.scss";

export default function CreatorScene() {
  const navigate = useNavigate();

  const { addCaught, setNotification } = useGameStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatedCat, setGeneratedCat] = useState<Pokecat | null>(null);
  const [catName, setCatName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Auto-fill catName based on filename, capitalize first letter
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setCatName(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Auto-fill catName based on filename, capitalize first letter
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setCatName(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleGenerate = async () => {
    if (!selectedFile || !catName) {
      setNotification({ message: "Please provide a name and an image", type: "error" });
      return;
    }

    setUploading(true);
    try {
      // Determine random rarity
      const rarities: Pokecat["rarity"][] = ["common", "rare", "legendary"];
      const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];

      // Step 1: Upload to NodeJS storage
      const storageForm = new FormData();
      storageForm.append("cat", selectedFile);

      const storageRes = await fetch("http://localhost:7621/", {
        method: "POST",
        body: storageForm,
      });

      if (!storageRes.ok) {
        throw new Error("Failed to upload file to storage");
      }

      const storageData = await storageRes.json();
      const iconUrl = storageData.url; // URL returned from NodeJS storage

      // Step 2: Save cat info to Go backend
      const goRes = await fetch("http://localhost:5000/api/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          rarity: randomRarity,
          iconUrl, // send URL returned from storage
        }),
      });

      if (!goRes.ok) throw new Error("Failed to save cat to database");

      const newCat: Pokecat = {
        id: catName.toLowerCase() + "-" + Date.now(),
        name: catName,
        lat: 0,
        lng: 0,
        status: "wild",
        iconUrl,
        expiresAt: Date.now() + 30 * 60 * 1000,
        rarity: randomRarity,
      };

      addCaught(newCat);
      setGeneratedCat(newCat);
      setNotification({ message: `Cat ${catName} created successfully!`, type: "success" });
    } catch (err) {
      console.error(err);
      setNotification({ message: (err as Error).message, type: "error" });
    }

    setUploading(false);
  };

  const handleGenerateSuccess = () => {
    setGeneratedCat(null);
    setTimeout(() => navigate("/collection", { replace: true }), 0);
  };

  return (
    <div className={styles["creator-scene"]}>
      <SceneHeader title="Creator" />

      <p className={styles["creator-scene__instruction"]}>
        You can design and generate your own cat!
      </p>

      <div className={styles["creator-scene__form"]}>
        <input
          type="text"
          placeholder="Enter cat name"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          className={styles["creator-scene__input"]}
        />

        <div
          className={`${styles["creator-scene__drop-area"]} ${isDragging ? styles["drag-active"] : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className={styles["creator-scene__preview"]} />
          ) : (
            <div className={styles["creator-scene__placeholder"]}>
              <UploaderIcon />
              <p>Drag & drop an image here or click to select</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles["creator-scene__file-input"]}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={uploading}
          className={styles["creator-scene__btn-generate"]}
        >
          {uploading ? "Uploading..." : "Generate Cat"}
        </button>
      </div>

      {generatedCat && (
        <div className={styles["creator-scene__modal-overlay"]}>
          <div className={styles["creator-scene__modal"]}>
            <img
              src={generatedCat.iconUrl}
              alt={generatedCat.name}
              className={styles["creator-scene__modal-image"]}
            />
            <h2>{generatedCat.name}</h2>
            <p>Rarity: {generatedCat.rarity}</p>
            <button
              className={styles["creator-scene__btn-close"]}
              onClick={handleGenerateSuccess}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
