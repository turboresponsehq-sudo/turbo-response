import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";

type LazyBackgroundProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
  backgroundImage: string;
  preloadSrc?: string;
  eager?: boolean;
  style?: CSSProperties;
};

/**
 * Defers downloading a CSS background image until its visual approaches the viewport.
 * The loaded state uses the original background properties unchanged.
 */
export default function LazyBackground({ backgroundImage, preloadSrc, eager = false, style, ...props }: LazyBackgroundProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(eager);

  useEffect(() => {
    if (eager || loaded) return;
    const element = elementRef.current;
    if (!element) return;

    const load = () => {
      const image = new Image();
      image.onload = () => setLoaded(true);
      image.onerror = () => setLoaded(true);
      const source = preloadSrc ?? backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      if (!source) {
        setLoaded(true);
        return;
      }
      image.src = source;
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: "240px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [backgroundImage, eager, loaded]);

  return <div {...props} ref={elementRef} style={{ ...style, backgroundImage: loaded ? backgroundImage : undefined }} />;
}
