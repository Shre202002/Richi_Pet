import { db } from "./mongo";

// Atomic counter: nextSeq("invoice") -> 1, 2, 3 ...
export async function nextSeq(name: string) {
  const r = await (await db()).collection<{ _id: string; seq: number }>("counters").findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return r!.seq;
}
