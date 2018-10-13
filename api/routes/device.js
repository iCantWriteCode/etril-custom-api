const express = require("express");
const router = express.Router();
const Device = require("../models/device.model");

router.post("/", (req, res, next) => {
  //   const { data } = req.body;
  //   console.log(data);
  //   res.status(200).json({ message: "OK" });
  console.log(req.body);
  const { uuid } = req.body;
  let newDevice = new Device({
    uuid: uuid
  });
  newDevice.save((err, device) => {
    if (err) {
      return res.status(500).json({
        message: "An error has occured"
      });
    }
    return res.status(200).json(device);
  });
});

module.exports = router;
