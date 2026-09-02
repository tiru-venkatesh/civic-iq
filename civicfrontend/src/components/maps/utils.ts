// src/components/maps/utils.ts
//
// .env (Vite):  VITE_GOOGLE_MAPS_API_KEY=AIza...
//               VITE_GOOGLE_MAPS_MAP_ID=your_map_id      (optional, for prod markers)
//               VITE_GOOGLE_MAPS_MAP_ID_DARK=your_dark_id (optional, dark mode variant)
//
// .env (CRA):   REACT_APP_GOOGLE_MAPS_API_KEY=AIza...
//               REACT_APP_GOOGLE_MAPS_MAP_ID=your_map_id
//
// IMPORTANT: Vite only exposes env vars prefixed VITE_ to client code.
// GOOGLE_MAPS_API_KEY (no prefix) will silently be undefined in the browser —
// that's the #1 cause of "Missing Google Maps API key" errors. Restart the
// dev server after editing .env; hot-reload does not pick up new env vars.

declare global {
  interface Window {
    google?: any;
  }
}

const DEMO_MAP_ID = "DEMO_MAP_ID";

function readEnv(key: string): string | undefined {
  try {
    // Vite only ever populates import.meta.env with VITE_-prefixed vars
    // (unless envPrefix is customized in vite.config). Checking the bare
    // key here — as the previous version did — is why the key came back
    // undefined even with a correct .env: it was reading a name Vite never
    // exposes to the browser.
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // @ts-ignore
      const v = import.meta.env[`VITE_${key}`] ?? import.meta.env[key];
      if (v) return v;
    }
  } catch {
    /* not a Vite build */
  }
  // CRA / webpack-based setups
  if (typeof process !== "undefined" && process.env) {
    const v = process.env[`REACT_APP_${key}`] ?? process.env[key];
    if (v) return v;
  }
  return undefined;
}

export function getApiKey(): string {
  return readEnv("GOOGLE_MAPS_API_KEY") || "";
}

export function getMapId(darkMode?: boolean): string {
  if (darkMode) {
    const dark = readEnv("GOOGLE_MAPS_MAP_ID_DARK");
    if (dark) return dark;
  }
  return readEnv("GOOGLE_MAPS_MAP_ID") || DEMO_MAP_ID;
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
      existing.addEventListener("error", () => {
        scriptLoadingPromise = null;
        reject(new Error("Failed to load Google Maps script"));
      });
      return;
    }

    (window as any).__smartMapReady = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__smartMapReady&libraries=maps,marker&v=beta&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.smartmapLoader = "true";
    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error("Failed to load Google Maps script — check the API key, billing, and that the Maps JavaScript API is enabled in Cloud Console."));
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}
