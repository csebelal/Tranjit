const mongoose = require('mongoose');

const routeFareSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true },
  routeName: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  distance: { type: Number, required: true },
  fare: { type: Number, required: true },
  vehicleType: { type: String, default: 'ডিজেল চালিত বাস' }
});

routeFareSchema.index({ routeNumber: 1, from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('RouteFare', routeFareSchema);