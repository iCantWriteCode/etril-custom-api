const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(
  {
    uuid: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Device", deviceSchema);
