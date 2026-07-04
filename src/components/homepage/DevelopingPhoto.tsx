/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import clsx from "clsx";
import type { HomePhoto } from "@/data/homePhotos";

type DevelopingPhotoProps = {
  photo: HomePhoto;
  index: number;
  style: CSSProperties;
  isTabletVisible: boolean;
  isMobileVisible: boolean;
};

export function DevelopingPhoto({
  photo,
  index,
  style,
  isTabletVisible,
  isMobileVisible,
}: DevelopingPhotoProps) {
  return (
    <figure
      className={clsx("mosaic-photo-card", `mosaic-photo-card--${photo.kind}`)}
      data-photo-id={photo.id}
      data-photo-index={index}
      data-priority={photo.priority}
      data-tone={photo.tone}
      data-tablet-visible={isTabletVisible ? "true" : "false"}
      data-mobile-visible={isMobileVisible ? "true" : "false"}
      style={style}
    >
      <div className="developing-photo-frame">
        <img
          src={photo.src}
          alt={photo.alt}
          draggable={false}
          loading={index < 8 ? "eager" : "lazy"}
          fetchPriority={index < 4 ? "high" : "auto"}
        />
        <span className="developing-photo-latent" aria-hidden="true" />
        <span className="developing-photo-emulsion" aria-hidden="true" />
        <span className="developing-photo-veil" aria-hidden="true" />
        <span className="developing-photo-wash" aria-hidden="true" />
        <span className="developing-photo-edge" aria-hidden="true" />
      </div>
    </figure>
  );
}
