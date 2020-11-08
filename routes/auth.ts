import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEmail } from '../utils/auth';
import { Database } from '../controllers/Database';

// Routes
const router = Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // User Data Validation
  const user = Database.collections.User;
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

  // Validate Email
  if (!process.env.SKIP_EMAIL_VALIDATION) {
    try {
      const { smtpCheck, dnsCheck, disposableCheck } = await validateEmail(
        email,
      );

      // ! Email Validation Error
      if (
        smtpCheck === 'false' ||
        dnsCheck === 'false' ||
        disposableCheck === 'true'
      ) {
        return res.status(400).json({ result: 'Email not valid.' });
      }
    } catch (error) {
      // ! Verification API Error
      return res.status(500).json({ result: 'Error validating the email.' });
    }
  }

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
  const user = Database.collections.User;
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
    _id: string;
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

  const userLoginData = (): UserQuery => {
    const defaultData: UserQuery = {
      _id: '',
      password: '',
    };

    if (username) {
      return userByUsername || defaultData;
    }
    return userByMail || defaultData;
  };

  // Compare Passwords
  const isValidPassword = await bcrypt
    .compare(password, userLoginData().password)
    .catch(error => {
      return res.status(500).json({ result: error });
    });

  // ! Incorrect Credentials
  if (!isValidPassword) {
    return res.status(400).json({
      result: `Incorrect ${email ? 'Email' : 'Username'} or Password.`,
    });
  }

  // * JWT and Login
  const token = jwt.sign(
    { _id: userLoginData()._id },
    process.env.JWT_SECRET as string,
  );

  res.header('JWT-Auth-Token', token);
  return res.status(200).json({ result: 'Login successful.', token: token });
});

export default router;
