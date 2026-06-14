import type { Model } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Generic REST CRUD handlers for any Mongoose model. The same five operations
 * back Projects, Products and News — and mirror the frontend `Repo<T>`
 * interface (list / get / create / update / remove).
 */
export function crudController(model: Model<any>) {
  return {
    list: asyncHandler(async (_req, res) => {
      const docs = await model.find().sort({ updatedAt: -1 });
      res.json(docs);
    }),

    get: asyncHandler(async (req, res) => {
      const doc = await model.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json(doc);
    }),

    create: asyncHandler(async (req, res) => {
      const doc = await model.create(req.body);
      res.status(201).json(doc);
    }),

    update: asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json(doc);
    }),

    remove: asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(204).end();
    }),
  };
}
