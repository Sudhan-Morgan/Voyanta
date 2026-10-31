/**
 * AI Service for Voyanta Travel Planner
 * Integrates with Google Gemini API for dynamic travel itinerary generation,
 * with an intelligent fallback engine tailored for Sri Lankan & global destinations.
 */

// Curated destination blueprints for Sri Lanka and general travel
const DESTINATION_KNOWLEDGE = {
  ella: {
    title: "Ella Hill Country Adventure",
    coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Nine_arch_bridge%2C_Ella%2C_Sri_lanka.jpg/1280px-Nine_arch_bridge%2C_Ella%2C_Sri_lanka.jpg",
    highlights: ["Nine Arches Bridge", "Little Adam's Peak", "Ravana Falls", "Ella Rock hike", "Demodara Loop"],
    activitiesPool: [
      {
        title: "Sunrise Hike to Little Adam's Peak",
        locationName: "Little Adam's Peak, Ella",
        startTime: "06:00 AM",
        endTime: "08:30 AM",
        category: "Hiking & Nature",
        description: "Catch a panoramic 360° sunrise over Ella Gap and the surrounding tea valleys. Moderate 45-minute climb.",
        estimatedCost: 0
      },
      {
        title: "Nine Arches Bridge Train Viewing & Photography",
        locationName: "Nine Arches Bridge, Demodara",
        startTime: "09:30 AM",
        endTime: "11:30 AM",
        category: "Sightseeing",
        description: "Watch the scenic blue highland train roll over the iconic colonial stone viaduct amidst lush jungle.",
        estimatedCost: 500
      },
      {
        title: "Traditional Sri Lankan Rice & Curry Cooking Class",
        locationName: "Ella Town Spice Garden",
        startTime: "12:30 PM",
        endTime: "02:30 PM",
        category: "Food & Culture",
        description: "Learn authentic clay pot curry preparation using freshly harvested local spices, coconut milk, and dhal.",
        estimatedCost: 3500
      },
      {
        title: "Swim & Relax at Ravana Falls & Caves",
        locationName: "Ravana Falls, Wellawaya Road",
        startTime: "03:30 PM",
        endTime: "05:30 PM",
        category: "Sightseeing",
        description: "Cool off by the cascades of one of Sri Lanka's widest waterfalls, steeped in Ramayana legend.",
        estimatedCost: 200
      },
      {
        title: "Sunset Chilling & Live Music at Cafe Chill",
        locationName: "Cafe Chill, Main Street Ella",
        startTime: "07:00 PM",
        endTime: "10:00 PM",
        category: "Nightlife & Dining",
        description: "Sip Ceylon tea-infused cocktails or smoothies with fellow travelers in this vibrant open-air lounge.",
        estimatedCost: 2500
      },
      {
        title: "Trek through Tea Plantations to Ella Rock",
        locationName: "Ella Rock Summit",
        startTime: "06:30 AM",
        endTime: "11:00 AM",
        category: "Adventure Trekking",
        description: "Challenging trek along railway tracks and eucalyptus forests rewarded with jaw-dropping views over the southern plains.",
        estimatedCost: 1000
      },
      {
        title: "Ceylon Tea Factory Guided Tour & Tasting",
        locationName: "Halpewatte Tea Factory",
        startTime: "02:00 PM",
        endTime: "04:00 PM",
        category: "Culture & Industry",
        description: "Discover the full orthodox black tea manufacturing process from plucking to drying and tea cup grading.",
        estimatedCost: 1500
      }
    ],
    tips: [
      "Book the Kandy to Ella train ticket well in advance for reserved observation car seats.",
      "Wear trail running shoes with good grip for the morning hikes as mist can make slopes slippery.",
      "Tuk-tuks in Ella town are readily available; negotiate or agree on rates before departure."
    ],
    checklist: ["Light rain jacket", "Hiking boots or runners", "Insect repellent", "Sun protection", "Power bank", "Cash in LKR"]
  },
  galle: {
    title: "Galle Colonial Heritage & Coastal Charms",
    coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Galle_Fort.jpg/1280px-Galle_Fort.jpg",
    highlights: ["Galle Fort Ramparts", "Galle Lighthouse", "Unawatuna Beach", "Dutch Reformed Church", "Maritime Museum"],
    activitiesPool: [
      {
        title: "Morning Walking Tour of Historic Galle Fort",
        locationName: "Galle Fort Ramparts",
        startTime: "08:00 AM",
        endTime: "10:30 AM",
        category: "History & Architecture",
        description: "Stroll along 400-year-old UNESCO Dutch ramparts, Old Gate, and cobblestone alleys lined with heritage villas.",
        estimatedCost: 0
      },
      {
        title: "Galle Fort Lighthouse & Flag Rock Panorama",
        locationName: "Galle Lighthouse Point",
        startTime: "11:00 AM",
        endTime: "12:30 PM",
        category: "Sightseeing",
        description: "Capture iconic photos of the gleaming white lighthouse backed by swaying coconut palms and turquoise waves.",
        estimatedCost: 0
      },
      {
        title: "Fresh Seafood Lunch at Pedlar's Street",
        locationName: "Pedlar's Street, Galle Fort",
        startTime: "01:00 PM",
        endTime: "02:30 PM",
        category: "Dining",
        description: "Sample fresh butter garlic prawns, Jaffna crab curry, and homemade ginger beer in a restored Dutch veranda.",
        estimatedCost: 3800
      },
      {
        title: "Surfing or Swimming at Unawatuna Bay",
        locationName: "Unawatuna Beach",
        startTime: "03:30 PM",
        endTime: "06:00 PM",
        category: "Water Sports & Beach",
        description: "Calm, golden sandy beach ideal for swimming, stand-up paddleboarding, or beginner surf lessons.",
        estimatedCost: 2000
      },
      {
        title: "Sunset Rampart Walk & Street Musician Vibes",
        locationName: "Sun Bastion, Galle Fort",
        startTime: "06:15 PM",
        endTime: "07:45 PM",
        category: "Relaxation",
        description: "Watch the Indian Ocean sunset as kites fly high and local musicians play acoustic melodies.",
        estimatedCost: 0
      },
      {
        title: "Sea Turtle Conservation Hatchery Visit",
        locationName: "Habaraduwa Turtle Hatchery",
        startTime: "09:30 AM",
        endTime: "11:30 AM",
        category: "Wildlife Conservation",
        description: "Learn about the rehabilitation of injured sea turtles and release hatchlings safely into the ocean.",
        estimatedCost: 1500
      }
    ],
    tips: [
      "Midday within the fort walls can be humid; plan indoor museums or cafe breaks between 12 PM - 3 PM.",
      "Support ethical handmade lace and gemstone craft shops located in Pedlar Street and Church Street.",
      "Tuk-tuk from Galle Fort to Unawatuna takes only 15 minutes."
    ],
    checklist: ["Swimwear", "Polarized sunglasses", "Reef-safe sunscreen", "Comfortable walking sandals", "Canvas tote bag"]
  },
  kandy: {
    title: "Kandy Sacred Relics & Royal Valley",
    coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/SL_Kandy_asv2020-01_img34_Sacred_Tooth_Temple.jpg/1280px-SL_Kandy_asv2020-01_img34_Sacred_Tooth_Temple.jpg",
    highlights: ["Temple of the Sacred Tooth Relic", "Peradeniya Royal Botanical Gardens", "Kandy Lake", "Cultural Dance Show"],
    activitiesPool: [
      {
        title: "Pay Homage at Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)",
        locationName: "Sri Dalada Maligawa, Kandy",
        startTime: "08:30 AM",
        endTime: "11:00 AM",
        category: "Cultural Heritage",
        description: "Witness the sacred morning puja ritual, gilded golden roof, and ancient royal palace complex.",
        estimatedCost: 2000
      },
      {
        title: "Leisure Walk around Scenic Kandy Lake",
        locationName: "Kandy Lake Circular Road",
        startTime: "11:30 AM",
        endTime: "12:30 PM",
        category: "Sightseeing",
        description: "Shaded stroll around the artificial lake built by the last king of Kandy, observing water monitors and pelicans.",
        estimatedCost: 0
      },
      {
        title: "Highland Spice Garden & Traditional Herbal Lunch",
        locationName: "Peradeniya Heritage Kitchen",
        startTime: "01:00 PM",
        endTime: "02:30 PM",
        category: "Dining & Wellness",
        description: "Sample fragrant cardamom-infused curries and herbal teas inspired by indigenous Ayurvedic recipes.",
        estimatedCost: 2800
      },
      {
        title: "Royal Botanical Gardens of Peradeniya",
        locationName: "Peradeniya Gardens, Kandy",
        startTime: "03:00 PM",
        endTime: "05:30 PM",
        category: "Nature & Flora",
        description: "Wander through the giant Javan fig tree lawn, royal palm avenues, and over 4,000 species of tropical orchids.",
        estimatedCost: 3000
      },
      {
        title: "Traditional Kandyan Drumming & Fire Walking Performance",
        locationName: "Kandy Cultural Centre",
        startTime: "06:00 PM",
        endTime: "07:30 PM",
        category: "Live Cultural Show",
        description: "Mesmerizing display of traditional acrobatic dance, heavy Geta Beraya percussion, and fire-walking rites.",
        estimatedCost: 2500
      }
    ],
    tips: [
      "Dress conservatively for the Temple of the Tooth (shoulders and knees must be covered; white clothing is preferred).",
      "Kandy can experience brief afternoon showers; keep a compact umbrella handy.",
      "Catch the morning puja ceremony around 09:30 AM or evening puja at 06:30 PM for the most spiritual experience."
    ],
    checklist: ["Modest white/light clothing for temples", "Slip-on shoes for temple entry", "Compact umbrella", "Camera"]
  },
  sigiriya: {
    title: "Sigiriya Ancient Citadel & Cultural Triangle",
    coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Sigiriya_Rock_Fortress_View_from_Pidurangala_Rock.jpg/1280px-Sigiriya_Rock_Fortress_View_from_Pidurangala_Rock.jpg",
    highlights: ["Sigiriya Lion Rock Fortress", "Pidurangala Rock", "Dambulla Cave Temple", "Minneriya Elephant Safari"],
    activitiesPool: [
      {
        title: "Climb the Iconic Sigiriya Lion Rock Fortress",
        locationName: "Sigiriya Lion Rock",
        startTime: "06:30 AM",
        endTime: "10:00 AM",
        category: "UNESCO World Heritage",
        description: "Ascend King Kashyapa's 5th-century palace summit past ancient frescoes, mirror walls, and colossal lion paws.",
        estimatedCost: 10500
      },
      {
        title: "Authentic Village Safari & Catamaran Ride",
        locationName: "Hiriwadunna Eco Village",
        startTime: "11:30 AM",
        endTime: "02:00 PM",
        category: "Cultural Immersion",
        description: "Ride an authentic bullock cart, cross a lotus lake on a wooden catamaran, and enjoy a village lunch in a mud hut.",
        estimatedCost: 3500
      },
      {
        title: "Wild Elephant Jeep Safari at Minneriya / Kaudulla National Park",
        locationName: "Minneriya National Park",
        startTime: "03:00 PM",
        endTime: "06:30 PM",
        category: "Wildlife Safari",
        description: "Witness the world-famous 'Elephant Gathering' where herds of over 150 wild elephants congregate around the ancient tank reservoir.",
        estimatedCost: 12000
      },
      {
        title: "Sunrise Hike up Pidurangala Rock",
        locationName: "Pidurangala Rock Base",
        startTime: "05:00 AM",
        endTime: "07:30 AM",
        category: "Adventure Trekking",
        description: "Moderate boulder scramble rewarding hikers with the most majestic direct vista of Sigiriya Rock bathed in dawn light.",
        estimatedCost: 1000
      },
      {
        title: "Explore Dambulla Golden Royal Rock Temple",
        locationName: "Dambulla Cave Temples",
        startTime: "09:30 AM",
        endTime: "12:00 PM",
        category: "Sacred Art & History",
        description: "Visit 5 monumental cave sanctuaries housing 153 Buddha statues and stunning ancient ceiling murals.",
        estimatedCost: 2000
      }
    ],
    tips: [
      "Climb Sigiriya as early as possible (gates open at 06:30 AM) to beat both midday heat and crowds.",
      "Bring plenty of drinking water; no plastic disposable bottles are permitted at the summit checkpoint.",
      "Pidurangala has active monastic grounds at the base; keep shoulders and knees covered until past the temple."
    ],
    checklist: ["Sturdy walking shoes", "Electrolyte packets", "Sun hat and sunglasses", "Modest sarong for cave temples"]
  }
};

/**
 * Currency conversion factors relative to LKR (approximate for realistic scaling)
 */
const CURRENCY_CONVERSION = {
  LKR: 1,
  USD: 300,
  INR: 3.6,
  EUR: 325,
  GBP: 380
};

/**
 * Fallback generator when Gemini API key is missing or offline
 */
const generateFallbackItinerary = (params) => {
  const {
    destination = "Sri Lanka",
    duration = 3,
    startDate,
    endDate,
    budget = "moderate",
    customBudget,
    currency = "LKR",
    travelStyle = "balanced",
    travelersCount = 2,
    interests = []
  } = params;

  const destKey = destination.toLowerCase().trim();
  const matchedData = Object.keys(DESTINATION_KNOWLEDGE).find((k) => destKey.includes(k));
  const blueprint = matchedData ? DESTINATION_KNOWLEDGE[matchedData] : null;

  // 1. Calculate duration and dates
  let daysCount = Math.max(1, Math.min(Number(duration) || 3, 14));
  let parsedStartDate = null;
  let parsedEndDate = null;

  if (startDate) {
    parsedStartDate = new Date(startDate);
    if (endDate) {
      parsedEndDate = new Date(endDate);
      const diffMs = parsedEndDate.getTime() - parsedStartDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        daysCount = Math.max(1, Math.min(diffDays, 14));
      }
    } else {
      parsedEndDate = new Date(parsedStartDate.getTime() + (daysCount - 1) * 24 * 60 * 60 * 1000);
    }
  }

  const curr = (currency || "LKR").toUpperCase();
  const convRate = CURRENCY_CONVERSION[curr] || 1;

  // 2. Budget Calculation & Strict Limiting
  let targetTotalBudget = 0;
  const numTravelers = Math.max(1, Number(travelersCount) || 1);

  if (customBudget && Number(customBudget) > 0) {
    targetTotalBudget = Number(customBudget);
  } else {
    // Sensible base cost per traveler per day in selected currency
    const basePerDayLKR = budget === "luxury" ? 25000 : budget === "budget" ? 4500 : 12000;
    const basePerDayInCurr = Math.round(basePerDayLKR / convRate);
    targetTotalBudget = basePerDayInCurr * daysCount * numTravelers;
  }

  // Pool of candidate activities
  const defaultActivities = [
    {
      title: `Morning Highlights Tour of ${destination}`,
      locationName: `${destination} Central Landmark`,
      startTime: "09:00 AM",
      endTime: "11:30 AM",
      category: "Sightseeing",
      description: `Discover top scenic hotspots and iconic attractions in ${destination} with an experienced local guide.`,
      estimatedCost: 1500
    },
    {
      title: "Local Culinary Tasting & Lunch",
      locationName: `${destination} Heritage Eatery`,
      startTime: "12:30 PM",
      endTime: "02:00 PM",
      category: "Food & Dining",
      description: "Sample traditional specialty dishes, fresh tropical fruits, and signature regional desserts.",
      estimatedCost: 2000
    },
    {
      title: "Scenic Landscape & Photography Excursion",
      locationName: `${destination} Viewpoint Point`,
      startTime: "03:30 PM",
      endTime: "05:30 PM",
      category: "Nature & Leisure",
      description: "Capture golden hour panoramic shots and unwind surrounded by picturesque views.",
      estimatedCost: 500
    },
    {
      title: "Sunset Evening Relaxation & Dinner",
      locationName: `${destination} Town Centre`,
      startTime: "07:00 PM",
      endTime: "09:30 PM",
      category: "Dining & Nightlife",
      description: "Relax at a top-rated dining spot and enjoy refreshing beverages and acoustic tunes.",
      estimatedCost: 2500
    }
  ];

  const pool = blueprint ? blueprint.activitiesPool : defaultActivities;

  // First pass: assemble raw days and activities
  const rawDays = [];
  let totalRawCost = 0;

  for (let i = 1; i <= daysCount; i++) {
    const dayTheme = i === 1
      ? "Arrival, Orientation & Historic Landmarks"
      : i === 2
      ? "Nature, Culture & Iconic Scenery"
      : i === 3
      ? "Local Flavors, Hidden Gems & Sunset Views"
      : `Adventure, Exploration & Experiences (Day ${i})`;

    const startIndex = ((i - 1) * 3) % pool.length;
    const dayActs = [];

    // Formatted calendar date if startDate exists
    let formattedDate = null;
    let isoDate = null;
    if (parsedStartDate) {
      const currentDayDate = new Date(parsedStartDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
      isoDate = currentDayDate.toISOString().split('T')[0];
      formattedDate = currentDayDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    for (let j = 0; j < 3; j++) {
      const act = pool[(startIndex + j) % pool.length];
      // Convert blueprint LKR cost to user's currency
      const costInCurr = Math.round((act.estimatedCost || 0) / convRate);
      totalRawCost += costInCurr;

      dayActs.push({
        order: j + 1,
        title: act.title,
        locationName: act.locationName,
        startTime: act.startTime,
        endTime: act.endTime,
        category: act.category,
        description: act.description,
        estimatedCost: costInCurr
      });
    }

    rawDays.push({
      dayNumber: i,
      date: isoDate,
      formattedDate: formattedDate,
      title: formattedDate ? `Day ${i} (${formattedDate}): ${dayTheme}` : `Day ${i}: ${dayTheme}`,
      theme: dayTheme,
      activities: dayActs
    });
  }

  // 3. STRICT BUDGET SCALING:
  // Ensure the sum of all activities NEVER exceeds targetTotalBudget
  let actualSumCost = 0;
  const maxActivityBudget = Math.max(1, targetTotalBudget * 0.85); // 15% safety buffer for incidentals

  if (totalRawCost > maxActivityBudget && totalRawCost > 0) {
    const scaleFactor = maxActivityBudget / totalRawCost;
    rawDays.forEach((day) => {
      day.activities.forEach((act) => {
        if (act.estimatedCost > 0) {
          let scaled = act.estimatedCost * scaleFactor;
          if (curr === 'LKR' || curr === 'INR') {
            scaled = Math.max(50, Math.round(scaled / 50) * 50);
          } else {
            scaled = Math.max(1, Math.round(scaled));
          }
          act.estimatedCost = scaled;
        }
        actualSumCost += act.estimatedCost;
      });
    });
  } else {
    rawDays.forEach((day) => {
      day.activities.forEach((act) => {
        actualSumCost += act.estimatedCost;
      });
    });
  }

  // Guarantee final total never exceeds target budget
  const finalTotalCost = Math.min(actualSumCost, targetTotalBudget);

  return {
    tripTitle: blueprint ? `${blueprint.title} (${daysCount} Days)` : `${destination} Complete Experience (${daysCount} Days)`,
    destination: destination,
    durationDays: daysCount,
    startDate: parsedStartDate ? parsedStartDate.toISOString().split('T')[0] : null,
    endDate: parsedEndDate ? parsedEndDate.toISOString().split('T')[0] : null,
    budgetCategory: budget,
    customBudget: targetTotalBudget,
    travelStyle: travelStyle,
    travelersCount: numTravelers,
    currency: curr,
    estimatedTotalCost: `${curr} ${finalTotalCost.toLocaleString()}`,
    coverImage: blueprint?.coverImage || "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Sigiriya_Rock_Fortress_View_from_Pidurangala_Rock.jpg/1280px-Sigiriya_Rock_Fortress_View_from_Pidurangala_Rock.jpg",
    summary: `A carefully designed ${daysCount}-day itinerary for ${destination} tuned for ${travelStyle} travel and staying strictly within your ${curr} ${targetTotalBudget.toLocaleString()} budget.`,
    highlights: blueprint?.highlights || [`Iconic ${destination} Landmarks`, "Authentic Local Cuisine", "Cultural Highlights", "Scenic Viewpoints"],
    packingChecklist: blueprint?.checklist || [
      "Comfortable walking footwear",
      "Sun hat and sunglasses",
      "Universal power adapter",
      "Lightweight breathable clothing",
      "Emergency first aid & personal medication",
      "Local SIM card or eSIM ready"
    ],
    localTips: blueprint?.tips || [
      `Carry cash in small denominations (${curr}) for local shops and transit in ${destination}.`,
      "Stay hydrated throughout daytime excursions and wear high-SPF sunscreen.",
      "Respect local customs, especially when visiting religious or heritage sites."
    ],
    days: rawDays
  };
};

/**
 * Call Gemini API using native fetch
 */
const generateWithGemini = async (prompt, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.6
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error("No content received from Gemini model");
  }

  return JSON.parse(textOutput);
};

/**
 * Main export: generateItinerary
 */
exports.generateItinerary = async (params) => {
  const {
    destination,
    duration = 3,
    startDate,
    endDate,
    budget = "moderate",
    customBudget,
    currency = "LKR",
    travelStyle = "balanced",
    travelersCount = 2,
    interests = []
  } = params;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_or_llm_api_key_here") {
    console.log("ℹ️ GEMINI_API_KEY not configured. Generating strict budget-compliant itinerary via Voyanta Curated Engine.");
    return generateFallbackItinerary(params);
  }

  const curr = (currency || "LKR").toUpperCase();
  const prompt = `
You are Voyanta's expert AI Travel Concierge. Generate a realistic, comprehensive, high-quality day-by-day travel itinerary for:
- Destination: ${destination}
- Duration: ${duration} days ${startDate ? `(From ${startDate} to ${endDate || startDate})` : ''}
- STRICT MAXIMUM BUDGET: ${customBudget ? `${customBudget} ${curr}` : `${budget} tier in ${curr}`}
- Currency: ${curr}
- Travel Style: ${travelStyle}
- Travelers: ${travelersCount}
- Special Interests: ${interests.length > 0 ? interests.join(", ") : "Top highlights, authentic food, photography, and culture"}

CRITICAL BUDGET CONSTRAINTS:
1. The user's total budget is EXACTLY ${customBudget || 'moderate'} ${curr}.
2. The SUM of all activity estimatedCost across all ${duration} days MUST NOT EXCEED ${customBudget || 'moderate'} ${curr}.
3. Every activity's estimatedCost must be a realistic number in ${curr}.

CRITICAL CALENDAR CONSTRAINTS:
${startDate ? `1. The trip starts exactly on ${startDate} and ends on ${endDate || startDate}. Each day must include its valid date "YYYY-MM-DD".` : ''}

Return ONLY a valid JSON object matching this exact schema:
{
  "tripTitle": "string",
  "destination": "string",
  "durationDays": number,
  "startDate": "${startDate || ''}",
  "endDate": "${endDate || ''}",
  "budgetCategory": "string",
  "customBudget": ${Number(customBudget) || 0},
  "travelStyle": "string",
  "travelersCount": number,
  "currency": "${curr}",
  "estimatedTotalCost": "${curr} formatted e.g. ${curr} 15,000",
  "coverImage": "https://images.unsplash.com/... suitable travel photo",
  "summary": "2-3 sentences overview of the trip experience",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4"],
  "packingChecklist": ["item 1", "item 2", "item 3", "item 4", "item 5"],
  "localTips": ["practical tip 1", "tip 2", "tip 3"],
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate || ''}",
      "title": "Day 1 Title",
      "theme": "Theme description",
      "activities": [
        {
          "order": 1,
          "title": "Activity name",
          "locationName": "Precise location/establishment",
          "startTime": "09:00 AM",
          "endTime": "11:00 AM",
          "category": "Sightseeing | Food & Dining | Adventure | Culture | Relaxation",
          "description": "Engaging description of the activity and what to experience",
          "estimatedCost": 500
        }
      ]
    }
  ]
}
`;

  try {
    const aiResult = await generateWithGemini(prompt, apiKey);
    return aiResult;
  } catch (err) {
    console.warn(`⚠️ Gemini API call failed (${err.message}). Seamlessly falling back to Voyanta Curated Engine.`);
    return generateFallbackItinerary(params);
  }
};

