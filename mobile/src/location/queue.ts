/**
 * Offline-first ping queue.
 *
 * Fixes are appended to an AsyncStorage-backed queue as they arrive. flush()
 * drains the queue to the server in batches; anything that fails to upload
 * stays queued and is retried on the next fix or the next flush. This is what
 * lets tracking survive tunnels, dead zones, and app restarts without losing
 * data.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KEYS, UPLOAD_BATCH_SIZE } from "../config";
import { Ping, uploadPings } from "../api";
import { setLastSync } from "../storage";

async function readQueue(): Promise<Ping[]> {
  const raw = await AsyncStorage.getItem(KEYS.queue);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(pings: Ping[]) {
  await AsyncStorage.setItem(KEYS.queue, JSON.stringify(pings));
}

/** Add fixes to the pending queue. */
export async function enqueue(pings: Ping[]) {
  if (pings.length === 0) return;
  const current = await readQueue();
  await writeQueue([...current, ...pings]);
}

/** How many fixes are waiting to be uploaded. */
export async function queueSize(): Promise<number> {
  return (await readQueue()).length;
}

/**
 * Try to upload everything in the queue, oldest first, in batches.
 * Stops at the first failed batch and leaves the rest queued.
 * Returns the number of fixes successfully uploaded.
 */
export async function flush(): Promise<number> {
  let remaining = await readQueue();
  if (remaining.length === 0) return 0;

  let uploaded = 0;
  while (remaining.length > 0) {
    const batch = remaining.slice(0, UPLOAD_BATCH_SIZE);
    const ok = await uploadPings(batch);
    if (!ok) break; // network/auth problem — keep everything that's left
    remaining = remaining.slice(batch.length);
    uploaded += batch.length;
    await writeQueue(remaining); // persist progress after each batch
  }
  if (uploaded > 0) await setLastSync(); // real "last synced" time for the UI
  return uploaded;
}
