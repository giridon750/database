const express = require("express");
const User = require("../models/User");

const router = express.Router();

function validateUserInput(name, email, age) {
  if (typeof name !== "string" || name.trim().length === 0) {
    return "Name is required.";
  }

  if (name.trim().length > 100) {
    return "Name must be 100 characters or fewer.";
  }

  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "Enter a valid email address.";
  }

  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return "Age must be a whole number between 0 and 120.";
  }

  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { name, email, age } = req.body || {};
  const validationMessage = validateUserInput(name, email, age);

  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age
    });
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
