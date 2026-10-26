const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const fareChartsDir = path.join(__dirname, '../../frontend/public/fare-charts');

const stopNameMappings = {
  'বনশ্রী': 'বনশ্রী',
  'মোহাম্মদপুর': 'মোহাম্মদপুর',
  'জাপান গার্ডেন সিটি': 'জাপান গার্ডেন সিটি',
  'ধউর': 'ধামরাই',
  'সাভার': 'সাভার',
  'মিরপুর': 'মিরপুর ১',
  'ইপিজেড': 'ইপিজেড',
  'সদরঘাট': 'সদরঘাট',
  'সায়দাবাদ': 'সায়েদাবাদ',
  'হেমায়েতপুর': 'হেমায়েতপুর',
  'ডেমরা': 'ডেমরা',
  'দিয়াবাড়ী': 'দিয়া বাড়ি',
  'পোস্তগোলা': 'পোস্তগোলা',
  'কাচপুর': 'কাঁচপুর',
  'বসিলা': 'বসিলা',
  'নারায়নগঞ্জ': 'নারায়ণগঞ্জ',
  'নন্দনপার্ক': 'নন্দন পার্ক',
  'আজিমপুর': 'আজিমপুর',
  'চিড়িয়াখানা': 'চিরিয়াখানা',
  'কামারপাড়া': 'কামারপাড়া',
  'কুড়িল': 'কুড়িল বিশ্বরোড',
  'আজমপুর': 'আজমপুর',
  'মদনপুর': 'মদনপুর',
  'নবীনগর': 'নবীনগর',
  'ভাষানটেক': 'ভাসানটেক',
  'সাইনবোর্ড': 'সাইন বোর্ড',
  'গাবতলী': 'গাবতলী',
  'রামপুরা': 'রামপুরা বাজার',
  'ফুলবাড়িয়া': 'ফুলবাড়িয়া',
  'গাজীপুর': 'গাজীপুর চৌরাস্তা',
  'টংগী': 'টঙ্গী',
  'শিয়ালবাড়ী': 'শিয়াল বাড়ি',
  'গুলিস্থান': 'গুলিস্তান',
  'ভুলতা': 'ভুলতা',
  'কালামপুর': 'কল্যাণপুর',
  'ফার্মগেট': 'ফার্মগেট',
  'শাহবাগ': 'শাহবাগ',
  'মতিঝিল': 'মতিঝিল',
  'কমলাপুর': 'কমলাপুর',
  'উত্তরা': 'উত্তরা',
  'আব্দুল্লাহপুর': 'আব্দুল্লাহপুর',
  'বাড্ডা': 'উত্তর বাড্ডা',
  'বনানী': 'বনানী',
  'গুলশান': 'গুলশান ১',
};

function extractFareFromText(text, routeName) {
  const fares = [];
  
  const lines = text.split('\n').filter(l => l.trim());
  
  let fromStop = null;
  let toStop = null;
  
  for (const line of lines) {
    const numbers = line.match(/\d+/g);
    const cleaned = line.replace(/[^\u0980-\u09FFa-zA-Z\s]/g, '').trim();
    
    if (numbers && numbers.length > 0) {
      const lastNum = parseInt(numbers[numbers.length - 1]);
      if (lastNum >= 10 && lastNum <= 100) {
        fares.push({
          from: routeName.from,
          to: routeName.to,
          fare: lastNum,
          route: `${routeName.from} → ${routeName.to}`
        });
      }
    }
  }
  
  return fares;
}

function parseRouteFromHeader(header) {
  const patterns = [
    /([অ-হ]+)\s*হতে\s+([অ-হ]+)/,
    /([অ-হ]+)\s+হতে\s+([অ-হ]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = header.match(pattern);
    if (match) {
      const from = stopNameMappings[match[1]] || match[1];
      const to = stopNameMappings[match[2]] || match[2];
      return { from, to };
    }
  }
  
  return { from: 'Unknown', to: 'Unknown' };
}

async function extractFareData() {
  const files = fs.readdirSync(fareChartsDir).filter(f => 
    f.match(/\.(jpg|jpeg|png)$/i)
  );
  
  console.log(`Found ${files.length} fare chart images\n`);
  
  const allFares = [];
  const routeInfo = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(fareChartsDir, file);
    
    console.log(`[${i+1}/${files.length}] Processing: ${file}`);
    
    try {
      const result = await Tesseract.recognize(filePath, 'ben', {
        logger: m => {},
        tessedit_pageseg_mode: '6',
      });
      
      const text = result.data.text;
      const lines = text.split('\n').filter(l => l.trim());
      
      const header = lines[0] || '';
      const routeName = parseRouteFromHeader(header);
      
      const routeFares = extractFareFromText(text, routeName);
      
      if (routeFares.length > 0) {
        allFares.push(...routeFares);
        routeInfo.push({
          file,
          route: `${routeName.from} → ${routeName.to}`,
          fares: routeFares.length
        });
        console.log(`  ✓ Found ${routeFares.length} fares: ${routeName.from} → ${routeName.to}`);
      } else {
        console.log(`  ✗ No fares found`);
      }
      
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  
  const output = {
    extractionDate: new Date().toISOString(),
    totalImages: files.length,
    routesFound: routeInfo.length,
    totalFares: allFares.length,
    routes: routeInfo,
    fares: allFares
  };
  
  const outputPath = path.join(__dirname, 'extracted-fares.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n=== Summary ===`);
  console.log(`Total Routes Found: ${routeInfo.length}`);
  console.log(`Total Fares Extracted: ${allFares.length}`);
  console.log(`Saved to: ${outputPath}`);
}

extractFareData().catch(console.error);