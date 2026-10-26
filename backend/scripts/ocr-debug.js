const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const fareChartsDir = path.join(__dirname, '../../frontend/public/fare-charts');

async function extractFareData() {
  const files = fs.readdirSync(fareChartsDir).filter(f => 
    f.match(/\.(jpg|jpeg|png)$/i)
  );
  
  console.log(`Found ${files.length} fare chart images\n`);
  
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(fareChartsDir, file);
    
    console.log(`[${i+1}/${files.length}] ${file}`);
    
    try {
      const result = await Tesseract.recognize(filePath, 'ben+eng', {
        logger: m => {},
        tessedit_pageseg_mode: '3',
      });
      
      const text = result.data.text;
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      console.log(`   Lines: ${lines.length}`);
      console.log(`   Sample: ${lines.slice(0, 3).join(' | ')}`);
      
      const fareMatches = text.match(/\b(\d{2})\s*(?:টাকা|৳)?\b/gi);
      if (fareMatches) {
        console.log(`   Fares found: ${fareMatches.join(', ')}`);
      }
      
      results.push({
        file,
        text: text.substring(0, 500),
        lines: lines.slice(0, 10)
      });
      
    } catch (err) {
      console.error(`   Error: ${err.message}`);
    }
  }
  
  fs.writeFileSync(
    path.join(__dirname, 'ocr-raw-output.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nSaved to ocr-raw-output.json');
}

extractFareData().catch(console.error);