import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent, myEvents, attendees,
} from '../controllers/eventController.js';
import { registerForEvent, cancelRegistration } from '../controllers/registrationController.js';

const router = Router();
const organizer = [protect, authorize('organizer', 'admin')];

router.get('/', listEvents);
router.get('/mine', ...organizer, myEvents); // must be declared before '/:id'
router.post('/', ...organizer, createEvent);
router.get('/:id', getEvent);
router.put('/:id', ...organizer, updateEvent);
router.delete('/:id', ...organizer, deleteEvent);
router.get('/:id/attendees', ...organizer, attendees);

router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

export default router;
