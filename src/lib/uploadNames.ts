// The backend doesn't store file names, so the browser remembers which files it uploaded into which batch,
// purely to label payloads in the UI. Per browser only; may be empty (private window, cleared storage).
const KEY = 'sift.uploadNames';
const MAX_BATCHES = 200;

type Store = Record<string, string[]>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

export function rememberNames(batchId: string, names: string[]): void {
  try {
    const store = read();
    store[batchId] = names;
    const ids = Object.keys(store);
    for (const old of ids.slice(0, Math.max(0, ids.length - MAX_BATCHES))) {
      delete store[old];
    }
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage unavailable: labels just won't show
  }
}

export function namesFor(batchId: string): string[] {
  return read()[batchId] ?? [];
}
