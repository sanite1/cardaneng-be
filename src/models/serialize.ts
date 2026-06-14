/**
 * Shared Mongoose toJSON behaviour so API responses match the frontend's
 * document shape exactly: expose `id` (string) instead of `_id`, drop `__v`,
 * and return `createdAt`/`updatedAt` as epoch-millisecond numbers.
 */
export function toJSONTransform(_doc: unknown, ret: Record<string, unknown>) {
  ret.id = String(ret._id);
  delete ret._id;
  if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.getTime();
  if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.getTime();
  return ret;
}

export const baseToJSON = {
  versionKey: false,
  transform: toJSONTransform,
};
