const Trip = require('../models/Trip');
const Destination = require('../models/Destination');
const SRI_LANKA_DESTINATIONS = require('../utils/sriLankaDestinationsData');

// WMO Weather Interpretation Codes mapping
const WMO_WEATHER_MAP = {
  0: { condition: 'Clear Sky', icon: 'sun', advice: 'Perfect sunny conditions. Great for outdoor sightseeing and photography.' },
  1: { condition: 'Mainly Clear', icon: 'sun', advice: 'Pleasant and mostly sunny. Ideal for outdoor adventures.' },
  2: { condition: 'Partly Cloudy', icon: 'cloud-sun', advice: 'Nice mix of sun and clouds. Comfortable for walking tours.' },
  3: { condition: 'Overcast', icon: 'cloud', advice: 'Cloudy skies. Good day for museums, temples, and cultural sites.' },
  45: { condition: 'Foggy / Misty', icon: 'cloud', advice: 'Misty atmospheric conditions. Drive carefully on mountain roads.' },
  48: { condition: 'Depositing Rime Fog', icon: 'cloud', advice: 'Cool and foggy. Keep a light jacket handy.' },
  51: { condition: 'Light Drizzle', icon: 'cloud-rain', advice: 'Occasional light drizzle. Carry a compact umbrella.' },
  53: { condition: 'Moderate Drizzle', icon: 'cloud-rain', advice: 'Intermittent drizzle. Light waterproof jacket recommended.' },
  55: { condition: 'Dense Drizzle', icon: 'cloud-rain', advice: 'Steady drizzle. Waterproof footwear advised.' },
  61: { condition: 'Slight Rain', icon: 'cloud-rain', advice: 'Brief rain showers expected. Keep an umbrella ready.' },
  63: { condition: 'Moderate Rain', icon: 'cloud-rain', advice: 'Regular rain showers. Plan indoor visits during downpours.' },
  65: { condition: 'Heavy Rain', icon: 'cloud-rain', advice: 'Heavy tropical rain. Carry a poncho and protect electronics.' },
  80: { condition: 'Slight Rain Showers', icon: 'cloud-rain', advice: 'Passing tropical showers. Usually clears up quickly.' },
  81: { condition: 'Moderate Rain Showers', icon: 'cloud-rain', advice: 'Afternoon rain showers common. Great time for a tea cafe stop.' },
  82: { condition: 'Violent Rain Showers', icon: 'cloud-rain', advice: 'Strong rain bursts. Seek shelter during peak downpour.' },
  95: { condition: 'Thunderstorm', icon: 'cloud-lightning', advice: 'Thunderstorms possible. Avoid open viewpoints and swimming.' },
  96: { condition: 'Thunderstorm with Hail', icon: 'cloud-lightning', advice: 'Stay indoors during heavy thunderstorm activity.' }
};

// Helper to determine destination coordinates
const getDestinationCoordinates = async (destinationName) => {
  if (!destinationName) return { lat: 6.9271, lon: 79.8612, name: 'Colombo' };

  const cleanName = destinationName.trim().toLowerCase();

  // 1. Search in MongoDB Destination collection
  try {
    const dbDest = await Destination.findOne({
      $or: [
        { name: { $regex: cleanName, $options: 'i' } },
        { region: { $regex: cleanName, $options: 'i' } }
      ]
    });
    if (dbDest && dbDest.latitude && dbDest.longitude) {
      return { lat: dbDest.latitude, lon: dbDest.longitude, name: dbDest.name };
    }
  } catch (err) {
    // Ignore and fallback
  }

  // 2. Search in Sri Lanka dataset
  const match = SRI_LANKA_DESTINATIONS.find((d) =>
    d.name.toLowerCase().includes(cleanName) ||
    cleanName.includes(d.name.toLowerCase()) ||
    (d.region && d.region.toLowerCase().includes(cleanName))
  );

  if (match) {
    return { lat: match.latitude, lon: match.longitude, name: match.name };
  }

  // 3. Known city coordinates in Sri Lanka & common hubs
  const KNOWN_CITIES = {
    colombo: { lat: 6.9271, lon: 79.8612 },
    kandy: { lat: 7.2906, lon: 80.6337 },
    galle: { lat: 6.0535, lon: 80.2210 },
    ella: { lat: 6.8667, lon: 81.0466 },
    sigiriya: { lat: 7.9570, lon: 80.7603 },
    nuwara: { lat: 6.9497, lon: 80.7891 },
    'nuwara eliya': { lat: 6.9497, lon: 80.7891 },
    mirissa: { lat: 5.9482, lon: 80.4571 },
    jaffna: { lat: 9.6615, lon: 80.0255 },
    trincomalee: { lat: 8.5874, lon: 81.2152 },
    bentota: { lat: 6.4259, lon: 79.9965 },
    arugam: { lat: 6.8415, lon: 81.8344 },
    'arugam bay': { lat: 6.8415, lon: 81.8344 },
    yala: { lat: 6.3683, lon: 81.5278 }
  };

  for (const [key, coords] of Object.entries(KNOWN_CITIES)) {
    if (cleanName.includes(key)) {
      return { ...coords, name: destinationName };
    }
  }

  // Default Central Sri Lanka
  return { lat: 7.8731, lon: 80.7718, name: destinationName };
};

// Seasonal weather generator for future / fallback dates
const generateSeasonalForecast = (dateObj, destName, dayNumber) => {
  const month = dateObj.getMonth(); // 0 to 11
  const isHighland = /ella|nuwara|kandy|horton|adams/i.test(destName);
  const isCoast = /mirissa|galle|colombo|bentota|trincomalee|arugam|tangalle/i.test(destName);

  // Temperature ranges in Celsius
  let baseMax = isHighland ? 23 : (isCoast ? 31 : 30);
  let baseMin = isHighland ? 14 : (isCoast ? 24 : 22);

  // Slight day variation
  const tempVariation = ((dayNumber * 7) % 5) - 2;
  const tempMax = Math.round(baseMax + tempVariation);
  const tempMin = Math.round(baseMin + (tempVariation * 0.5));

  // Rain probability based on Sri Lanka monsoon seasons (SW monsoon May-Sep, NE monsoon Oct-Jan)
  let rainChance = 25;
  let condition = 'Partly Cloudy';
  let icon = 'cloud-sun';
  let weatherCode = 2;

  if (month >= 9 && month <= 11) {
    // Inter-monsoon / NE monsoon
    rainChance = 45 + ((dayNumber * 13) % 30);
  } else if (month >= 4 && month <= 8 && !/trincomalee|arugam|jaffna/i.test(destName)) {
    // SW monsoon in South & West
    rainChance = 50 + ((dayNumber * 11) % 25);
  } else {
    // Dry / Sunny season
    rainChance = 10 + ((dayNumber * 9) % 20);
  }

  if (rainChance > 60) {
    condition = 'Tropical Rain Showers';
    icon = 'cloud-rain';
    weatherCode = 80;
  } else if (rainChance > 35) {
    condition = 'Partly Cloudy with Passing Showers';
    icon = 'cloud-sun';
    weatherCode = 2;
  } else {
    condition = 'Sunny & Clear Skies';
    icon = 'sun';
    weatherCode = 0;
  }

  const adviceMeta = WMO_WEATHER_MAP[weatherCode] || WMO_WEATHER_MAP[2];

  return {
    tempMax,
    tempMin,
    condition,
    weatherCode,
    icon,
    rainChance,
    humidity: isCoast ? 78 : (isHighland ? 85 : 70),
    windSpeed: 10 + ((dayNumber * 3) % 8),
    advice: adviceMeta.advice
  };
};

// @desc    Get trip day-by-day weather forecast based on trip dates & destination
// @route   GET /api/trips/:tripId/weather
// @access  Public / Private
exports.getTripWeatherForecast = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    // Calculate total days
    const diffTime = Math.abs(endDate - startDate);
    let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (isNaN(totalDays) || totalDays < 1) totalDays = 3;
    if (totalDays > 14) totalDays = 14; // Cap at 14 days for forecast accuracy

    // Destination coordinates
    const coords = await getDestinationCoordinates(trip.destination);

    // Build day-by-day list of dates
    const tripDates = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      tripDates.push(d);
    }

    // Attempt to fetch from Open-Meteo
    let openMeteoData = null;
    try {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,relative_humidity_2m_max&timezone=auto`;
      const response = await fetch(apiUrl, { signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        openMeteoData = await response.json();
      }
    } catch (apiErr) {
      console.warn('Open-Meteo API fetch warning (using fallback):', apiErr.message);
    }

    // Assemble daily forecast
    const dailyForecast = tripDates.map((dateObj, idx) => {
      const dayNum = idx + 1;
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Check if openMeteoData has this date in daily.time
      if (openMeteoData && openMeteoData.daily && Array.isArray(openMeteoData.daily.time)) {
        const dateIndex = openMeteoData.daily.time.indexOf(dateStr);
        if (dateIndex !== -1) {
          const wCode = openMeteoData.daily.weathercode[dateIndex] ?? 0;
          const meta = WMO_WEATHER_MAP[wCode] || WMO_WEATHER_MAP[0];
          const tMax = Math.round(openMeteoData.daily.temperature_2m_max[dateIndex] ?? 28);
          const tMin = Math.round(openMeteoData.daily.temperature_2m_min[dateIndex] ?? 22);
          const rainProb = openMeteoData.daily.precipitation_probability_max[dateIndex] ?? 20;
          const wind = Math.round(openMeteoData.daily.windspeed_10m_max[dateIndex] ?? 12);
          const humidity = Math.round(openMeteoData.daily.relative_humidity_2m_max?.[dateIndex] ?? 70);

          return {
            dayNumber: dayNum,
            date: dateStr,
            dayName,
            formattedDate,
            tempMax: tMax,
            tempMin: tMin,
            condition: meta.condition,
            weatherCode: wCode,
            icon: meta.icon,
            rainChance: rainProb,
            humidity,
            windSpeed: wind,
            advice: meta.advice,
            isLive: true
          };
        }
      }

      // Seasonal / Smart Climate forecast fallback
      const seasonal = generateSeasonalForecast(dateObj, trip.destination, dayNum);
      return {
        dayNumber: dayNum,
        date: dateStr,
        dayName,
        formattedDate,
        tempMax: seasonal.tempMax,
        tempMin: seasonal.tempMin,
        condition: seasonal.condition,
        weatherCode: seasonal.weatherCode,
        icon: seasonal.icon,
        rainChance: seasonal.rainChance,
        humidity: seasonal.humidity,
        windSpeed: seasonal.windSpeed,
        advice: seasonal.advice,
        isLive: false
      };
    });

    // Calculate trip weather statistics
    const avgTemp = Math.round(
      dailyForecast.reduce((sum, d) => sum + (d.tempMax + d.tempMin) / 2, 0) / dailyForecast.length
    );
    const rainyDaysCount = dailyForecast.filter((d) => d.rainChance > 40).length;
    const bestDay = dailyForecast.reduce((best, cur) => (cur.rainChance < best.rainChance ? cur : best), dailyForecast[0]);

    // Smart packing suggestions
    const packingTips = [];
    if (dailyForecast.some((d) => d.tempMax >= 30)) {
      packingTips.push('☀️ Lightweight, breathable cotton clothing and UV sunglasses');
    }
    if (dailyForecast.some((d) => d.tempMin <= 18)) {
      packingTips.push('🧥 Light sweater or windbreaker jacket for chilly/misty evenings');
    }
    if (rainyDaysCount > 0) {
      packingTips.push('☂️ Waterproof daypack, compact umbrella or quick-dry raincoat');
    }
    packingTips.push('👟 Sturdy walking shoes or hiking sandals for local exploration');
    packingTips.push('🧴 SPF 50+ Sunscreen and natural mosquito repellent');

    res.status(200).json({
      success: true,
      data: {
        destination: trip.destination,
        locationName: coords.name,
        coordinates: { latitude: coords.lat, longitude: coords.lon },
        totalDays,
        dateRange: {
          start: trip.startDate,
          end: trip.endDate
        },
        avgTemp,
        rainyDaysCount,
        bestDay: {
          dayNumber: bestDay.dayNumber,
          date: bestDay.formattedDate,
          condition: bestDay.condition,
          tempMax: bestDay.tempMax
        },
        packingTips,
        dailyForecast
      }
    });
  } catch (error) {
    console.error('Trip Weather Forecast Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trip weather forecast',
      error: error.message
    });
  }
};
