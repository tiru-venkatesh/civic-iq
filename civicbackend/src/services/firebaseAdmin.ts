import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

/**
 * Admin SDK init for the backend — separate from civicfrontend's
 * firebase.ts (client SDK). The backend runs as a trusted server, so
 * it authenticates via a service account instead of client config.
 *
 * Set ONE of these in .env:
 *   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json   (local dev)
 *   FIREBASE_SERVICE_ACCOUNT_KEY={...json contents as one line...} (hosted/prod)
 *
 * Never commit the key file — add it to .gitignore.
 */

function loadServiceAccount() {
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (keyPath) {
    return JSON.parse(fs.readFileSync(path.resolve(keyPath), "utf-8"));
  }
  if (keyJson) {
    return JSON.parse(keyJson);
  }
  throw new Error(
    "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH " +
    "or FIREBASE_SERVICE_ACCOUNT_KEY in .env."
  );
}

const app: App = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(loadServiceAccount()) });

export const db: Firestore = getFirestore(app);