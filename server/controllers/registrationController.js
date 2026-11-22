import crypto from 'crypto';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

// POST /api/events/:id/register
export const registerForEvent = asyncHandler(async (req, res) => {
  const existing = await Registration.findOne({ user: req.user._id, event: req.params.id });
  if (existing) throw new HttpError(409, 'You are already registered for this event');

  // Atomic seat claim: only succeeds while seats remain and the event is in the future
  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, date: { $gt: new Date() }, $expr: { $lt: ['$registeredCount', '$capacity'] } },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );

  if (!event) {
    const found = await Event.findById(req.params.id);
    if (!found) throw new HttpError(404, 'Event not found');
    if (found.date <= new Date()) throw new HttpError(400, 'This event has already taken place');
    throw new HttpError(400, 'This event is sold out');
  }

  try {
    const registration = await Registration.create({
      user: req.user._id,
      event: event._id,
      ticketCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
    });
    res.status(201).json({ registration, event });
  } catch (err) {
    await Event.updateOne({ _id: event._id }, { $inc: { registeredCount: -1 } }); // release the seat
    throw err;
  }
});

// DELETE /api/events/:id/register
export const cancelRegistration = asyncHandler(async (req, res) => {
  const removed = await Registration.findOneAndDelete({ user: req.user._id, event: req.params.id });
  if (!removed) throw new HttpError(404, 'You are not registered for this event');
  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } },
    { new: true }
  );
  res.json({ message: 'Registration cancelled', event });
});

// GET /api/registrations/mine
export const myRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id })
    .populate({ path: 'event', populate: { path: 'organizer', select: 'name' } })
    .sort({ createdAt: -1 });
  res.json({ registrations: registrations.filter((r) => r.event) });
});
