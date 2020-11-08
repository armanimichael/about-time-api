import { Router } from 'express';
import { Database } from '../controllers/Database';
import { getLoggedUserID } from '../utils/auth';

// Routes
const router = Router();

// Update Username
router.put('/username', async (req, res) => {
  const { username } = req.body;

  // Logged User ID
  const id = getLoggedUserID(req);

  // Username validation
  const preferences = Database.collections.UserPreferences;
  const user = Database.collections.User;
  const validationError = preferences.validateModel({ username });

  if (validationError) {
    // ! Validation Error
    return res.status(400).json({ result: validationError.details[0].message });
  }

  // Updating Username
  // Checking if username already exists
  const existingUsername = await user.model.findOne({ username });
  if (existingUsername) {
    // ! Username already exists
    return res.status(409).json({ result: 'Username already exists.' });
  }

  // * Username updated
  await user.model.findByIdAndUpdate(id, { username }, { omitUndefined: true });
  return res.status(200).json({ result: 'Preferences updated.' });
});

// Set User Preferences
router.post('/', async (req, res) => {
  const { pushNotifications, activitiesOverview } = req.body;

  // Logged User ID
  const user_id = getLoggedUserID(req);

  // Preferences Validation
  const preferences = Database.collections.UserPreferences;
  const validationError = preferences.validateModel({
    pushNotifications,
    activitiesOverview,
  });

  if (validationError) {
    // ! Validation Error
    return res.status(400).json({ result: validationError.details[0].message });
  }

  // Check for existing options
  const existingPreferences = await preferences.model.findOne({ user_id });
  if (existingPreferences) {
    // ! User Preferences Already exist
    // Updating Preferences
    const updateProcess = await preferences.model.updateOne(
      { user_id },
      { activitiesOverview },
      { omitUndefined: true },
    );

    if (updateProcess.nModified > 0) {
      return res.status(200).json({ result: 'Preferences updated.' });
    }

    return res.status(200).json({ result: 'Preferences did not change.' });
  }

  // Preferences Creation or Errors
  const preferencesModel = preferences.createModel({
    user_id,
    pushNotifications,
    activitiesOverview,
  });

  await preferencesModel
    .save()
    .then(() => {
      // * Response Success
      res.status(200).json({ result: 'success' });
    })
    .catch(error => {
      // ! Response Error
      console.log(error);
      res.status(400).json({ result: error });
    });
});

router.get('/', async (req, res) => {
  // Logged User ID
  const user_id = getLoggedUserID(req);

  // Get preferences from DB
  const preferences = Database.collections.UserPreferences;
  const fetchPreferences = await preferences.model.findOne(
    { user_id },
    'pushNotifications activitiesOverview',
  );

  return res.status(200).json(fetchPreferences);
});

router.get('/:preference', async (req, res) => {
  const { preference } = req.params;

  // Logged User ID
  const user_id = getLoggedUserID(req);

  // Get preferences from DB
  const preferences = Database.collections.UserPreferences;
  const fetchPreferences = await preferences.model.findOne(
    { user_id },
    preference,
  );

  const preferenceValue = fetchPreferences?.get(preference);
  if (!preferenceValue) {
    return res.status(404).json({ result: "This preference doesn't exist." });
  }

  return res.status(200).json({ result: preferenceValue });
});

export default router;
