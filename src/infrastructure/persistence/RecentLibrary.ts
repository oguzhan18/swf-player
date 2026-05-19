import type { RecentItem } from "@/domain/entities/RecentItem";
import { createSwfAssetFromBuffer, type SwfAsset } from "@/domain/entities/SwfAsset";
import type { RecentLibraryPort } from "@/domain/ports/RecentLibraryPort";

const CATALOG_KEY = "swf-player-recent-v1";
const DB_NAME = "swf-player";
const STORE_NAME = "blobs";
const MAX_ITEMS = 10;
const MAX_STORE_BYTES = 30 * 1024 * 1024;

export class RecentLibrary implements RecentLibraryPort {
  async list(): Promise<RecentItem[]> {
    return readCatalog();
  }

  async rememberFile(asset: SwfAsset): Promise<RecentItem> {
    const storedLocally = asset.size <= MAX_STORE_BYTES;
    const id = crypto.randomUUID();
    const item: RecentItem = {
      id,
      source: "file",
      name: asset.name,
      size: asset.size,
      openedAt: Date.now(),
      storedLocally,
    };

    if (storedLocally) {
      await writeBlob(id, asset.data);
    }

    await upsertCatalog(item);
    return item;
  }

  async rememberUrl(asset: SwfAsset, url: string): Promise<RecentItem> {
    const id = `url:${url}`;
    const item: RecentItem = {
      id,
      source: "url",
      name: asset.name,
      size: asset.size,
      openedAt: Date.now(),
      url,
      storedLocally: false,
    };
    await upsertCatalog(item);
    return item;
  }

  async loadFile(id: string): Promise<SwfAsset | null> {
    const item = readCatalog().find((entry) => entry.id === id);
    if (!item || item.source !== "file") return null;
    if (!item.storedLocally) return null;

    const data = await readBlob(id);
    if (!data) return null;

    return createSwfAssetFromBuffer(item.name, data);
  }

  async remove(id: string): Promise<void> {
    const catalog = readCatalog().filter((entry) => entry.id !== id);
    writeCatalog(catalog);
    await deleteBlob(id);
  }
}

function readCatalog(): RecentItem[] {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCatalog(items: RecentItem[]): void {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
}

async function upsertCatalog(item: RecentItem): Promise<void> {
  const without = readCatalog().filter((entry) => entry.id !== item.id);
  const merged = [item, ...without];
  const next = merged.slice(0, MAX_ITEMS);
  const dropped = merged.slice(MAX_ITEMS);
  writeCatalog(next);
  await Promise.all(dropped.map((entry) => deleteBlob(entry.id)));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

async function writeBlob(id: string, data: ArrayBuffer): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(data, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
  });
  db.close();
}

async function readBlob(id: string): Promise<ArrayBuffer | null> {
  const db = await openDb();
  const value = await new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve((request.result as ArrayBuffer | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"));
  });
  db.close();
  return value;
}

async function deleteBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB delete failed"));
  });
  db.close();
}
