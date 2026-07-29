// src/components/maps/utils.ts

declare global {
  interface Window {
    google?: any;
  }
}

function readEnv(key: string): string | undefined {
  try {
    // Vite
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {
    /* not a Vite build */
  }
  // CRA / webpack-based setups
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
}

export function getApiKey(): string {
  return readEnv("VITE_GOOGLE_MAPS_API_KEY") || readEnv("REACT_APP_GOOGLE_MAPS_API_KEY") || "";
}

export function getMapId(darkMode?: boolean): string {
  if (darkMode) {
    const dark = readEnv("VITE_GOOGLE_MAPS_MAP_ID_DARK") || readEnv("REACT_APP_GOOGLE_MAPS_MAP_ID_DARK");
    if (dark) return dark;
  }
  return readEnv("VITE_GOOGLE_MAPS_MAP_ID") || readEnv("REACT_APP_GOOGLE_MAPS_MAP_ID") || "DEMO_MAP_ID";
}

// Module-level singleton so multiple SmartMap instances (or React StrictMode's
// double-invoke in dev) never inject the script twice.
let scriptLoadingPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.google?.maps?.marker) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-smartmap-loader="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));
      return;
    }

    (window as any).__smartMapReady = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__smartMapReady&libraries=maps,marker&v=beta&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.smartmapLoader = "true";
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}