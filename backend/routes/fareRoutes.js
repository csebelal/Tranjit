const express = require('express');
const router = express.Router();
const Fare = require('../models/Fare');
const Bus = require('../models/Bus');

const STOP_KM = 1.2;
const RATE = 2.45;
const MIN_FARE = 10;

router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        let filter = {};
        if (q) {
            filter = {
                $or: [
                    { from: { $regex: q, $options: 'i' } },
                    { to: { $regex: q, $options: 'i' } }
                ]
            };
        }
        
        let fares = await Fare.find(filter).limit(100);
        
        // If no fares in DB, generate from bus data
        if (fares.length === 0) {
            const allStops = await Bus.distinct('stops');
            const allBuses = await Bus.find();
            
            // Generate fares from bus routes
            const fareMap = new Map();
            
            for (const bus of allBuses) {
                for (let i = 0; i < bus.stops.length; i++) {
                    for (let j = i + 1; j < bus.stops.length; j++) {
                        const from = bus.stops[i];
                        const to = bus.stops[j];
                        const key = `${from}|${to}`;
                        
                        if (!fareMap.has(key)) {
                            const kmPerStop = bus.distanceKm ? bus.distanceKm / (bus.stops.length - 1) : STOP_KM;
                            const dist = (j - i) * kmPerStop;
                            fareMap.set(key, {
                                from,
                                to,
                                dist: parseFloat(dist.toFixed(1)),
                                fare: Math.max(MIN_FARE, Math.round(dist * RATE)),
                                type: 'direct'
                            });
                        }
                    }
                }
            }
            
            // Convert to array and apply filter if any
            let generatedFares = Array.from(fareMap.values());
            
            if (q) {
                const qLower = q.toLowerCase();
                generatedFares = generatedFares.filter(f => 
                    f.from.toLowerCase().includes(qLower) || 
                    f.to.toLowerCase().includes(qLower)
                );
            }
            
            fares = generatedFares.slice(0, 100);
        }
        
        res.json(fares);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
