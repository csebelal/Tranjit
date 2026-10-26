const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Bus = require('../models/Bus');
const MetroStation = require('../models/MetroStation');
const Fare = require('../models/Fare');
const busData = require('./busData');
const metroData = require('./metroData');
const seedRouteFaresFromCharts = require('./seedRouteFaresFromCharts');

const commonStops = ["গাবতলী","সাভার","মিরপুর ১","মিরপুর ১০","মিরপুর ১৪","শেওড়াপাড়া","শ্যামলী","আগারগাঁও","ফার্মগেট","শাহবাগ","মহাখালী","বনানী","গুলশান ২","উত্তরা","পল্টন","গুলিস্তান","মতিঝিল","কমলাপুর","সায়েদাবাদ","যাত্রাবাড়ি","বাংলা মোটর","বাড্ডা","রামপুরা ব্রিজ","কুড়িল বিশ্বরোড","মোহাম্মদপুর","ধানমন্ডি ৩২","সদরঘাট","কেরাণীগঞ্জ","টঙ্গী","গাজীপুর চৌরাস্তা","নন্দন পার্ক"];

const STOP_KM = 1.2;
const RATE = 2.45;
const MIN_FARE = 10;

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding');

        // Clear existing data
        await Bus.deleteMany({});
        await MetroStation.deleteMany({});
        await Fare.deleteMany({});
        console.log('Cleared existing data');

        // Insert bus data
        const buses = busData.map(b => ({
            name: b.name,
            nameEn: b.nameEn,
            routeNumber: b.routeNumber || null,
            type: b.type,
            ac: b.ac,
            time: b.time,
            stops: b.stops,
            distanceKm: b.distanceKm || null
        }));
        await Bus.insertMany(buses);
        console.log(`Inserted ${buses.length} buses`);

        // Get buses from memory for fare calculation
        const allBuses = buses;

        const getBusesForStops = (f, t) => {
            return allBuses.filter(b => {
                const fi = b.stops.indexOf(f);
                const ti = b.stops.indexOf(t);
                return fi !== -1 && ti !== -1 && fi < ti;
            }).map(b => ({
                ...b,
                dist: (b.stops.indexOf(t) - b.stops.indexOf(f)) * (b.distanceKm ? b.distanceKm / (b.stops.length - 1) : STOP_KM)
            })).sort((a,b) => a.dist - b.dist);
        };

        const fareEntries = [];
        for (let i = 0; i < commonStops.length; i++) {
            for (let j = 0; j < commonStops.length; j++) {
                if(i === j) continue;
                const from = commonStops[i];
                const to = commonStops[j];
                const matchBuses = getBusesForStops(from, to);
                
                if (matchBuses.length > 0) {
                    const dist = matchBuses[0].dist;
                    fareEntries.push({
                        from, to, dist: parseFloat(dist.toFixed(1)),
                        fare: Math.max(MIN_FARE, Math.round(dist * RATE)),
                        count: matchBuses.length,
                        type: 'direct'
                    });
                }
            }
        }
        await Fare.insertMany(fareEntries);
        console.log(`Inserted ${fareEntries.length} fare records`);

        // Insert metro data
        const metroStations = metroData.map(m => ({
            name: m.name,
            en: m.en,
            km: m.km,
            zone: m.zone,
            major: m.major || false,
            terminal: m.terminal || false
        }));
        await MetroStation.insertMany(metroStations);
        console.log(`Inserted ${metroStations.length} metro stations`);

        // Seed RouteFare from official fare charts
        await seedRouteFaresFromCharts();

        console.log('Database seeded successfully');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
