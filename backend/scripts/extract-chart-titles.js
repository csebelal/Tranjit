const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

const imagesDir = path.join(__dirname, '../../frontend/public/fare-charts');

const generateCharts = () => {
    const charts = [];
    for (let i = 1; i <= 105; i++) {
        charts.push({
            id: i,
            src: `/fare-charts/Vara chart (${i}).jpg`
        });
    }
    return charts;
};

const cleanText = (text) => {
    return text.replace(/\s+/g, ' ').trim();
};

const extractRoute = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Pattern to extract "X হতে Y" format - captures first two place names after "কমিটি"
    const routePatterns = [
        /কমিটি\s+(.+?)\s+হতে\s+(.+?)(?:\s+\(|$)/,
        /কমিটি\s+(.+?)\s*→\s*(.+?)(?:\s+\(|$)/,
    ];
    
    for (const line of lines) {
        for (const pattern of routePatterns) {
            const match = line.match(pattern);
            if (match && match[1] && match[2]) {
                const from = match[1].replace(/\s*\([^)]*\)\s*/g, '').trim();
                const to = match[2].replace(/\s*\([^)]*\)\s*/g, '').trim();
                if (from.length > 1 && to.length > 1 && from.length < 50 && to.length < 50) {
                    return `${from} → ${to}`;
                }
            }
        }
    }
    
    // Fallback: try to find any "X হতে Y" in the entire text
    const allTextMatch = text.match(/(?:কমিটি\s+)?([অ-য়০-৯\s]+?)\s+হতে\s+([অ-য়০-৯\s]+?)(?:\s+\(|,|\s+রুট)/i);
    if (allTextMatch) {
        const from = allTextMatch[1].trim();
        const to = allTextMatch[2].trim();
        if (from.length > 1 && to.length > 1) {
            return `${from} → ${to}`;
        }
    }
    
    return null;
};

const processImage = async (chart, index) => {
    const imagePath = path.join(imagesDir, `Vara chart (${chart.id}).jpg`);
    
    if (!fs.existsSync(imagePath)) {
        console.log(`Image not found: ${imagePath}`);
        return { ...chart, title: `ভাড়া চার্ট ${chart.id}`, alt: `Fare chart ${chart.id}`, fullText: '', success: false };
    }
    
    try {
        console.log(`Processing ${index + 1}/105: ${chart.id}...`);
        
        const result = await Tesseract.recognize(imagePath, 'ben+eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    process.stdout.write('.');
                }
            }
        });
        
        const fullText = cleanText(result.data.text);
        
        let title = `ভাড়া চার্ট ${chart.id}`;
        let alt = `Fare chart ${chart.id}`;
        
        const route = extractRoute(fullText);
        if (route) {
            // Just use the short route format for display
            title = route;
            alt = route;
        }
        
        console.log(`\n  ✓ Extracted: ${title}`);
        
        return { ...chart, title, alt, fullText, success: true };
    } catch (err) {
        console.error(`\n  ✗ Error processing ${chart.id}:`, err.message);
        return { ...chart, title: `ভাড়া চার্ট ${chart.id}`, alt: `Fare chart ${chart.id}`, fullText: '', success: false, error: err.message };
    }
};

const main = async () => {
    console.log('Starting OCR process for fare charts...\n');
    
    const charts = generateCharts();
    const results = [];
    
    for (let i = 0; i < charts.length; i++) {
        const result = await processImage(charts[i], i);
        results.push(result);
    }
    
    const outputPath = path.join(__dirname, 'chart-titles.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    
    console.log(`\n\nDone! Results saved to: ${outputPath}`);
    
    const successCount = results.filter(r => r.success).length;
    console.log(`Successfully processed: ${successCount}/105`);
    
    console.log('\n--- Sample Results ---');
    results.slice(0, 5).forEach(r => {
        console.log(`Chart ${r.id}: ${r.title}`);
    });
};

main().catch(console.error);