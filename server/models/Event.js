import mongoose from 'mongoose';

export const CATEGORIES = ['Music', 'Tech', 'Business', 'Art', 'Food', 'Sports', 'Education', 'Community'];

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    category: { type: String, enum: CATEGORIES, required: true },
    date: { type: Date, required: [true, 'Date is required'] },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    imageUrl: { type: String, trim: true, default: '' },
    price: { type: Number, min: 0, default: 0 },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', location: 'text' });
eventSchema.index({ date: 1 });

export default mongoose.model('Event', eventSchema);
