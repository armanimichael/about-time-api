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
  const doesEmailExists = await user.model.findOne({
    email,
  });
  if (doesEmailExists)
    return res.status(400).json({ result: 'Email already exists.' });

  const doesUserExists = await user.model.findOne({
    username,
  });
  if (doesUserExists)
    return res.status(400).json({ result: 'Username already exists.' });

  // User Creation or Errors
  const userModel = user.createModel({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await userModel.save();
    // * Response Success
    res.status(200).json({ result: 'success' });
  } catch (error) {
    console.log(error);
    // ! Response Error
    res.status(400).json({ result: error });
  }
});

export default router;
