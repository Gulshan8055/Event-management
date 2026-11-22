import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';

const day = 24 * 60 * 60 * 1000;
const at = (days, hour = 18) => {
  const d = new Date(Date.now() + days * day);
  d.setHours(hour, 0, 0, 0);
  return d;
};

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Event.deleteMany(), Registration.deleteMany()]);

const [organizer] = await User.create([
  { name: 'Asha Organizer', email: 'organizer@demo.com', password: 'password123', role: 'organizer' },
  { name: 'Ravi Attendee', email: 'user@demo.com', password: 'password123', role: 'user' },
  { name: 'Admin', email: 'admin@demo.com', password: 'password123', role: 'admin' },
]);

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

await Event.create([
  { title: 'Open Source Night Delhi', category: 'Tech', date: at(5), location: 'Cyber Hub, Gurugram', capacity: 120, price: 0,
    imageUrl: img('photo-1540575467063-178a50c2df87'),
    description: 'Lightning talks, a contributor clinic, and pair-programming tables for first-time contributors. Bring a laptop and an issue you want to fix.' },
  { title: 'Sunset Sitar Sessions', category: 'Music', date: at(9, 19), location: 'Lodhi Garden Amphitheatre, New Delhi', capacity: 200, price: 499,
    imageUrl: img('photo-1511671782779-c97d3d27a1d4'),
    description: 'An open-air evening of classical sitar and tabla with three guest artists. Cushions provided.' },
  { title: 'Startup Founders Breakfast', category: 'Business', date: at(12, 9), location: 'WeWork Connaught Place, New Delhi', capacity: 40, price: 299,
    imageUrl: img('photo-1515187029135-18ee286d815b'),
    description: 'Small-table conversations with early-stage founders about fundraising, hiring and first customers.' },
  { title: 'Street Food Walk: Old Delhi', category: 'Food', date: at(15, 11), location: 'Chandni Chowk Metro Gate 1, Delhi', capacity: 25, price: 899,
    imageUrl: img('photo-1555396273-367ea4eb4db5'),
    description: 'A guided three-hour walk through eight legendary stalls, with the stories behind each recipe.' },
  { title: 'Watercolour for Beginners', category: 'Art', date: at(18, 15), location: 'Studio 9, Hauz Khas Village, Delhi', capacity: 18, price: 650,
    imageUrl: img('photo-1513364776144-60967b0f800f'),
    description: 'Materials included. Learn washes, layering and how to paint a monsoon skyline in one afternoon.' },
  { title: 'Sunday 10K Fun Run', category: 'Sports', date: at(21, 6), location: 'Nehru Park, Chanakyapuri, Delhi', capacity: 500, price: 0,
    imageUrl: img('photo-1552674605-db6ffd4facb5'),
    description: 'A friendly, chip-timed 10K and a 3K family loop. Finish with chai and poha.' },
  { title: 'Intro to Data Analysis with Python', category: 'Education', date: at(26, 10), location: 'Online (link sent after registration)', capacity: 300, price: 0,
    imageUrl: img('photo-1517694712202-14dd9538aa97'),
    description: 'A hands-on beginner workshop using pandas and Jupyter. No prior programming experience required.' },
  { title: 'Neighbourhood Clean-up Drive', category: 'Community', date: at(30, 8), location: 'Yamuna Ghat, Delhi', capacity: 150, price: 0,
    imageUrl: img('photo-1618477461853-cf6ed80faba5'),
    description: 'Gloves, bags and breakfast are on us. Bring friends, water and a hat.' },
].map((e) => ({ ...e, organizer: organizer._id })));

console.log('Seeded. Logins (password: password123): organizer@demo.com, user@demo.com, admin@demo.com');
await mongoose.disconnect();
