const Bus = require('../models/Bus');
const MetroStation = require('../models/MetroStation');
const RouteFare = require('../models/RouteFare');
const Fare = require('../models/Fare');

const escapeRegex = (s) => s ? s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : s;

const STOP_KM = 1.2;
const RATE_DIESEL = 2.45; // Official BRTA rate per km
const RATE_GAS = 2.45; // Official BRTA rate per km
const MIN_FARE = 10;

// Helper: Calculate bus fare based on bus type
const calcBusFare = (dist, busType) => {
  const rate = busType && busType.includes('গ্যাস') ? RATE_GAS : RATE_DIESEL;
  return Math.max(MIN_FARE, Math.round(dist * rate));
};

// Helper: Get fare from route-specific fare chart or fallback
const getRouteFare = async (routeNumber, from, to, dist, busType) => {
    try {
        // Normalize stop names
        const normalize = (s) => s ? s.replace(/-/g, ' ').trim() : s;
        const fromNorm = normalize(from);
        const toNorm = normalize(to);

        // 1. Try route-specific fare (if routeNumber exists)
        if (routeNumber) {
            const routeFare = await RouteFare.findOne({
                routeNumber: routeNumber,
                $or: [
                    { from: fromNorm, to: toNorm },
                    { from: { $regex: fromNorm }, to: { $regex: toNorm } }
                ]
            });
            if (routeFare) return routeFare.fare;
        }

        // 2. Try any route-specific fare for this from-to (no routeNumber constraint)
        const anyRouteFare = await RouteFare.findOne({
            $or: [
                { from: fromNorm, to: toNorm },
                { from: { $regex: fromNorm }, to: { $regex: toNorm } }
            ]
        });
        if (anyRouteFare) return anyRouteFare.fare;

        // 3. Try generic fare (from-to pair in Fare collection)
        const genericFare = await Fare.findOne({
            $or: [
                { from: fromNorm, to: toNorm },
                { from: { $regex: fromNorm }, to: { $regex: toNorm } }
            ]
        });
        if (genericFare) return genericFare.fare;

        // 4. Fallback to formula with bus type
        return calcBusFare(dist, busType);
    } catch (e) {
        return calcBusFare(dist, busType);
    }
};

// Bilingual stop mapping: English aliases â†’ Bengali names (MUST be before matchStop)
const stopAliases = {
    // Mirpur area
    "mirpur 10": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§¦", "mirpur-10": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§¦", "mirpur10": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§¦",
    "mirpur 11": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§§", "mirpur-11": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§§", "mirpur11": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§§",
    "mirpur 12": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§¨", "mirpur-12": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§¨", "mirpur12": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§¨",
    "mirpur 14": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§ª", "mirpur-14": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§ª", "mirpur14": "à¦®à¦¿à¦°à¦ªà§à¦° à§§à§ª",
    "mirpur 1": "à¦®à¦¿à¦°à¦ªà§à¦° à§§", "mirpur-1": "à¦®à¦¿à¦°à¦ªà§à¦° à§§", "mirpur1": "à¦®à¦¿à¦°à¦ªà§à¦° à§§",
    "mirpur 2": "à¦®à¦¿à¦°à¦ªà§à¦° à§¨", "mirpur-2": "à¦®à¦¿à¦°à¦ªà§à¦° à§¨", "mirpur2": "à¦®à¦¿à¦°à¦ªà§à¦° à§¨",
    
    // Uttara area
    "uttara": "উত্তরা", "uttara north": "উত্তরা উত্তর", "uttara center": "উত্তরা সেন্টার", "uttara south": "উত্তরা দক্ষিণ",
    "uttara north": "à¦‰à¦¤à§à¦¤à¦°à¦¾ à¦‰à¦¤à§à¦¤à¦°", "uttara south": "à¦‰à¦¤à§à¦¤à¦°à¦¾ à¦¦à¦•à§à¦·à¦¿à¦£",
    
    // Central Dhaka
    "farmgate": "à¦«à¦¾à¦°à§à¦®à¦—à§‡à¦Ÿ", "farm gate": "à¦«à¦¾à¦°à§à¦®à¦—à§‡à¦Ÿ", "farmget": "à¦«à¦¾à¦°à§à¦®à¦—à§‡à¦Ÿ",
    "gulistan": "à¦—à§à¦²à¦¿à¦¸à§à¦¤à¦¾à¦¨", "gulistan": "à¦—à§à¦²à¦¿à¦¸à§à¦¤à¦¾à¦¨",
    "motijheel": "মতিঝিল", "motijhil": "মতিঝিল",
    "shahbag": "à¦¶à¦¾à¦¹à¦¬à¦¾à¦—", "shah bag": "à¦¶à¦¾à¦¹à¦¬à¦¾à¦—",
    "bijoy sarani": "à¦¬à¦¿à¦œà¦¯à¦¼ à¦¸à¦°à¦£à¦¿", "bijoy soroni": "à¦¬à¦¿à¦œà¦¯à¦¼ à¦¸à¦°à¦£à¦¿", "bijoy": "à¦¬à¦¿à¦œà¦¯à¦¼ à¦¸à¦°à¦£à¦¿",
    "agargaon": "আগারগাঁও", "agargaan": "আগারগাঁও", "agargão": "আগারগাঁও",
    "karwan bazar": "কারওয়ান বাজার", "karwanbazar": "কারওয়ান বাজার",
    "shahbagh": "à¦¶à¦¾à¦¹à¦¬à¦¾à¦—",
    
    // Other major stops
    "gazipur": "à¦—à¦¾à¦œà§€à¦ªà§à¦°", "gazipur chowrasta": "à¦—à¦¾à¦œà§€à¦ªà§à¦° à¦šà§Œà¦°à¦¾à¦¸à§à¦¤à¦¾",
    "savar": "à¦¸à¦¾à¦­à¦¾à¦°",
    "tongi": "à¦Ÿà¦™à§à¦—à§€",
    "gulshan": "à¦—à§à¦²à¦¶à¦¾à¦¨", "gulshan 1": "à¦—à§à¦²à¦¶à¦¾à¦¨ à§§", "gulshan 2": "à¦—à§à¦²à¦¶à¦¾à¦¨ à§¨",
    "banani": "à¦¬à¦¨à¦¾à¦¨à§€", "banani": "à¦¬à¦¨à¦¾à¦¨à§€",
    "baridhara": "à¦¬à¦¾à¦°à¦¿à¦§à¦°à¦¾",
    "dhanmondi": "à¦§à¦¾à¦¨à¦®à¦¨à§à¦¡à¦¿", "dhanmondi 27": "à¦§à¦¾à¦¨à¦®à¦¨à§à¦¡à¦¿ à§¨à§­", "dhanmondi 32": "à¦§à¦¾à¦¨à¦®à¦¨à§à¦¡à¦¿ à§©à§¨",
    "mohammadpur": "à¦®à§‹à¦¹à¦¾à¦®à§à¦®à¦¦à¦ªà§à¦°", "mohammad pur": "à¦®à§‹à¦¹à¦¾à¦®à§à¦®à¦¦à¦ªà§à¦°",
    "lalbagh": "à¦²à¦¾à¦²à¦¬à¦¾à¦—",
    "ramna": "à¦°à¦¾à¦®à¦¨à¦¾",
    "uttara": "উত্তরা", "uttara north": "উত্তরা উত্তর", "uttara center": "উত্তরা সেন্টার", "uttara south": "উত্তরা দক্ষিণ",
    "pallabi": "à¦ªà¦²à§à¦²à¦¬à§€",
    "kazipara": "à¦•à¦¾à¦œà§€à¦ªà¦¾à¦¡à¦¼à¦¾", "kazi para": "à¦•à¦¾à¦œà§€à¦ªà¦¾à¦¡à¦¼à¦¾",
    "shewrapara": "à¦¶à§‡à¦“à¦¡à¦¼à¦¾à¦ªà¦¾à¦¡à¦¼à¦¾", "shewa para": "à¦¶à§‡à¦“à¦¡à¦¼à¦¾à¦ªà¦¾à¦¡à¦¼à¦¾",
    
    // Airport area
    "airport": "à¦¬à¦¿à¦®à¦¾à¦¨à¦¬à¦¨à§à¦¦à¦°", "air port": "à¦¬à¦¿à¦®à¦¾à¦¨à¦¬à¦¨à§à¦¦à¦°", "hazrat shahjalal": "à¦¹à¦¯à¦°à¦¤ à¦¶à¦¾à¦¹à¦œà¦¾à¦²à¦¾à¦² à¦¬à¦¿à¦®à¦¾à¦¨à¦¬à¦¨à§à¦¦à¦°",
    
    // New Market area
    "new market": "à¦¨à¦¿à¦‰ à¦®à¦¾à¦°à§à¦•à§‡à¦Ÿ", "newmarket": "à¦¨à¦¿à¦‰ à¦®à¦¾à¦°à§à¦•à§‡à¦Ÿ",
    "nilkhET": "à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤", "nilkhet": "à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤", "nilkhet": "à¦¨à§€à¦²à¦•à§à¦·à§‡à¦¤",
    
    // Khilgaon area
    "khilgaon": "à¦–à¦¿à¦²à¦—à¦¾à¦à¦“", "khilgao": "à¦–à¦¿à¦²à¦—à¦¾à¦à¦“",
    
    // Rampura area
    "rampura": "à¦°à¦¾à¦®à¦ªà§à¦°à¦¾", "rampura bridge": "à¦°à¦¾à¦®à¦ªà§à¦°à¦¾ à¦¬à§à¦°à¦¿à¦œ", "rampura bazar": "à¦°à¦¾à¦®à¦ªà§à¦°à¦¾ à¦¬à¦¾à¦œà¦¾à¦°",
    
    // Badda area
    "badda": "à¦¬à¦¾à¦¡à§à¦¡à¦¾", "badda": "à¦¬à¦¾à¦¡à§à¦¡à¦¾",
    
    // Malibagh area
    "malibagh": "à¦®à¦¾à¦²à¦¿à¦¬à¦¾à¦—", "malibag": "à¦®à¦¾à¦²à¦¿à¦¬à¦¾à¦—", "malibagh railgate": "à¦®à¦¾à¦²à¦¿à¦¬à¦¾à¦— à¦°à§‡à¦²à¦—à§‡à¦Ÿ",
    
    // Jatrabari area
    "jatrabari": "à¦¯à¦¾à¦¤à§à¦°à¦¾à¦¬à¦¾à¦¡à¦¼à¦¿", "jatrabari": "à¦¯à¦¾à¦¤à§à¦°à¦¾à¦¬à¦¾à¦¡à¦¼à¦¿", "yatrabari": "à¦¯à¦¾à¦¤à§à¦°à¦¾à¦¬à¦¾à¦¡à¦¼à¦¿",
    
    // Demra area
    "demra": "à¦¡à§‡à¦®à¦°à¦¾",
    
    // Savar area
    "amin bazar": "à¦†à¦®à¦¿à¦¨ à¦¬à¦¾à¦œà¦¾à¦°", "aminbazar": "à¦†à¦®à¦¿à¦¨ à¦¬à¦¾à¦œà¦¾à¦°",
    "gabtoli": "à¦—à¦¾à¦¬à¦¤à¦²à§€", "gabtoli": "à¦—à¦¾à¦¬à¦¤à¦²à§€",
    
    // Other
    "sayedabad": "à¦¸à¦¾à¦¯à¦¼à§‡à¦¦à¦¾à¦¬à¦¾à¦¦", "saydabad": "à¦¸à¦¾à¦¯à¦¼à§‡à¦¦à¦¾à¦¬à¦¾à¦¦",
    "komlapur": "à¦•à¦®à¦²à¦¾à¦ªà§à¦°", "komla pur": "à¦•à¦®à¦²à¦¾à¦ªà§à¦°",
    "press club": "à¦ªà§à¦°à§‡à¦¸ à¦•à§à¦²à¦¾à¦¬", "pressclub": "à¦ªà§à¦°à§‡à¦¸ à¦•à§à¦²à¦¾à¦¬",
    "high court": "à¦¹à¦¾à¦‡à¦•à§‹à¦°à§à¦Ÿ", "highcourt": "à¦¹à¦¾à¦‡à¦•à§‹à¦°à§à¦Ÿ",
    "mymensingh road": "à¦®à§Žà¦¸à§à¦¯ à¦­à¦¬à¦¨", "matsya baban": "à¦®à§Žà¦¸à§à¦¯ à¦­à¦¬à¦¨",
    "paltan": "à¦ªà¦²à§à¦Ÿà¦¨", "polton": "à¦ªà¦²à§à¦Ÿà¦¨",
    "gpo": "à¦œà¦¿à¦ªà¦¿à¦“", "gpo": "à¦œà¦¿à¦ªà¦¿à¦“",
    "bangla motor": "à¦¬à¦¾à¦‚à¦²à¦¾ à¦®à§‹à¦Ÿà¦°", "banglamotor": "à¦¬à¦¾à¦‚à¦²à¦¾ à¦®à§‹à¦Ÿà¦°",
    "kakrail": "কাকরাইল",

    // Important missing stops / popular searches
    "dhaka university": "মৎস্য ভবন", "dhaka univ": "মৎস্য ভবন", "university": "মৎস্য ভবন",
    "buet": "বাংলা মোটর", "engineering university": "বাংলা মোটর",
    "medical college": "সিএমএইচ", "cmh": "সিএমএইচ",
    "arbamin": "আরামবাগ", "arambag": "আরামবাগ",
    "gpo": "জিপিও",
    "azimpur": "আজিমপুর",
    "tajmahal road": "তাজমহল রোড",
    "garrison": "গ্যারিসন (ক্যান্টনমেন্ট)",
    "cantoment": "ক্যান্টনমেন্ট",
    "zanjeero": "যারুন",
    "monipur": "মিরপুর ১০", "monipul": "মিরপুর ১০",

    // Popular routes aliases
    "uttara": "উত্তরা",
    "motijheel": "মতিঝিল", "motijhil": "মতিঝিল",
    "abdullahpur": "আব্দুল্লাহপুর",
    "mirpur 10": "মিরপুর ১০", "mirpur10": "মিরপুর ১০",
    "mirpur": "মিরপুর ১",
    "gulshan": "গুলশান ১", "gulshan 1": "গুলশান ১", "gulshan 2": "গুলশান ২",
    "mohammadpur": "মোহাম্মদপুর",
    "shahbag": "শাহবাগ", "shah bag": "শাহবাগ",
    "gabtoli": "গাবতলী",
    "sadar ghat": "সদরঘাট",
    "badda": "উত্তর বাড্ডা", "north badda": "উত্তর বাড্ডা",
    "banani": "বনানী",
    "farmgate": "ফার্মগেট",
    "airport": "বিমানবন্দর",
    "hazrat shahjalal": "বিমানবন্দর", "shahjalal": "বিমানবন্দর",
    "এয়ারপোর্ট": "বিমানবন্দর", "air port": "বিমানবন্দর",
    "bangla motor": "বাংলা মোটর",
    "jamuna future park": "যমুনা ফিউচার পার্ক", "jamuna": "যমুনা ফিউচার পার্ক",

    // Additional common stops
    "katabon": "কাটাবন",
    "bbms": "বাংলা ব্যাংক মোড়", "bangla bank": "বাংলাদেশ ব্যাংক",
    "shyamoli": "শ্যামলী",
    "ashulia": "আশুলিয়া",
    "hemayetpur": "হেমায়েতপুর",
    "gabtoli bus": "গাবতলী",

    // EPZ area
    "epz": "ইপিজেড",
    "epz bd": "ইপিজেড",

    // Remaining fare chart stops (no direct match in bus collection)
    "ekuria": "ইকুরিয়া",
    "icb chotur": "ইসিবি চতুর",
    "eastern housing": "ইস্টার্ন হাউজিং",
    "khamar bari": "খামারবাড়ী",
    "chanchakurpol": "চানখারপুল",
    "jashimuddin": "জসিমউদ্দিন",
    "tikatuli": "টিকাটুলি",
    "diyabari": "দিয়াবাড়ী",
    "dhour": "ধউর",
    "notredame": "নটরডেম কলেজ",
    "narayanganj": "নারায়ণগঞ্জ",
    "priyangon": "প্রিয়াঙন গেট",
    "bangabandhu college": "বঙ্গবন্ধু কলেজ",
    "bonosri": "বনশ্রী(মেরাদিয়া)",
    "meradia": "মেরাদিয়া বাজার",
    "master plaza": "মাষ্ট প্লাজা",
    "zillur rahman flyover": "মোঃ জিল্লুর রহমান ফ্লাইওভার",
    "rashel square": "রাসেল স্কয়ার",
    "japan garden": "জাপান গার্ডেন সিটি",
    "gazipur": "গাজীপুর চৌরাস্তা",
    "tongi": "টঙ্গী",
    "demra": "ডেমরা",
    "savar": "সাভার",
    "ashulia": "আশুলিয়া",
    "gabtoli": "গাবতলী",
};

// Enhanced fuzzy match with bilingual support (MUST be before getBusesByRoute)
const matchStop = async (input, allStops) => {
    if (!input) return null;
    
    const query = input.toLowerCase().trim();
    
    // Step 1: Exact match in Bengali
    let exact = allStops.find(s => s === input);
    if (exact) return exact;
    
    // Step 2: Check English aliases (exact match)
    if (stopAliases[query]) {
        const bn = stopAliases[query];
        // Return if in bus stops OR if it's a fare chart stop
        if (allStops.includes(bn)) return bn;
        // Check if it exists in fare chart even if not in bus stops
        const fareStop = await RouteFare.distinct('from', { from: bn });
        if (fareStop.length > 0) return bn;
        const fareStopTo = await RouteFare.distinct('to', { to: bn });
        if (fareStopTo.length > 0) return bn;
    }
    
    // Step 3: Case-insensitive Bengali exact match
    exact = allStops.find(s => s.toLowerCase() === query);
    if (exact) return exact;
    
    // Step 4: Bengali substring match (input contains stop)
    if (query.length >= 3) {
        let partial = allStops.find(s => s.includes(input) && input.length >= 2);
        if (partial) return partial;
        
        // Substring match (stop contains input)
        partial = allStops.find(s => input.includes(s) && s.length >= 2);
        if (partial) return partial;
    }
    
    // Step 5: Check if any alias contains the query
    for (const [alias, bn] of Object.entries(stopAliases)) {
        if (alias.includes(query) && query.length >= 2) {
            if (allStops.includes(bn)) return bn;
        }
    }
    
    // Step 6: Check if query is contained in any alias
    for (const [alias, bn] of Object.entries(stopAliases)) {
        if (query.includes(alias) && alias.length >= 3) {
            if (allStops.includes(bn)) return bn;
        }
    }
    
    return null;
};

exports.getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBusesByRoute = async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        return res.status(400).json({ message: 'From and To stops are required' });
    }

    try {
        // --- Fuzzy Match: find actual DB stop names ---
        const allStops = await Bus.distinct('stops');
        
        // Use the enhanced bilingual matchStop function
        const fromDb = await matchStop(from, allStops);
        const toDb = await matchStop(to, allStops);

        // Validate stop matches - return clear error if not found
        // Allow fare chart stops even if not in bus collection
        if (!fromDb && !toDb) {
            return res.status(404).json({ 
                message: `"${from}" এবং "${to}" কোনোটিতেই পাওয়া যায়নি। অনুগ্রহ করে তুল্যান্ত শব্দ ব্যবহার করুন।`,
                validStops: allStops.slice(0, 20)
            });
        }
        
        if (!fromDb) {
            return res.status(404).json({ 
                message: `"${from}" কোনোটিতেই পাওয়া যায়নি। অনুগ্রহ করে তুল্যান্ত শব্দ ব্যবহার করুন।`,
                validStops: allStops.slice(0, 20)
            });
        }
        
        if (!toDb) {
            return res.status(404).json({ 
                message: `"${to}" কোনোটিতেই পাওয়া যায়নি। অনুগ্রহ করে তুল্যান্ত শব্দ ব্যবহার করুন।`,
                validStops: allStops.slice(0, 20)
            });
        }

        // Direct Routes
        // For fare chart stops (not in bus collection), use regex search
        const isFromInBus = allStops.includes(fromDb);
        const isToInBus = allStops.includes(toDb);
        
        let directBuses;
        if (isFromInBus && isToInBus) {
            directBuses = await Bus.find({
                stops: { $all: [fromDb, toDb] }
            });
        } else if (isFromInBus && !isToInBus) {
            directBuses = await Bus.find({
                $and: [{ stops: fromDb }, { stops: { $regex: escapeRegex(toDb), $options: 'i' } }]
            });
        } else if (!isFromInBus && isToInBus) {
            directBuses = await Bus.find({
                $and: [{ stops: toDb }, { stops: { $regex: escapeRegex(fromDb), $options: 'i' } }]
            });
        } else {
            // Both are fare chart stops - this won't find direct buses
            directBuses = [];
        }

        // Build direct results with async fare lookup
        const directResults = (await Promise.all(directBuses.map(async (bus) => {
            try {
                const fromStop = fromDb || bus.stops.find(s => s.includes(from) || from.includes(s));
                const toStop = toDb || bus.stops.find(s => s.includes(to) || to.includes(s));
                const fi = bus.stops.indexOf(fromStop);
                const ti = bus.stops.indexOf(toStop);
                if (fi < 0 || ti < 0) return null;
                const kmPerStop = bus.distanceKm ? bus.distanceKm / (bus.stops.length - 1) : STOP_KM;
                const dist = Math.abs(ti - fi) * kmPerStop;
                const fare = await getRouteFare(bus.routeNumber, fromDb || fromStop, toDb || toStop, dist, bus.type);
                return {
                    ...bus.toObject(),
                    dist,
                    fare,
                    type: 'direct',
                    routeStart: bus.stops[0],
                    routeEnd: bus.stops[bus.stops.length - 1]
                };
            } catch (e) {
                return null;
            }
        }))).filter(Boolean);

        // Transfer Routes (Simple 1-stop transfer) - only if fewer than 3 direct
        let transferResults = [];
        if (directResults.length < 3) {
            const fromQuery = fromDb ? { stops: fromDb } : { stops: { $regex: escapeRegex(from), $options: 'i' } };
            const toQuery = toDb ? { stops: toDb } : { stops: { $regex: escapeRegex(to), $options: 'i' } };
            const fromBuses = await Bus.find(fromQuery);
            const toBuses = await Bus.find(toQuery);

            for (const b1 of fromBuses) {
                for (const b2 of toBuses) {
                    if (b1._id.toString() === b2._id.toString()) continue;

                    const common = b1.stops.filter(s => b2.stops.includes(s) && s !== (fromDb || from) && s !== (toDb || to));
                    if (common.length > 0) {
                        const mid = common[0];
                        const b1KmPerStop = b1.distanceKm ? b1.distanceKm / (b1.stops.length - 1) : STOP_KM;
                        const d1 = Math.abs(b1.stops.indexOf(mid) - b1.stops.indexOf(fromDb || from)) * b1KmPerStop;
                        const b2KmPerStop = b2.distanceKm ? b2.distanceKm / (b2.stops.length - 1) : STOP_KM;
                        const d2 = Math.abs(b2.stops.indexOf(toDb || to) - b2.stops.indexOf(mid)) * b2KmPerStop;
                        
                        const fare1 = await getRouteFare(b1.routeNumber, fromDb || from, mid, d1, b1.type);
                        const fare2 = await getRouteFare(b2.routeNumber, mid, toDb || to, d2, b2.type);

                        transferResults.push({
                            type: 'transfer',
                            totalDist: d1 + d2,
                            totalFare: fare1 + fare2,
                            legs: [
                                { bus: b1.name, from: fromDb || from, to: mid, dist: d1, fare: fare1, routeStart: b1.stops[0], routeEnd: b1.stops[b1.stops.length-1] },
                                { bus: b2.name, from: mid, to: toDb || to, dist: d2, fare: fare2, routeStart: b2.stops[0], routeEnd: b2.stops[b2.stops.length-1] }
                            ]
                        });
                    }
                }
            }
        }

        res.json({
            direct: directResults.sort((a,b) => a.dist - b.dist),
            transfers: transferResults.sort((a,b) => a.totalDist - b.totalDist).slice(0, 5)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Export stops with aliases for frontend
exports.getStopsWithAliases = async (req, res) => {
    try {
        const allStops = await Bus.distinct('stops');
        
        // Build unique list with aliases
        const stopsWithAliases = [];
        const seen = new Set();
        
        // Add original Bengali stops first
        for (const stop of allStops) {
            if (!seen.has(stop)) {
                seen.add(stop);
                // Find English aliases for this stop
                const aliases = [];
                for (const [alias, bn] of Object.entries(stopAliases)) {
                    if (bn === stop) {
                        aliases.push(alias.charAt(0).toUpperCase() + alias.slice(1));
                    }
                }
                stopsWithAliases.push({
                    bn: stop,
                    en: aliases.length > 0 ? aliases[0] : null,
                    aliases: aliases
                });
            }
        }
        
        // Sort by Bengali
        stopsWithAliases.sort((a, b) => a.bn.localeCompare(b.bn, 'bn'));
        
        res.json(stopsWithAliases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Simple getStops for backward compatibility
exports.getStops = async (req, res) => {
    try {
        const stops = await Bus.distinct('stops');
        stops.sort((a,b) => a.localeCompare(b, 'bn'));
        res.json(stops);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MULTIMODAL: Bus + Metro + Bus Journey Planner
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Full stop-to-metro index mapping (0-15 matching MRT array by km-sorted order)
const stopToMetro = {
    // Index 0: উত্তরা উত্তর (km:0)
    "উত্তরা উত্তর": 0, "দিয়াবাড়ি": 0, "দিয়াবাড়ী": 0, "হাউস বিল্ডিং": 0, "আজমপুর": 0, "রাজলক্ষ্মী": 0,

    // Index 1: উত্তরা সেন্টার (km:1.95)
    "উত্তরা সেন্টার": 1, "উত্তরা": 1, "জসিমউদ্দিন (উত্তরা)": 1,

    // Index 2: উত্তরা দক্ষিণ (km:3.6)
    "উত্তরা দক্ষিণ": 2, "বিমানবন্দর": 2, "এয়ারপোর্ট": 2, "খিলক্ষেত": 2,
    "কুড়িল বিশ্বরোড": 2, "কুড়িল": 2, "বসুন্ধরা": 2, "নদ্দা": 2, "যমুনা ফিউচার পার্ক": 2,
    "কুড়িল চৌরাস্তা": 2, "হযরত শাহজালাল বিমানবন্দর": 2,

    // Index 3: পল্লবী (km:5.65)
    "পল্লবী": 3, "কালশী": 3, "পুরবী": 3, "ইসিবি চত্বর": 3,

    // Index 4: মিরপুর ১১ (km:7.05)
    "মিরপুর ১১": 4, "মিরপুর ১২": 4, "মিরপুর ১৪": 4,

    // Index 5: মিরপুর ১০ (km:8.35)
    "মিরপুর ১০": 5, "মিরপুর ২": 5, "সনি সিনেমা হল": 5,

    // Index 6: কাজীপাড়া (km:9.7)
    "কাজীপাড়া": 6, "মিরপুর ১": 6, "আনসার ক্যাম্প": 6,

    // Index 7: শেওড়াপাড়া (km:10.85)
    "শেওড়াপাড়া": 7, "শেওড়া": 7, "এমইএস": 7, "স্টাফ রোড": 7, "কাকলী": 7,
    "টেকনিক্যাল": 7, "বাংলা কলেজ": 7, "দারুসসালাম": 7,

    // Index 8: আগারগাঁও (km:12.05)
    "আগারগাঁও": 8, "শিশু মেলা": 8,

    // Index 9: বিজয় সরণি (km:13.45)
    "বিজয় সরণি": 9, "জাহাঙ্গীর গেট": 9, "মহাখালী": 9,
    "চেয়ারম্যান বাড়ি": 9, "বনানী": 9, "সৈনিক ক্লাব": 9, "গুলশান ১": 9, "গুলশান ২": 9, "গুলশান": 9,

    // Index 10: ফার্মগেট (km:14.55)
    "ফার্মগেট": 10, "খামার বাড়ি": 10, "পান্থপথ": 10, "তেজগাঁও": 10,
    "শ্যামলী": 10, "কল্যাণপুর": 10, "আসাদ গেট": 10, "মোহাম্মদপুর": 10, "শংকর": 10,
    "গাবতলী": 10, "আমিন বাজার": 10, "সাভার": 10, "হেমায়েতপুর": 10, "চন্দ্রা": 10,
    "আশুলিয়া": 10, "টঙ্গী": 10, "গাজীপুর": 10, "গাজীপুর চৌরাস্তা": 10,
    "আব্দুল্লাহপুর": 10, "নন্দন পার্ক": 10, "মোহাম্মদপুর বাসস্ট্যান্ড": 10,
    "জিগাতলা": 10, "ধানমন্ডি ১৫": 10,

    // Index 11: কারওয়ান বাজার (km:15.75)
    "কারওয়ান বাজার": 11, "বাটা সিগন্যাল": 11,

    // Index 12: শাহবাগ (km:16.9)
    "শাহবাগ": 12, "কাটাবন": 12, "সায়েন্স ল্যাব": 12, "নিউ মার্কেট": 12, "নীলক্ষেত": 12,
    "সিটি কলেজ": 12, "আজিমপুর": 12, "কলাবাগান": 12, "ধানমন্ডি ৩২": 12, "ধানমন্ডি ২৭": 12,
    "ধানমন্ডি": 12, "বাংলামটর": 12, "বাংলা মোটর": 12,

    // Index 13: ঢাকা বিশ্ববিদ্যালয় (km:17.75)
    "মৎস্য ভবন": 13, "হাইকোর্ট": 13,

    // Index 14: বাংলাদেশ সচিবালয় (km:18.85)
    "কাকরাইল": 14, "প্রেস ক্লাব": 14, "পল্টন": 14, "দৈনিক বাংলা মোড়": 14,
    "শান্তিনগর": 14, "মগবাজার": 14, "মৌচাক": 14,

    // Index 15: মতিঝিল (km:19.72)
    "মতিঝিল": 15, "আরামবাগ": 15, "কমলাপুর": 15, "মুগদাপাড়া": 15, "বাসাবো": 15,
    "খিলগাঁও": 15, "মালিবাগ": 15, "রামপুরা": 15, "রামপুরা ব্রিজ": 15, "রামপুরা বাজার": 15,
    "মেরুল": 15, "বাড্ডা": 15, "শাহজাদপুর": 15, "উত্তর বাড্ডা": 15, "নতুন বাজার": 15,
    "মধ্য বাড্ডা": 15, "বনশ্রী": 15, "মালিবাগ রেলগেট": 15, "মালিবাগ মোড়": 15,
    "হাজীপাড়া": 15, "বাড্ডা লিঙ্ক রোড": 15, "গুলিস্তান": 15, "সদরঘাট": 15, "বাবুবাজার": 15,
    "জিপিও": 15, "পোস্তগোলা": 15, "ধোলাইপাড়": 15, "সায়েদাবাদ": 15, "যাত্রাবাড়ী": 15,
    "যাত্রাবাড়ি": 15, "ডেমরা": 15, "মাতুয়াইল": 15, "নারায়ণগঞ্জ": 15, "শ্যামপুর": 15,
    "কদমতলী": 15, "কেরানীগঞ্জ": 15, "কামরাঙ্গীরচর": 15, "জনপথ মোড়": 15,
};;

// Reverse mapping: MRT index â†’ nearby bus stops
const metroStopsNearby = {
    0:  ["উত্তরা উত্তর", "দিয়াবাড়ি", "দিয়াবাড়ী", "হাউস বিল্ডিং", "আজমপুর", "রাজলক্ষ্মী"],
    1:  ["উত্তরা", "জসিমউদ্দিন (উত্তরা)", "উত্তরা সেন্টার"],
    2:  ["বিমানবন্দর", "এয়ারপোর্ট", "খিলক্ষেত", "কুড়িল বিশ্বরোড", "বসুন্ধরা", "নদ্দা", "যমুনা ফিউচার পার্ক", "কুড়িল"],
    3:  ["পল্লবী", "কালশী", "পুরবী", "ইসিবি চত্বর"],
    4:  ["মিরপুর ১১", "মিরপুর ১২", "মিরপুর ১৪"],
    5:  ["মিরপুর ১০", "মিরপুর ২", "সনি সিনেমা হল"],
    6:  ["কাজীপাড়া", "মিরপুর ১", "আনসার ক্যাম্প"],
    7:  ["শেওড়াপাড়া", "শেওড়া", "এমইএস", "স্টাফ রোড", "কাকলী", "টেকনিক্যাল"],
    8:  ["আগারগাঁও", "শিশু মেলা"],
    9:  ["বিজয় সরণি", "জাহাঙ্গীর গেট", "মহাখালী", "বনানী", "গুলশান ১", "গুলশান ২"],
    10: ["ফার্মগেট", "খামার বাড়ি", "শ্যামলী", "কল্যাণপুর", "আসাদ গেট", "মোহাম্মদপুর", "গাবতলী", "সাভার", "টঙ্গী", "গাজীপুর"],
    11: ["কারওয়ান বাজার", "বাটা সিগন্যাল"],
    12: ["শাহবাগ", "সায়েন্স ল্যাব", "নিউ মার্কেট", "নীলক্ষেত", "কলাবাগান", "ধানমন্ডি ৩২", "ধানমন্ডি ২৭", "বাংলামটর"],
    13: ["মৎস্য ভবন", "হাইকোর্ট"],
    14: ["কাকরাইল", "প্রেস ক্লাব", "পল্টন", "শান্তিনগর", "মগবাজার", "মৌচাক"],
    15: ["মতিঝিল", "কমলাপুর", "গুলিস্তান", "সায়েদাবাদ", "যাত্রাবাড়ী", "রামপুরা", "বাড্ডা", "মালিবাগ", "খিলগাঁও", "বাসাবো"],
};;

// Fuzzy getNearestMetro â€” 5-step match with English support
function getNearestMetro(stop) {
    if (!stop) return null;
    
    // Step 0: Check if stop is an English alias, convert to Bengali first
    const query = stop.toLowerCase().trim();
    if (stopAliases[query]) {
        stop = stopAliases[query];
    }
    
    // Step 1: Exact match in Bengali
    if (stopToMetro[stop] !== undefined) {
        return { idx: stopToMetro[stop] };
    }
    // Step 2: stop includes key (Bengali)
    for (const [key, idx] of Object.entries(stopToMetro)) {
        if (stop.includes(key) && key.length >= 3) return { idx };
    }
    // Step 3: key includes stop (Bengali)
    for (const [key, idx] of Object.entries(stopToMetro)) {
        if (key.includes(stop) && stop.length >= 3) return { idx };
    }
    // Step 4: check metroStopsNearby (Bengali)
    for (let i = 0; i < 16; i++) {
        const nearby = metroStopsNearby[i] || [];
        for (const ns of nearby) {
            if (stop === ns || stop.includes(ns) || ns.includes(stop)) {
                return { idx: i };
            }
        }
    }
    // Step 5: Check if any English alias maps to a metro-connected stop
    for (const [alias, bn] of Object.entries(stopAliases)) {
        if (alias.includes(query) || query.includes(alias)) {
            for (const [key, idx] of Object.entries(stopToMetro)) {
                if (key === bn || bn.includes(key)) {
                    return { idx };
                }
            }
        }
    }
    return null;
}

// Get buses connecting a stop to the nearest metro hub
async function getBusesToFromStop(stop, metroIdx, direction) {
    const nearby = metroStopsNearby[metroIdx] || [];
    if (!stop || nearby.length === 0) return [];

    const results = [];

    // Get ALL buses - search with partial stop name
    const stopPattern = stop.slice(0, Math.min(stop.length, 4));
    const allBuses = await Bus.find({ 
        stops: { $regex: stopPattern }
    });

    for (const b of allBuses) {
        // Step A: Find stop index with robust matching
        let stopIdx = -1;
        
        // Exact match
        stopIdx = b.stops.indexOf(stop);
        
        // Bengali substring match
        if (stopIdx < 0) {
            stopIdx = b.stops.findIndex(s => 
                s === stop ||
                (s.includes(stop) && stop.length >= 2) ||
                (stop.includes(s) && s.length >= 2)
            );
        }
        
        if (stopIdx < 0) continue;

        // Step B: Find nearest metro hub stop on this bus
        let bestNearbyIdx = -1;
        let bestNearbyName = '';
        
        for (let i = 0; i < b.stops.length; i++) {
            const busStop = b.stops[i];
            for (const ns of nearby) {
                const isMatch = 
                    busStop === ns ||
                    (busStop.includes(ns) && ns.length >= 2) ||
                    (ns.includes(busStop) && busStop.length >= 2);
                
                if (isMatch) {
                    if (bestNearbyIdx === -1 || Math.abs(i - stopIdx) < Math.abs(bestNearbyIdx - stopIdx)) {
                        bestNearbyIdx = i;
                        bestNearbyName = busStop;
                    }
                }
            }
        }

        if (bestNearbyIdx < 0 || bestNearbyIdx === stopIdx) continue;

        const kmPerStop = b.distanceKm ? b.distanceKm / (b.stops.length - 1) : STOP_KM;
        const dist = Math.abs(bestNearbyIdx - stopIdx) * kmPerStop;
        const fare = await getRouteFare(b.routeNumber, stop, bestNearbyName, dist, b.type);

        // Direction check removed - show all buses
        results.push({
            name: b.name,
            nameEn: b.nameEn,
            routeNumber: b.routeNumber,
            type: b.type,
            ac: b.ac,
            time: b.time,
            dist,
            fare,
            boardAt: direction === 'toMetro' ? stop : bestNearbyName,
            alightAt: direction === 'toMetro' ? bestNearbyName : stop,
        });
    }

    // Deduplicate by name, sort by distance, return top 4
    const seen = new Set();
    return results
        .sort((a, b) => a.dist - b.dist)
        .filter(r => {
            if (seen.has(r.name)) return false;
            seen.add(r.name);
            return true;
        })
        .slice(0, 4);
}

// Metro fare tier
const getMetroFare = (dist) => {
    if (dist <= 2)  return 20;
    if (dist <= 5)  return 30;
    if (dist <= 8)  return 40;
    if (dist <= 10) return 50;
    if (dist <= 12) return 60;
    if (dist <= 15) return 70;
    if (dist <= 17) return 80;
    return 100;
};

const getMetroTime = (dist, stationCount) =>
    Math.round(dist * 2.4 + stationCount * 0.5);

exports.getMultimodalRoute = async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'Missing params' });

    try {
        const allStops = await Bus.distinct('stops');
        
        // Use enhanced bilingual matching
        const fromDb = await matchStop(from, allStops);
        const toDb = await matchStop(to, allStops);
        
        // Step 1: Find nearest metro stations (use matched Bengali names)
        const fromMetro = getNearestMetro(fromDb || from);
        const toMetro = getNearestMetro(toDb || to);

        if (!fromMetro || !toMetro) {
            return res.json({ found: false, message: `${!fromMetro ? from : to}-এর কাছে মেট্রো স্টেশন পাওয়া যায়নি` });
        }

        const metroStations = await MetroStation.find().sort({ km: 1 });
        if (metroStations.length < 16) {
            return res.json({ found: false, message: 'মেট্রো ডাটা লোড হয়নি' });
        }

        const mi1 = Math.min(fromMetro.idx, toMetro.idx);
        const mi2 = Math.max(fromMetro.idx, toMetro.idx);
        const sameStation = fromMetro.idx === toMetro.idx;

        if (fromMetro.idx >= metroStations.length || toMetro.idx >= metroStations.length) {
            return res.status(500).json({ message: 'Metro station index out of range' });
        }

        const m1 = metroStations[fromMetro.idx];
        const m2 = metroStations[toMetro.idx];

        const metroFareVal = sameStation ? 0 : getMetroFare(Math.abs(m2.km - m1.km));
        const metroTimeVal = sameStation ? 0 : getMetroTime(Math.abs(m2.km - m1.km), Math.abs(toMetro.idx - fromMetro.idx));
        const metroDistVal = sameStation ? 0 : Math.abs(m2.km - m1.km);

        // Directional metro stations
        const boardIdx = fromMetro.idx <= toMetro.idx ? fromMetro.idx : toMetro.idx;
        const exitIdx = fromMetro.idx <= toMetro.idx ? toMetro.idx : fromMetro.idx;

        // Use Bengali names for bus matching
        const fromBn = fromDb || from;
        const toBn = toDb || to;

        // Step 3: Find connecting buses (using Bengali names)
        const bus1Options = await getBusesToFromStop(fromBn, fromMetro.idx, 'toMetro');
        const bus2Options = await getBusesToFromStop(toBn, toMetro.idx, 'fromMetro');

        // Step 4: Calculate totals using best bus options
        const bus1Fare = bus1Options.length > 0 ? bus1Options[0].fare : 0;
        const bus2Fare = bus2Options.length > 0 ? bus2Options[0].fare : 0;
        const bus1Time = bus1Options.length > 0 ? Math.round(bus1Options[0].dist / 15 * 60) : 5;
        const bus2Time = bus2Options.length > 0 ? Math.round(bus2Options[0].dist / 15 * 60) : 5;

        const totalFare = bus1Fare + metroFareVal + bus2Fare;
        const totalTime = bus1Time + metroTimeVal + bus2Time;

        // Mid stations for display
        const midStations = sameStation ? [] : metroStations.slice(mi1 + 1, mi2);

        // Build steps array for frontend (as per Planner.txt spec)
        // Use the matched Bengali names for display
        const displayFrom = fromDb || from;
        const displayTo = toDb || to;
        const steps = [];
        
        // Step 1: Bus to Metro station
        if (bus1Options.length > 0) {
            steps.push({
                type: 'bus',
                bus: bus1Options[0].name,
                from: displayFrom,
                to: bus1Options[0].alightAt,
                dist: bus1Options[0].dist,
                fare: bus1Options[0].fare,
                time: bus1Time,
            });
        }
        
        // Step 2: Metro ride
        if (!sameStation) {
            steps.push({
                type: 'metro',
                from: boardIdx,
                to: exitIdx,
                fromName: metroStations[boardIdx].name,
                toName: metroStations[exitIdx].name,
                dist: metroDistVal,
                fare: metroFareVal,
                time: metroTimeVal,
                midStations: midStations.map(s => s.name),
            });
        }
        
        // Step 3: Bus from Metro to destination
        if (bus2Options.length > 0) {
            steps.push({
                type: 'bus',
                bus: bus2Options[0].name,
                from: bus2Options[0].boardAt,
                to: displayTo,
                dist: bus2Options[0].dist,
                fare: bus2Options[0].fare,
                time: bus2Time,
            });
        }

        res.json({
            found: true,
            sameStation,
            from: displayFrom,
            to: displayTo,
            fromMetro: { idx: fromMetro.idx, station: m1.name, en: m1.en },
            toMetro: { idx: toMetro.idx, station: m2.name, en: m2.en },
            boardStation: { idx: boardIdx, station: metroStations[boardIdx].name, en: metroStations[boardIdx].en },
            exitStation: { idx: exitIdx, station: metroStations[exitIdx].name, en: metroStations[exitIdx].en },
            bus1Options,
            bus2Options,
            metroFare: metroFareVal,
            metroTime: metroTimeVal,
            metroDist: metroDistVal,
            midStations: midStations.map(s => ({ name: s.name, en: s.en })),
            totalFare,
            totalTime,
            bus1Fare,
            bus2Fare,
            steps,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
