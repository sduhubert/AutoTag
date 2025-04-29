//for users and admins
import db from '../models/index.js';
const { User } = db;

//get all users
export const getAllUsers = async (req, res) => { // GET /api/users
  try {
    const users = await User.findAll();
    //const admins = await Admin.findAll(); depends on how we implement admin later
    //will we just attach it to user, as a field, like isAdmin
    //or independently create model, router, controller)
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

//get user by ID
export const getUserById = async (req, res) => { // GET /api/users/:id
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

//Create a new user
export const createUser = async (req, res) => { // POST /api/users
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
export const updateUser = async (req, res) => { // PUT /api/users/:id
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update(req.body);
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

//delete a user
export const deleteUser = async (req, res) => { // DELETE /api/users/:id
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};