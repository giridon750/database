const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

function validateStudentInput(name, age) {
  if (typeof name !== "string" || name.trim().length === 0) {
    return "Name is required.";
  }

  if (name.trim().length > 100) {
    return "Name must be 100 characters or fewer.";
  }

  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return "Age must be a whole number between 0 and 120.";
  }

  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.json(students);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { name, age } = req.body || {};
  const validationMessage = validateStudentInput(name, age);

  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const student = await Student.create({ name: name.trim(), age });
    return res.status(201).json(student);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Student ID is invalid." });
  }

  const { name, age } = req.body || {};
  const validationMessage = validateStudentInput(name, age);

  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), age },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.json(student);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Student ID is invalid." });
  }

  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.json({ message: "Student deleted successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
