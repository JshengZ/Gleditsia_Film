import type { CSSProperties } from "react";
import { homePhotos, type HomePhotoKind } from "@/data/homePhotos";
import { getMosaicLayout, type MosaicLayoutItem } from "@/lib/photoLayout";
import { DevelopingPhoto } from "./DevelopingPhoto";

type MosaicCssProperties = CSSProperties & Record<`--${string}`, string>;

const aspectRatioByKind: Record<HomePhotoKind, string> = {
  landscape: "16 / 10",
  portrait: "4 / 5",
  square: "1 / 1",
};

function layoutVars(item: MosaicLayoutItem, prefix: "desktop" | "tablet" | "mobile") {
  return {
    [`--${prefix}-x`]: `${item.x}vw`,
    [`--${prefix}-y`]: `${item.y}svh`,
    [`--${prefix}-w`]: `${item.w}vw`,
    [`--${prefix}-rotate`]: `${item.rotate}deg`,
    [`--${prefix}-z`]: `${item.z}`,
  };
}

export function PhotoMosaicWall() {
  return (
    <div className="mosaic-wall" aria-label="Gleditsia preview photo wall">
      <div className="mosaic-wall__gate">
        {homePhotos.map((photo, index) => {
          const layout = getMosaicLayout(photo.id);

          if (!layout) {
            return null;
          }

          const tablet = layout.tablet ?? layout.desktop;
          const mobile = layout.mobile ?? tablet;
          const style = {
            ...layoutVars(layout.desktop, "desktop"),
            ...layoutVars(tablet, "tablet"),
            ...layoutVars(mobile, "mobile"),
            "--photo-ratio": aspectRatioByKind[photo.kind],
          } as MosaicCssProperties;

          return (
            <DevelopingPhoto
              key={photo.id}
              photo={photo}
              index={index}
              style={style}
              isTabletVisible={Boolean(layout.tablet)}
              isMobileVisible={Boolean(layout.mobile)}
            />
          );
        })}
      </div>
    </div>
  );
}
