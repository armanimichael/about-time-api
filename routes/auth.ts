import { Router } from 'express';
import { Database } from '../controllers/Database';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // User Data Validation
  const user = Database.documents.User;
  const validationError = user.validateModel({ username, email, password });

  if (validationError) {
    // ! Validation Error
    return res.status(400).json({ result: validationError.details[0].message });
  }

  // Hashing
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  // Check for Existing Mail
  const doesEmailExists = await user.model.findOne({ email });
  if (doesEmailExists)
    return res.status(400).json({ result: 'Email already exists.' });

  const doesUserExists = await user.model.findOne({ username });
  if (doesUserExists)
    return res.status(400).json({ result: 'Username already exists.' });

  // User Creation or Errors
  const userModel = user.createModel({
    username,
    email,
    password: hashedPassword,
  });

  await userModel
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

router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  // User Data Validation
  const user = Database.documents.User;
  const validationError = user.validateModel(
    { username, email, password },
    'login',
  );

  if (validationError) {
    // ! Validation Error
    return res.status(400).json({ result: validationError.details[0].message });
  }

  // Check for Existing Mail or User
  interface UserQuery {
    password: string;
  }

  // Check if user logged by username or mail and return its data
  const userByMail = (await user.model.findOne(
    { email },
    'password',
  )) as UserQuery | null;
  const userByUsername = (await user.model.findOne(
    { username },
    'password',
  )) as UserQuery | null;

  const loginPassword = () => {
    if (username) {
      return userByUsername?.password || '';
    }
    return userByMail?.password || '';
  };

  // Compare Passwords
  const isValidPassword = await bcrypt
    .compare(password, loginPassword())
    .catch(error => {
      return res.status(500).json({ result: error });
    });

  // ! Incorrect Credentials
  if (!isValidPassword) {
    return res.status(400).json({
      result: `Incorrect ${email ? 'Email' : 'Username'} or Password.`,
    });
  }

  // * Logged In
  return res.status(200).json({ result: 'Login successful.' });
});

export default router;
