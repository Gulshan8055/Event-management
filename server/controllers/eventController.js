import Event, { CATEGORIES } from '../models/Event.js';
import Registration from '../models/Registration.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

const FIELDS = ['title', 'description', 'category', 'date', 'location', 'imageUrl', 'price', 'capacity'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

const canManage = (event, user) => user.role === 'admin' || event.organizer.toString() === user._id.toString();

// GET /api/events?q=&category=&when=upcoming|past&page=&limit=
export const listEvents = asyncHandler(async (req, res) => {
  const { q, category, when = 'upcoming' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 9, 50);

  const filter = {};
  if (q) filter.$text = { $search: q };
  if (category && CATEGORIES.includes(category)) filter.category = category;
  if (when === 'upcoming') filter.date = { $gte: new Date() };
  if (when === 'past') filter.date = { $lt: new Date() };

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ date: when === 'past' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('organizer', 'name'),
    Event.countDocuments(filter),
  ]);

  res.json({ events, page, pages: Math.ceil(total / limit), total, categories: CATEGORIES });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (!event) throw new HttpError(404, 'Event not found');
  res.json({ event });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...pick(req.body), organizer: req.user._id });
  res.status(201).json({ event });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new HttpError(404, 'Event not found');
  if (!canManage(event, req.user)) throw new HttpError(403, 'You can only edit your own events');

  const updates = pick(req.body);
  if (updates.capacity !== undefined && Number(updates.capacity) < event.registeredCount) {
    throw new HttpError(400, `Capacity cannot be lower than the ${event.registeredCount} people already registered`);
  }
  Object.assign(event, updates);
  await event.save();
  res.json({ event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new HttpError(404, 'Event not found');
  if (!canManage(event, req.user)) throw new HttpError(403, 'You can only delete your own events');
  await Promise.all([event.deleteOne(), Registration.deleteMany({ event: event._id })]);
  res.json({ message: 'Event deleted' });
});

// GET /api/events/mine  (organizer dashboard)
export const myEvents = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { organizer: req.user._id };
  const events = await Event.find(filter).sort({ date: -1 });
  res.json({ events });
});

// GET /api/events/:id/attendees
export const attendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new HttpError(404, 'Event not found');
  if (!canManage(event, req.user)) throw new HttpError(403, 'Only the organizer can see attendees');
  const list = await Registration.find({ event: event._id }).populate('user', 'name email').sort({ createdAt: 1 });
  res.json({ attendees: list });
});
