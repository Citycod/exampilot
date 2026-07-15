const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { users, findUserByEmail, createUser } = require('../store/user.store');
const env = require('../config/env');

const register = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
  };

  createUser(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, env.jwtSecret, { expiresIn: '1d' });

  res.status(201).json({ token, email: newUser.email });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: '1d' });

  res.json({ token, email: user.email });
};

module.exports = { register, login };
