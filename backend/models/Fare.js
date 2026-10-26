const mongoose = require('mongoose');

const FareSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    dist: { type: Number, required: true },
    fare: { type: Number, required: true },
    type: { type: String, enum: ['direct', 'transfer'], default: 'direct' },
    count: { type: Number, default: 0 }
});

FareSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Fare', FareSchema);
