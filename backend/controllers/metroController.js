const MetroStation = require('../models/MetroStation');
const mongoose = require('mongoose');

const calculateFare = (a, b) => {
    const d = Math.abs(b.km - a.km);
    if(d <= 2) return 20;
    if(d <= 5) return 30;
    if(d <= 8) return 40;
    if(d <= 10) return 50;
    if(d <= 12) return 60;
    if(d <= 15) return 70;
    if(d <= 17) return 80;
    return 100;
};

const calculateTime = (a, b) => {
    const d = Math.abs(b.km - a.km);
    const stationCount = Math.abs(b.index - a.index);
    return Math.round(d * 2.4 + stationCount * 0.5);
};

exports.getMetroStations = async (req, res) => {
    try {
        const stations = await MetroStation.find().sort({ km: 1 });
        res.json(stations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMetroFare = async (req, res) => {
    const { fromId, toId } = req.query;
    if (!fromId || !toId) {
        return res.status(400).json({ message: 'From and To station IDs are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(fromId) || !mongoose.Types.ObjectId.isValid(toId)) {
        return res.status(400).json({ message: 'Invalid station ID format' });
    }

    try {
        const from = await MetroStation.findById(fromId);
        const to = await MetroStation.findById(toId);
        
        if (!from || !to) {
            return res.status(404).json({ message: 'Station not found' });
        }

        const fare = calculateFare(from, to);
        const dist = Math.abs(to.km - from.km);
        
        // Find index in sorted list for time calculation
        const allStationsSorted = await MetroStation.find().sort({ km: 1 });
        const fromIdx = allStationsSorted.findIndex(s => s._id.toString() === fromId);
        const toIdx = allStationsSorted.findIndex(s => s._id.toString() === toId);
        
        const mins = calculateTime({ ...from._doc, index: fromIdx }, { ...to._doc, index: toIdx });

        res.json({
            fare,
            distance: dist.toFixed(2),
            time: mins,
            from: from.name,
            to: to.name
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
