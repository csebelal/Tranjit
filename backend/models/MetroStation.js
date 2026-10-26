const mongoose = require('mongoose');

const metroStationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  en: { type: String, required: true },
  km: { type: Number, required: true },
  zone: { type: Number, required: true },
  major: { type: Boolean, default: false },
  terminal: { type: Boolean, default: false },
});

module.exports = mongoose.model('MetroStation', metroStationSchema);
