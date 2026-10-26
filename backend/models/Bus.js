const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  routeNumber: { type: String, default: null },
  type: { type: String, required: true },
  ac: { type: Boolean, default: false },
  time: { type: String, required: true },
  stops: [String],
  distanceKm: { type: Number },
});

module.exports = mongoose.model('Bus', busSchema);
