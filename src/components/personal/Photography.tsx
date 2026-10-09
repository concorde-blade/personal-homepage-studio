"use client";

import { useEffect, useRef, useState } from "react";
import { Column, Row, Text, Media } from "@once-ui-system/core";
import { photographs, assetPath } from "./data";
import styles from "./Personal.module.scss";

export function Photography() {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const photo = photographs[active ?? 0] || photographs[0];
  const move = (direction: number) =>
    setActive((current) =>
      current === null ? null : (current + direction + photographs.length) % photographs.length,
    );
  useEffect(() => {
    if (active === null) return;
    const modal = dialog.current!;
    const overflow = document.body.style.overflow;
    if (!modal.open) {
      modal.showModal();
      closeButton.current?.focus();
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [active]);
  const close = () => {
    dialog.current?.close();
  };
  if (!photographs.length) return <Text className={styles.endnote}>影像正在整理中。</Text>;
  return (
    <>
      <Column fillWidth className={styles.photoGrid}>
        {photographs.map((image, index) => (
          <Column
            as="figure"
            key={image.id}
            className={`${styles.photoFigure} ${index === 0 || index === 5 ? styles.photoWide : ""}`}
          >
            <button
              type="button"
              className={styles.photoButton}
              aria-label={`放大照片：${image.title}`}
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setActive(index);
              }}
            >
              <Media
                src={assetPath(image.src)}
                alt={image.subtitle}
                priority={index < 2}
                aspectRatio={
                  index === 0 ? "2.1/1" : image.orientation === "vertical" ? "3/4" : "4/3"
                }
                sizes="(max-width: 640px) 100vw, (max-width: 1100px) 80vw, 1100px"
              />
              <span className={styles.enlargeHint} aria-hidden="true">
                ↗
              </span>
            </button>
            <Row
              as="figcaption"
              horizontal="between"
              vertical="center"
              gap="16"
              className={styles.photoCaption}
            >
              <Column gap="8">
                <Text className={styles.photoTitle}>{image.title}</Text>
                <Text className={styles.photoSubtitle}>{image.subtitle}</Text>
              </Column>
              <Text className={styles.photoNumber}>{String(index + 1).padStart(2, "0")} / {String(photographs.length).padStart(2,"0")}</Text>
            </Row>
          </Column>
        ))}
      </Column>
      <dialog
        ref={dialog}
        aria-label="摄影作品浏览"
        className={styles.lightbox}
        onClose={() => {
          setActive(null);
          trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
        }}
      >
        <Column className={styles.lightboxBody}>
          <Row horizontal="between" vertical="center" paddingBottom="20">
            <Text className={styles.lightboxCount}>
              {String((active ?? 0) + 1).padStart(2, "0")} / {String(photographs.length).padStart(2,"0")}
            </Text>
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              aria-label="关闭照片"
              className={styles.lightboxControl}
            >
              关闭 <span aria-hidden="true">×</span>
            </button>
          </Row>
          {/* The originals are bundled locally; no full-size image is fetched until opened. */}
          {active !== null && (
            <img className={styles.lightboxImage} src={assetPath(photo.src)} alt={photo.subtitle} />
          )}
          <Row horizontal="between" vertical="center" paddingTop="20" gap="16">
            <Text className={styles.photoTitle}>{photo.title}</Text>
            <Row gap="8">
              <button
                type="button"
                className={styles.lightboxControl}
                aria-label="上一张照片"
                onClick={() => move(-1)}
              >
                ←
              </button>
              <button
                type="button"
                className={styles.lightboxControl}
                aria-label="下一张照片"
                onClick={() => move(1)}
              >
                →
              </button>
            </Row>
          </Row>
        </Column>
      </dialog>
    </>
  );
}
