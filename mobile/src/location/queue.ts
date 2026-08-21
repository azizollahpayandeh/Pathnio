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

/**
 * enqueue() (called from the background task on every fix batch) and flush()
 * (polled from HomeScreen every 5s, plus called from the background task
 * itself) run on the same JS thread but interleave at `await` points. Without
 * serializing their read-modify-write access to storage, one could read a
 * snapshot, let the other enqueue/upload in between, then write its own
 * stale view back and silently discard the other's work. Every read+write
 * cycle below runs inside this lock so the two can never clobber each other.
 */
let queueLock: Promise<void> = Promise.resolve();
function withQueueLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queueLock.then(fn, fn);
  queueLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/** Add fixes to the pending queue. */
export async function enqueue(pings: Ping[]) {
  if (pings.length === 0) return;
  await withQueueLock(async () => {
    const current = await readQueue();
    await writeQueue([...current, ...pings]);
  });
}

/** How many fixes are waiting to be uploaded. */
export async function queueSize(): Promise<number> {
  return (await readQueue()).length;
}

let flushing: Promise<number> | null = null;

/**
 * Try to upload everything in the queue, oldest first, in batches.
 * Stops at the first failed batch and leaves the rest queued.
 * Returns the number of fixes successfully uploaded.
 *
 * Safe to call concurrently: a second call while one is already running
 * simply rides along with the in-flight one instead of racing it.
 */
export function flush(): Promise<number> {
  if (flushing) return flushing;
  flushing = doFlush().finally(() => {
    flushing = null;
  });
  return flushing;
}

async function doFlush(): Promise<number> {
  let uploaded = 0;
  while (true) {
    // Pick the next batch under the lock so we always see the latest queue,
    // including anything enqueue() added since our last iteration.
    const batch = await withQueueLock(async () => {
      const q = await readQueue();
      return q.slice(0, UPLOAD_BATCH_SIZE);
    });
    if (batch.length === 0) break;

    const ok = await uploadPings(batch); // network call — deliberately outside the lock
    if (!ok) break; // network/auth problem — keep everything that's left

    // Remove exactly the ids we just uploaded from whatever is CURRENTLY in
    // storage (which may have grown via a concurrent enqueue() while the
    // upload was in flight) — never write back a stale pre-upload snapshot.
    const uploadedIds = new Set(batch.map((p) => p.event_id));
    await withQueueLock(async () => {
      const current = await readQueue();
      await writeQueue(current.filter((p) => !uploadedIds.has(p.event_id)));
    });
    uploaded += batch.length;
  }
  if (uploaded > 0) await setLastSync(); // real "last synced" time for the UI
  return uploaded;
}
