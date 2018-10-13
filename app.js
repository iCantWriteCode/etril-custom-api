const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");

const userRoutes = require("./api/routes/users");
const roomRoutes = require("./api/routes/room");


// const googlePlacesRoutes = require("./api/routes/googlePlaces");
// const pushNotificationsRoutes = require("./api/routes/notifications");
// const adminRoutes = require("./api/routes/admin");
// const offerRoutes = require("./api/routes/offer");
// const deviceRoutes = require("./api/routes/device");

const enviroment = process.env.NODE_ENV;

// const mongoUrl =
//   enviroment === "development"
//     ? "mongodb://localhost/etrilNew"
//     : "mongodb://ProposerUser:A15081980p@localhost:2717/proposer";

const mongoUrl = "mongodb://localhost/etrilNew";


mongoose.connect(
  mongoUrl,
  { useNewUrlParser: true },
  () => {
    console.log(`Mongo Connected`);
  }
);

app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:4000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json();
  }
  next();
});

app.use("/user", userRoutes);
app.use("/room", roomRoutes);

// app.use("/googlePlaces", googlePlacesRoutes);
// app.use("/offers", offerRoutes);
// app.use("/pushNotifications", pushNotificationsRoutes);
// app.use("/admin", adminRoutes);
// app.use("/device", deviceRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
