const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', '..', 'Dhaka Trasit.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Use regex to extract BD and MRT constants
// BD regex
const bdMatch = htmlContent.match(/const BD = (\[[\s\S]*?\]);/);
if (bdMatch) {
    const bdData = bdMatch[1];
    // Write BD data to a JSON file
    // Caution: BD data is JS object literal, not strictly JSON. Some fields might lack quotes.
    // I will try to save it as JS for the seed script.
    fs.writeFileSync(path.join(__dirname, 'busData.js'), 'module.exports = ' + bdData + ';');
    console.log('Bus data extracted successfully');
}

// MRT regex
const mrtMatch = htmlContent.match(/const MRT = (\[[\s\S]*?\]);/);
if (mrtMatch) {
    const mrtData = mrtMatch[1];
    fs.writeFileSync(path.join(__dirname, 'metroData.js'), 'module.exports = ' + mrtData + ';');
    console.log('Metro data extracted successfully');
}
