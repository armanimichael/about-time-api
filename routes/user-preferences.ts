import { Router } from 'express';

// Routes
const router = Router();

router.post('/preferences/username', (req, res) => {
  // TODO: change username
});

router.post('/preferences/push-notifications', (req, res) => {
  // TODO: set push notifications
});

router.post('/preferences/activities-overview', (req, res) => {
  // TODO: set activities overview
});

router.get('/preferences', (req, res) => {
  // TODO: get user's preferences
});

router.get('/preferences/:preference', (req, res) => {
  // TODO: get user's preference
});

export default router;
