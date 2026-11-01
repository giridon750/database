require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/students");
const userRoutes = require("./routes/users");

const app = express();
const port = Number(process.env.PORT) || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));
app.use(express.json({ limit: "10kb" }));
app.use("/api/students", studentRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must contain valid JSON." });
  }

  console.error(error);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to backend/.env before starting the server.");
  }

  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Could not start the server:", error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
