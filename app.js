require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const router = require("./routes");

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(router);

//404 handler
app.use((req, res, next) => {
  return res.status(404).json({
    status: false,
    message: "Are you lost?",
  });
});

// 500 handler
app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).json({
    status: false,
    message: err.message,
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = server;
