"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { homePhotos, INTRO_LINES } from "@/data/homePhotos";
import { useLenis } from "@/hooks/useLenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { FilmLightLeakCue, FilmLightLeakRequest, FilmScene } from "@/lib/film-engine/types";
import { FilmOverlay } from "./FilmOverlay";
import { PhotoMosaicWall } from "./PhotoMosaicWall";
import { ScrollCue } from "./ScrollCue";

gsap.registerPlugin(ScrollTrigger);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getBrandFinalPosition() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const left = clamp(viewportWidth * 0.04, 24, 64);
  const bottom = clamp(viewportWidth * 0.04, 22, 48);
  const fontSize = clamp(viewportWidth * 0.02, 20, 32);

  return {
    left,
    top: viewportHeight - bottom,
    fontSize,
  };
}

function getBrandIntroSize() {
  const viewportWidth = window.innerWidth;

  if (viewportWidth < 768) {
    return 75;
  }

  if (viewportWidth < 1024) {
    return 104;
  }

  return 128;
}

const PHOTO_REVEAL_ORDER = [
  "home-09",
  "home-01",
  "home-05",
  "home-10",
  "home-04",
  "home-11",
  "home-02",
  "home-07",
  "home-12",
  "home-13",
  "home-03",
  "home-16",
  "home-08",
  "home-15",
  "home-17",
  "home-06",
  "home-14",
  "home-18",
];

const FILM_PHASE_SCENES: Record<string, FilmScene> = {
  blackout: "intro",
  title: "title",
  copy: "copy",
  "title-retreat": "brand-move",
  "photo-developing": "photo-developing",
  "photo-wall": "photo-developing",
  settled: "settled",
};

function orderCardsForReveal(cards: HTMLElement[]) {
  const cardsById = new Map(
    cards.map((card) => [card.dataset.photoId ?? "", card]),
  );

  return PHOTO_REVEAL_ORDER.map((id) => cardsById.get(id)).filter(
    (card): card is HTMLElement => Boolean(card),
  );
}

export function HomeIntro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const filmPlaneRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);
  const [lightLeakRequest, setLightLeakRequest] = useState<FilmLightLeakRequest | null>(null);
  const [filmScene, setFilmScene] = useState<FilmScene>("intro");

  useLenis(isSequenceComplete && !reducedMotion);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    homePhotos.slice(0, 8).forEach((photo) => {
      const image = new window.Image();
      image.src = photo.src;
    });
  }, []);

  useEffect(() => {
    document.body.classList.add("gleditsia-opening-lock");
    window.scrollTo({ top: 0, left: 0 });

    return () => {
      document.body.classList.remove("gleditsia-opening-lock");
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const filmPlane = filmPlaneRef.current;
    const title = titleRef.current;
    const cue = cueRef.current;

    if (!section || !filmPlane || !title || !cue) {
      return;
    }

    const reduced = reducedMotionRef.current;
    const ctx = gsap.context(() => {
      const lines = Array.from(
        section.querySelectorAll<HTMLElement>(".intro-copy-line"),
      );
      const cards = Array.from(
        section.querySelectorAll<HTMLElement>(".mosaic-photo-card"),
      ).filter((card) => window.getComputedStyle(card).display !== "none");
      const orderedCards = orderCardsForReveal(cards);
      const allImages = cards
        .map((card) => card.querySelector<HTMLElement>(".developing-photo-frame img"))
        .filter(Boolean);
      const allLatents = cards
        .map((card) => card.querySelector<HTMLElement>(".developing-photo-latent"))
        .filter(Boolean);
      const allVeils = cards
        .map((card) => card.querySelector<HTMLElement>(".developing-photo-veil"))
        .filter(Boolean);
      const allEmulsions = cards
        .map((card) => card.querySelector<HTMLElement>(".developing-photo-emulsion"))
        .filter(Boolean);
      const mosaicWall = section.querySelector<HTMLElement>(".mosaic-wall");
      const brandFinal = getBrandFinalPosition();
      const sequenceTimes = reduced
        ? {
            titleIn: 0.2,
            copyIn: 0.78,
            copyOut: 2.0,
            brandMove: 2.36,
            firstPhoto: 2.9,
            slowGroup: 3.45,
            fastGroup: 4.65,
            settle: 5.8,
            cue: 6.18,
          }
        : {
            titleIn: 0.8,
            copyIn: 2.2,
            copyOut: 4.0,
            brandMove: 4.6,
            firstPhoto: 5.2,
            slowGroup: 6.4,
            fastGroup: 7.82,
            settle: 10.2,
            cue: 10.8,
          };
      const openingLeakAt = sequenceTimes.firstPhoto - (reduced ? 0.16 : 0.32);
      const developFilter = reduced
        ? "brightness(0.98) contrast(1.08) saturate(0.78) blur(0px)"
        : "brightness(1.06) contrast(1.16) saturate(0.86) blur(0px)";
      const latentFilter = reduced ? "blur(7px)" : "blur(11px)";
      const sleepingFilter = reduced
        ? "brightness(0.48) contrast(0.62) saturate(0.38) blur(5px)"
        : "brightness(0.34) contrast(0.52) saturate(0.32) blur(7px)";
      const midDevelopFilter = reduced
        ? "brightness(0.7) contrast(0.86) saturate(0.54) blur(2.4px)"
        : "brightness(0.68) contrast(0.9) saturate(0.52) blur(3px)";
      const lowAwakeFilter = reduced
        ? "brightness(0.76) contrast(0.88) saturate(0.58) blur(1.5px)"
        : "brightness(0.72) contrast(0.88) saturate(0.58) blur(2px)";

      gsap.set(filmPlane, {
        x: 0,
        y: 0,
        rotate: 0,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set(title, {
        autoAlpha: 0,
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        y: reduced ? 0 : 12,
        fontSize: getBrandIntroSize(),
        filter: reduced ? "blur(0px)" : "blur(6px)",
      });
      gsap.set(lines, {
        autoAlpha: 0,
        y: reduced ? 0 : 8,
        filter: reduced ? "blur(0px)" : "blur(5px)",
      });
      gsap.set(cards, {
        autoAlpha: 0,
        clipPath: "inset(28% 20% 24% 18%)",
        filter: reduced
          ? "brightness(0.72) contrast(0.82) saturate(0.56) blur(1.5px)"
          : sleepingFilter,
      });
      gsap.set(allImages, {
        opacity: 0.08,
        filter: sleepingFilter,
      });
      gsap.set(allLatents, {
        opacity: 0,
        scale: 0.82,
        x: "-10%",
        filter: latentFilter,
      });
      gsap.set(allVeils, {
        opacity: reduced ? 0.66 : 0.88,
      });
      gsap.set(allEmulsions, {
        opacity: reduced ? 0.26 : 0.42,
        filter: reduced ? "blur(3px)" : "blur(6px)",
      });
      gsap.set(cue, { autoAlpha: 0, y: 8 });
      section.dataset.filmPhase = "blackout";
      setFilmScene("intro");

      if (!reduced) {
        gsap
          .timeline({
            repeat: -1,
            defaults: { duration: 0.52, ease: "steps(1)" },
          })
          .to(filmPlane, { x: 0.28, y: -0.18, rotate: 0.004 })
          .to(filmPlane, { x: -0.42, y: 0.22, rotate: -0.005 })
          .to(filmPlane, { x: 0.16, y: 0.34, rotate: 0.003 })
          .to(filmPlane, { x: -0.24, y: -0.28, rotate: -0.004 })
          .to(filmPlane, { x: 0.36, y: 0.12, rotate: 0.004 })
          .to(filmPlane, { x: 0, y: 0, rotate: 0 });
      }

      const setFilmPhase = (phase: string) => {
        section.dataset.filmPhase = phase;
        setFilmScene(FILM_PHASE_SCENES[phase] ?? "intro");
      };

      const burstLightLeak = (cue: FilmLightLeakCue) => {
        setLightLeakRequest((request) => ({
          id: (request?.id ?? 0) + 1,
          cue,
        }));
      };

      let sequenceUnlocked = false;
      const unlockSequence = () => {
        if (sequenceUnlocked) {
          return;
        }

        sequenceUnlocked = true;
        document.body.classList.remove("gleditsia-opening-lock");
        setIsSequenceComplete(true);

        if (!reduced) {
          gsap.to(cue, {
            autoAlpha: 0,
            y: -6,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=360",
              scrub: true,
            },
          });
          ScrollTrigger.refresh();
        }
      };

      const createDevelopTimeline = (card: HTMLElement, duration: number) => {
        const image = card.querySelector<HTMLElement>(".developing-photo-frame img");
        const latent = card.querySelector<HTMLElement>(".developing-photo-latent");
        const veil = card.querySelector<HTMLElement>(".developing-photo-veil");
        const emulsion = card.querySelector<HTMLElement>(".developing-photo-emulsion");

        if (!image || !latent || !veil || !emulsion) {
          return gsap.timeline();
        }

        return gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .set(card, {
            autoAlpha: 1,
            clipPath: "inset(28% 20% 24% 18%)",
            filter: sleepingFilter,
          })
          .set(image, { opacity: 0.08, filter: sleepingFilter })
          .set(latent, { opacity: 0, x: "-10%", scale: 0.92, filter: latentFilter })
          .set(veil, { opacity: reduced ? 0.66 : 0.88 })
          .set(emulsion, { opacity: reduced ? 0.26 : 0.42, filter: reduced ? "blur(3px)" : "blur(6px)" })
          .to(
            card,
            {
              clipPath: "inset(8% 5% 7% 6%)",
              filter: lowAwakeFilter,
              duration: duration * 0.44,
              ease: "sine.out",
            },
            0,
          )
          .to(
            latent,
            {
              opacity: reduced ? 0.22 : 0.42,
              x: "8%",
              scale: 1.05,
              filter: reduced ? "blur(4px)" : "blur(5px)",
              duration: duration * 0.42,
              ease: "sine.out",
            },
            duration * 0.04,
          )
          .to(
            image,
            {
              opacity: 0.46,
              filter: midDevelopFilter,
              duration: duration * 0.5,
              ease: "power2.out",
            },
            duration * 0.08,
          )
          .to(
            veil,
            {
              opacity: reduced ? 0.12 : 0.22,
              duration: duration * 0.55,
              ease: "sine.inOut",
            },
            duration * 0.08,
          )
          .to(
            card,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              filter: lowAwakeFilter,
              duration: duration * 0.5,
              ease: "power2.out",
            },
            duration * 0.42,
          )
          .to(
            image,
            {
              opacity: 1,
              filter: developFilter,
              duration: duration * 0.5,
              ease: "power2.out",
            },
            duration * 0.42,
          )
          .to(
            latent,
            {
              opacity: 0,
              x: "16%",
              scale: 1.16,
              filter: "blur(16px)",
              duration: duration * 0.28,
              ease: "sine.inOut",
            },
            duration * 0.62,
          )
          .to(
            veil,
            {
              opacity: 0,
              duration: duration * 0.32,
              ease: "sine.out",
            },
            duration * 0.65,
          )
          .to(
            emulsion,
            {
              opacity: reduced ? 0.035 : 0.045,
              filter: "blur(0.5px)",
              duration: duration * 0.34,
              ease: "sine.out",
            },
            duration * 0.6,
          )
          .to(
            card,
            {
              filter: reduced
                ? "brightness(0.98) contrast(1.04) saturate(0.84) blur(0px)"
                : "brightness(1.02) contrast(1.08) saturate(0.9) blur(0px)",
              x: 0,
              y: 0,
              duration: duration * 0.26,
              ease: "sine.out",
            },
            duration * 0.74,
          )
          .to(
            card,
            {
              x: reduced ? 0 : 0.28,
              y: reduced ? 0 : -0.18,
              duration: 0.16,
              repeat: 1,
              yoyo: true,
              ease: "sine.inOut",
            },
            duration * 0.78,
          );
      };

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: unlockSequence,
      });

      timeline
        .call(() => setFilmPhase("blackout"), [], 0)
        .to(
          title,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: reduced ? 0.38 : 1.32,
          },
          sequenceTimes.titleIn,
        )
        .call(() => setFilmPhase("title"), [], sequenceTimes.titleIn)
        .call(() => setFilmPhase("copy"), [], sequenceTimes.copyIn)
        .to(
          lines,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: reduced ? 0.08 : 0.34,
            duration: reduced ? 0.24 : 0.62,
          },
          sequenceTimes.copyIn,
        )
        .to(
          lines,
          {
            autoAlpha: 0,
            y: reduced ? -2 : -8,
            filter: reduced ? "blur(0px)" : "blur(6px)",
            stagger: 0.05,
            duration: reduced ? 0.24 : 0.82,
          },
          sequenceTimes.copyOut,
        )
        .call(
          () => {
            setFilmPhase("title-retreat");
          },
          [],
          sequenceTimes.brandMove,
        )
        .to(
          title,
          {
            top: brandFinal.top,
            left: brandFinal.left,
            xPercent: 0,
            yPercent: -100,
            fontSize: brandFinal.fontSize,
            color: "rgba(232, 222, 204, 0.86)",
            duration: reduced ? 0.44 : 1,
            ease: "power3.inOut",
          },
          sequenceTimes.brandMove,
        );

      timeline.call(() => burstLightLeak("opening-leak"), [], openingLeakAt);

      timeline.call(
        () => {
          setFilmPhase("photo-developing");
        },
        [],
        sequenceTimes.firstPhoto,
      );

      const firstCard = orderedCards[0];
      const deliberateCards = orderedCards.slice(1, 6);
      const fastCards = orderedCards.slice(6);

      if (firstCard) {
        timeline.add(createDevelopTimeline(firstCard, reduced ? 0.55 : 1.62), sequenceTimes.firstPhoto);
      }

      deliberateCards.forEach((card, index) => {
        timeline.add(
          createDevelopTimeline(card, reduced ? 0.42 : 1.08),
          sequenceTimes.slowGroup + index * (reduced ? 0.09 : 0.27),
        );
      });

      timeline.call(() => setFilmPhase("photo-wall"), [], sequenceTimes.slowGroup + (reduced ? 0.42 : 1.0));

      fastCards.forEach((card, index) => {
        timeline.add(
          createDevelopTimeline(card, reduced ? 0.34 : 0.78),
          sequenceTimes.fastGroup + index * (reduced ? 0.055 : 0.14),
        );
      });

      timeline
        .call(() => setFilmPhase("settled"), [], sequenceTimes.settle)
        .to(
          cards,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            filter: reduced
              ? "brightness(0.98) contrast(1.04) saturate(0.84) blur(0px)"
              : "brightness(1.02) contrast(1.08) saturate(0.9) blur(0px)",
            duration: reduced ? 0.2 : 0.5,
            stagger: reduced ? 0.006 : 0.014,
            ease: "sine.out",
          },
          sequenceTimes.settle,
        )
        .to(
          cue,
          {
            autoAlpha: 1,
            y: 0,
            duration: reduced ? 0.22 : 0.74,
          },
          sequenceTimes.cue,
        )
        .call(unlockSequence, [], sequenceTimes.cue + (reduced ? 0.24 : 0.36));

      if (!reduced && mosaicWall) {
        gsap.to(mosaicWall, {
          y: -28,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, section);

    return () => {
      ctx.revert();
      document.body.classList.remove("gleditsia-opening-lock");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="home-intro"
      data-film-phase="blackout"
      aria-label="Gleditsia opening sequence"
    >
      <div ref={filmPlaneRef} className="film-plane">
        <PhotoMosaicWall />

        <h1 ref={titleRef} className="home-brand-title">
          <span className="home-brand-title__text">Gleditsia</span>
        </h1>

        <p className="intro-copy" aria-label={INTRO_LINES.join(" ")}>
          {INTRO_LINES.map((line) => (
            <span key={line} className="intro-copy-line">
              {line}
            </span>
          ))}
        </p>

        <ScrollCue ref={cueRef} />
      </div>
      <FilmOverlay lightLeakRequest={lightLeakRequest} scene={filmScene} />
    </section>
  );
}
