const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Bus = require('../models/Bus');
const RouteFare = require('../models/RouteFare');
const charts = require('./chart-titles.json');

const RATE = 2.45;
const MIN_FARE = 10;

function bengaliToAscii(str) {
  const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
  return str.replace(/[০-৯]/g, d => map[d]);
}

function parseRouteNumber(fullText) {
  const match = fullText.match(/[এ]-([০-৯]+)/);
  if (!match) return null;
  const num = parseInt(bengaliToAscii(match[1]), 10);
  return `A-${num}`;
}

function parseTotalDistance(fullText) {
  // Pattern: after মোট + one word (দূরত্ব or OCR noise) + Bengali decimal number
  const match = fullText.match(/মোট\s+\S+\s+([০-৯]+\.?[০-৯]*)/);
  if (!match) return null;
  const val = parseFloat(bengaliToAscii(match[1]));
  return isNaN(val) ? null : val;
}

function computeFare(dist) {
  return Math.max(MIN_FARE, Math.round(dist * RATE));
}

// Returns index of stop in bus.stops using exact then partial match
function findStopIdx(stops, terminal) {
  const exact = stops.indexOf(terminal);
  if (exact !== -1) return exact;
  // Partial: terminal is substring of stop or vice versa
  return stops.findIndex(s => s.includes(terminal) || terminal.includes(s));
}

async function seedRouteFaresFromCharts() {
  const needConnect = mongoose.connection.readyState === 0;
  if (needConnect) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
  }

  await RouteFare.deleteMany({});
  console.log('Cleared RouteFare collection');

  const allBuses = await Bus.find().lean();
  const ops = [];
  let matchedCharts = 0;
  let skippedCharts = 0;

  for (const chart of charts) {
    if (!chart.success) { skippedCharts++; continue; }

    const routeNumber = parseRouteNumber(chart.fullText) || `CHART-${chart.id}`;
    const totalDist = parseTotalDistance(chart.fullText);

    if (!totalDist || totalDist <= 0) {
      console.warn(`Chart ${chart.id} (${chart.title}): distance parse failed, skipping`);
      skippedCharts++;
      continue;
    }

    const parts = (chart.title || '').split(' → ');
    if (parts.length < 2) { skippedCharts++; continue; }
    const fromTerminal = parts[0].trim();
    const toTerminal = parts.slice(1).join(' → ').trim();

    // Always add terminal-pair fare from official distance
    ops.push({
      updateOne: {
        filter: { routeNumber, from: fromTerminal, to: toTerminal },
        update: {
          $set: {
            routeNumber,
            routeName: chart.title,
            from: fromTerminal,
            to: toTerminal,
            distance: parseFloat(totalDist.toFixed(1)),
            fare: computeFare(totalDist),
            vehicleType: 'ডিজেল চালিত বাস'
          }
        },
        upsert: true
      }
    });

    // Find buses that serve both terminal stops → compute intermediate fares
    const matchingBuses = allBuses.filter(bus => {
      const stops = bus.stops || [];
      return findStopIdx(stops, fromTerminal) !== -1 && findStopIdx(stops, toTerminal) !== -1;
    });

    if (matchingBuses.length === 0) {
      skippedCharts++;
      continue;
    }

    matchedCharts++;

    for (const bus of matchingBuses) {
      const stops = bus.stops;
      if (!stops || stops.length < 2) continue;

      const fromIdx = findStopIdx(stops, fromTerminal);
      const toIdx = findStopIdx(stops, toTerminal);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) continue;

      const startIdx = Math.min(fromIdx, toIdx);
      const endIdx = Math.max(fromIdx, toIdx);
      const routeStops = stops.slice(startIdx, endIdx + 1);
      if (routeStops.length < 2) continue;

      const distPerGap = totalDist / (routeStops.length - 1);

      for (let i = 0; i < routeStops.length; i++) {
        for (let j = i + 1; j < routeStops.length; j++) {
          const dist = parseFloat(((j - i) * distPerGap).toFixed(1));
          ops.push({
            updateOne: {
              filter: { routeNumber, from: routeStops[i], to: routeStops[j] },
              update: {
                $set: {
                  routeNumber,
                  routeName: chart.title,
                  from: routeStops[i],
                  to: routeStops[j],
                  distance: dist,
                  fare: computeFare(dist),
                  vehicleType: 'ডিজেল চালিত বাস'
                }
              },
              upsert: true
            }
          });
        }
      }
    }
  }

  if (ops.length > 0) {
    // Process in batches to avoid exceeding MongoDB limits
    const BATCH = 500;
    let totalUpserted = 0;
    let totalModified = 0;
    for (let i = 0; i < ops.length; i += BATCH) {
      const result = await RouteFare.bulkWrite(ops.slice(i, i + BATCH), { ordered: false });
      totalUpserted += result.upsertedCount;
      totalModified += result.modifiedCount;
    }
    console.log(`RouteFare seeded: ${totalUpserted} inserted, ${totalModified} updated`);
  } else {
    console.log('No RouteFare records to insert');
  }

  console.log(`Charts: ${matchedCharts} matched buses, ${skippedCharts} skipped`);

  if (needConnect) {
    await mongoose.disconnect();
  }
}

module.exports = seedRouteFaresFromCharts;

if (require.main === module) {
  seedRouteFaresFromCharts()
    .then(() => { console.log('Done'); process.exit(0); })
    .catch(err => { console.error('Error:', err); process.exit(1); });
}
