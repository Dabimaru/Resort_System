import { loginUser, registerUser } from '../services/authService.js';

export const registerController = async (req, res) => {
  try {
    const result = await registerUser(req.body || {});
    res.status(201).json({
      message: 'User registered successfully.',
      user: result.user,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Registration failed.' });
  }
};

export const loginController = async (req, res) => {
  try {
    const result = await loginUser(req.body || {});
    res.status(200).json({
      message: 'Login successful.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Login failed.' });
  }
};

export const meController = async (req, res) => {
  return res.status(200).json({ user: req.user });
};
