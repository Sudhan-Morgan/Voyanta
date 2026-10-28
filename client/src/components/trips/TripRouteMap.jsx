import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Car,
  Footprints,
  Bus,
  Bike,
  Clock,
  ArrowRight,
  ArrowUpDown,
  Plus,
  Trash2,
  ExternalLink,
  Key,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Comprehensive Sri Lanka & Global coordinates cache for instant, pinpoint route accuracy
const KNOWN_COORDS = {
  // --- Nuwara Eliya Region Attractions (Specific first) ---
  'horton plains national park': [6.8018, 80.8066],
  'horton plains': [6.8018, 80.8066],
  'world\'s end': [6.7905, 80.7972],
  'bakers falls': [6.8080, 80.8000],
  'nuwara eliya tea gardens': [6.9600, 80.7800],
  'pedro tea estate': [6.9647, 80.7963],
  'mackwoods labookellie': [7.0250, 80.7020],
  'bluefield tea factory': [7.0500, 80.6700],
  'gregory lake': [6.9532, 80.7788],
  'lake gregory': [6.9532, 80.7788],
  'victoria park': [6.9680, 80.7675],
  'victoria park nuwara eliya': [6.9680, 80.7675],
  'seetha amman temple': [6.9328, 80.8143],
  'lovers leap waterfall': [6.9610, 80.7930],
  'lover\'s leap waterfall': [6.9610, 80.7930],
  'ambewela farm': [6.8778, 80.8039],
  'single tree hill': [6.9612, 80.7667],
  'nuwara eliya golf club': [6.9740, 80.7640],
  'post office nuwara eliya': [6.9723, 80.7677],

  // --- Ella Region Attractions (Specific first) ---
  'demodara nine arch bridge': [6.8768, 81.0608],
  'nine arches bridge': [6.8768, 81.0608],
  'nine arch bridge': [6.8768, 81.0608],
  'little adam\'s peak': [6.8650, 81.0630],
  'little adams peak': [6.8650, 81.0630],
  'ella rock summit': [6.8550, 81.0524],
  'ella rock': [6.8550, 81.0524],
  'ravana falls': [6.8412, 81.0551],
  'ravana cave': [6.8465, 81.0470],
  'flying ravana mega zipline': [6.8640, 81.0620],
  'flying ravana': [6.8640, 81.0620],
  'ravana pool club': [6.8630, 81.0600],
  'halpewatte tea factory': [6.8895, 81.0346],
  'uva halpewatte tea factory': [6.8895, 81.0346],
  'demodara loop': [6.9015, 81.0655],
  'cafe chill': [6.8748, 81.0468],
  'ella town spice garden': [6.8720, 81.0490],
  'diyaluma falls': [6.7327, 81.0315],
  'lipton\'s seat': [6.7803, 81.0142],
  'bambaragala peak': [6.8850, 81.0400],

  // --- Kandy Region Attractions ---
  'temple of the sacred tooth relic': [7.2936, 80.6413],
  'temple of the tooth': [7.2936, 80.6413],
  'royal botanical gardens peradeniya': [7.2715, 80.5960],
  'peradeniya botanical gardens': [7.2715, 80.5960],
  'kandy lake': [7.2917, 80.6400],
  'bahirawakanda buddha': [7.2950, 78.6300],

  // --- Sigiriya & Cultural Triangle ---
  'sigiriya rock fortress': [7.9570, 80.7603],
  'sigiriya rock': [7.9570, 80.7603],
  'pidurangala rock': [7.9650, 80.7650],
  'dambulla cave temple': [7.8560, 80.6480],
  'golden temple of dambulla': [7.8560, 80.6480],

  // --- Southern Coast Attractions ---
  'galle fort': [6.0270, 80.2170],
  'galle lighthouse': [6.0253, 80.2185],
  'coconut tree hill': [5.9427, 80.4635],
  'mirissa beach': [5.9483, 80.4578],
  'weligama bay': [5.9730, 80.4280],
  'unawatuna beach': [6.0100, 80.2480],
  'hikkaduwa beach': [6.1400, 80.1000],
  'bentota beach': [6.4257, 79.9984],

  // --- National Parks & Safari ---
  'yala national park': [6.3687, 81.4721],
  'udawalawe national park': [6.4740, 80.8980],
  'wilpattu national park': [8.4500, 80.0000],
  'minneriya national park': [8.0300, 80.9000],

  // --- Major Cities & Base Regions (Matched last as fallbacks) ---
  'nuwara eliya': [6.9497, 80.7891],
  'nuwaraeliya': [6.9497, 80.7891],
  'nuwaraelliya': [6.9497, 80.7891],
  'ella': [6.8736, 81.0489],
  'ella town': [6.8736, 81.0489],
  'kandy': [7.2906, 80.6337],
  'colombo': [6.9271, 79.8612],
  'galle': [6.0535, 80.2210],
  'mirissa': [5.9483, 80.4578],
  'sigiriya': [7.9570, 80.7603],
  'dambulla': [7.8731, 80.6517],
  'polonnaruwa': [7.9403, 81.0188],
  'anuradhapura': [8.3114, 80.4037],
  'trincomalee': [8.5874, 81.2152],
  'bentota': [6.4257, 79.9984],
  'yala': [6.3687, 81.4721],
  'jaffna': [9.6615, 80.0255],
  'negombo': [7.2008, 79.8736],
  'katunayake': [7.1808, 79.8841],
  'bandaranaike international airport': [7.1808, 79.8841],
  'matara': [5.9496, 80.5469],
  'tangalle': [6.0244, 80.7941],
  'badulla': [6.9934, 81.0550],
  'haputale': [6.7680, 80.9570],
  'bandarawela': [6.8290, 80.9900]
};

// String normalizer for flexible matching
const normalizePlace = (s) => (s || '').toLowerCase().replace(/[\s\-_,.'’]/g, '');

// Sort keys by length descending so specific spots are matched before general region centers
const sortedKnownKeys = Object.keys(KNOWN_COORDS).sort((a, b) => b.length - a.length);

// Geocoding helper with caching and intelligent priority resolution
const geocodeCache = {};

const geocodeLocation = async (placeName) => {
  if (!placeName || typeof placeName !== 'string') return null;
  const raw = placeName.trim().toLowerCase();
  const norm = normalizePlace(raw);

  // 1. Check in runtime cache
  if (geocodeCache[norm]) {
    return { ...geocodeCache[norm], name: placeName };
  }

  // 2. Exact match in KNOWN_COORDS
  for (const k of sortedKnownKeys) {
    if (raw === k || norm === normalizePlace(k)) {
      const result = { lat: KNOWN_COORDS[k][0], lng: KNOWN_COORDS[k][1], name: placeName };
      geocodeCache[norm] = result;
      return result;
    }
  }

  // 3. Substring match: Specific attraction is inside placeName (e.g. 'nine arch bridge' inside 'Nine Arches Bridge, Demodara')
  for (const k of sortedKnownKeys) {
    const kNorm = normalizePlace(k);
    if (kNorm.length > 5 && norm.includes(kNorm)) {
      const result = { lat: KNOWN_COORDS[k][0], lng: KNOWN_COORDS[k][1], name: placeName };
      geocodeCache[norm] = result;
      return result;
    }
  }

  // 4. Try OpenStreetMap Nominatim restricted to Sri Lanka (countrycodes=lk)
  const queriesToTry = [
    `${placeName}, Sri Lanka`,
    placeName.split(',')[0].trim() + ', Sri Lanka',
    placeName
  ];

  for (const query of queriesToTry) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=lk&q=${encodeURIComponent(query)}`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'VoyantaApp/1.0' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        // Sanity check: Coordinate must be within Sri Lanka bounds (lat 5.8-10.0, lng 79.5-82.0)
        if (lat >= 5.8 && lat <= 10.0 && lng >= 79.5 && lng <= 82.0) {
          const result = { lat, lng, name: placeName };
          geocodeCache[norm] = result;
          return result;
        }
      }
    } catch (err) {
      console.warn(`Geocoding fetch error for "${query}":`, err.message);
    }
  }

  // 5. Context-aware regional fallback (prevents snapping Ella/Nuwara Eliya places to Colombo)
  let fallbackCoords = [6.9271, 79.8612]; // Default Colombo
  if (norm.includes('nuwaraeliya') || norm.includes('nuwaraelliya') || norm.includes('gregory') || norm.includes('horton')) {
    fallbackCoords = KNOWN_COORDS['nuwara eliya'];
  } else if (norm.includes('ella') || norm.includes('demodara') || norm.includes('ravana') || norm.includes('adamspeak')) {
    fallbackCoords = KNOWN_COORDS['ella'];
  } else if (norm.includes('kandy') || norm.includes('peradeniya')) {
    fallbackCoords = KNOWN_COORDS['kandy'];
  } else if (norm.includes('galle') || norm.includes('unawatuna')) {
    fallbackCoords = KNOWN_COORDS['galle'];
  } else if (norm.includes('mirissa') || norm.includes('weligama')) {
    fallbackCoords = KNOWN_COORDS['mirissa'];
  } else if (norm.includes('sigiriya') || norm.includes('dambulla')) {
    fallbackCoords = KNOWN_COORDS['sigiriya'];
  }

  const fallbackResult = { lat: fallbackCoords[0], lng: fallbackCoords[1], name: placeName };
  geocodeCache[norm] = fallbackResult;
  return fallbackResult;
};

export default function TripRouteMap({
  initialOrigin = 'Colombo',
  initialDestination = 'Galle',
  initialWaypoints = [],
  tripTitle = '',
  height = '520px',
  canEdit = true,
  onRouteCalculated = null
}) {
  const mapContainerRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const gmapInstanceRef = useRef(null);
  const gmapDirectionsRendererRef = useRef(null);

  // States
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [waypoints, setWaypoints] = useState(initialWaypoints);
  const [newWaypoint, setNewWaypoint] = useState('');
  const [travelMode, setTravelMode] = useState('driving'); // 'driving', 'walking', 'transit', 'bicycling'
  
  // API Key Management
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isEnvPlaceholder = !envKey || envKey.includes('your_google_maps') || envKey.length < 15;
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('VOYANTA_GMAPS_KEY') || (!isEnvPlaceholder ? envKey : '')
  );
  const [mapEngine, setMapEngine] = useState(apiKey ? 'google' : 'osm'); // 'google' | 'osm'
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(apiKey);

  // Route statistics
  const [routeStats, setRouteStats] = useState({
    totalDistance: '',
    totalDuration: '',
    legs: [],
    loading: false,
    error: null
  });

  const [expandedLegs, setExpandedLegs] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (initialOrigin) setOrigin(initialOrigin);
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDestination) setDestination(initialDestination);
  }, [initialDestination]);

  useEffect(() => {
    if (Array.isArray(initialWaypoints)) {
      setWaypoints(initialWaypoints);
    }
  }, [initialWaypoints]);

  // Handle saving API key in UI
  const handleSaveApiKey = (keyToSave) => {
    const cleanKey = keyToSave.trim();
    setApiKey(cleanKey);
    localStorage.setItem('VOYANTA_GMAPS_KEY', cleanKey);
    if (cleanKey) {
      setMapEngine('google');
      setShowKeyConfig(false);
    } else {
      setMapEngine('osm');
    }
  };

  // Build Google Maps External Navigation Link
  const getGoogleMapsDirectionsUrl = () => {
    const base = 'https://www.google.com/maps/dir/?api=1';
    const params = new URLSearchParams();
    if (origin) params.set('origin', origin);
    if (destination) params.set('destination', destination);
    if (waypoints.length > 0) {
      const wpNames = waypoints.map((w) => (typeof w === 'string' ? w : w.name || w.locationName)).filter(Boolean);
      params.set('waypoints', wpNames.join('|'));
    }
    params.set('travelmode', travelMode);
    return `${base}&${params.toString()}`;
  };

  // Re-order Waypoint Helpers
  const moveWaypoint = (index, direction) => {
    const updated = [...waypoints];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setWaypoints(updated);
  };

  const removeWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const addWaypoint = () => {
    if (!newWaypoint.trim()) return;
    setWaypoints([...waypoints, newWaypoint.trim()]);
    setNewWaypoint('');
  };

  const swapOriginDestination = () => {
    setOrigin(destination);
    setDestination(origin);
    setWaypoints([...waypoints].reverse());
  };

  // ==========================================
  // RENDER OSM / LEAFLET ROUTE (FREE & DEFAULT)
  // ==========================================
  const renderOsmRoute = async () => {
    if (!mapContainerRef.current) return;
    setRouteStats((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Initialize Leaflet Map if not exists
      if (!leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current = L.map(mapContainerRef.current, {
          attributionControl: true,
          zoomControl: true
        }).setView([7.8731, 80.7718], 8);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMapInstanceRef.current);
      }

      const map = leafletMapInstanceRef.current;

      // Clear existing vector layers & markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // 2. Geocode Origin, Waypoints, and Destination
      const stopList = [
        { type: 'start', label: 'Origin', name: origin },
        ...waypoints.map((w, idx) => ({
          type: 'waypoint',
          label: `Stop ${idx + 1}`,
          name: typeof w === 'string' ? w : w.name || w.locationName
        })),
        { type: 'end', label: 'Destination', name: destination }
      ].filter((s) => s.name && s.name.trim().length > 0);

      if (stopList.length < 2) {
        setRouteStats((prev) => ({
          ...prev,
          loading: false,
          error: 'Please enter both a starting point and a destination.'
        }));
        return;
      }

      const geocodedStops = [];
      for (const stop of stopList) {
        const geo = await geocodeLocation(stop.name);
        if (geo) {
          geocodedStops.push({ ...stop, lat: geo.lat, lng: geo.lng });
        }
      }

      if (geocodedStops.length < 2) {
        setRouteStats((prev) => ({
          ...prev,
          loading: false,
          error: 'Could not resolve coordinates for the locations.'
        }));
        return;
      }

      // 3. Request road routing from OSRM
      const coordsQuery = geocodedStops.map((s) => `${s.lng},${s.lat}`).join(';');
      const osrmMode = travelMode === 'walking' ? 'foot' : travelMode === 'bicycling' ? 'bike' : 'driving';
      const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmMode}/${coordsQuery}?overview=full&geometries=geojson&steps=true`;

      let routeData = null;
      try {
        const osrmRes = await fetch(osrmUrl);
        const data = await osrmRes.json();
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          routeData = data.routes[0];
        }
      } catch (err) {
        console.warn('OSRM router error, falling back to straight polyline:', err.message);
      }

      // 4. Draw route polyline
      let bounds = L.latLngBounds();

      if (routeData && routeData.geometry && routeData.geometry.coordinates) {
        const latLngs = routeData.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const polyline = L.polyline(latLngs, {
          color: '#4f46e5',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round'
        }).addTo(map);

        bounds = polyline.getBounds();

        // Calculate metrics
        const distKm = (routeData.distance / 1000).toFixed(1);
        const durHours = Math.floor(routeData.duration / 3600);
        const durMins = Math.round((routeData.duration % 3600) / 60);
        const durationText = durHours > 0 ? `${durHours}h ${durMins}m` : `${durMins} mins`;

        const computedLegs = (routeData.legs || []).map((leg, idx) => ({
          from: geocodedStops[idx]?.name,
          to: geocodedStops[idx + 1]?.name,
          distance: `${(leg.distance / 1000).toFixed(1)} km`,
          duration: `${Math.round(leg.duration / 60)} mins`
        }));

        setRouteStats({
          totalDistance: `${distKm} km`,
          totalDuration: durationText,
          legs: computedLegs,
          loading: false,
          error: null
        });

        if (onRouteCalculated) {
          onRouteCalculated({ totalDistance: `${distKm} km`, totalDuration: durationText, legs: computedLegs });
        }
      } else {
        // Fallback: Straight line connecting stops
        const straightCoords = geocodedStops.map((s) => [s.lat, s.lng]);
        const polyline = L.polyline(straightCoords, {
          color: '#6366f1',
          dashArray: '6, 8',
          weight: 4
        }).addTo(map);

        bounds = polyline.getBounds();
        setRouteStats({
          totalDistance: 'Approx. Direct Line',
          totalDuration: 'Varies',
          legs: [],
          loading: false,
          error: null
        });
      }

      // 5. Add custom numbered markers for each stop
      geocodedStops.forEach((stop, i) => {
        const isStart = i === 0;
        const isEnd = i === geocodedStops.length - 1;

        const bgColor = isStart ? '#10b981' : isEnd ? '#ef4444' : '#6366f1';
        const labelText = isStart ? 'S' : isEnd ? 'F' : `${i}`;

        const iconHtml = `
          <div style="
            background: ${bgColor};
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">${labelText}</div>
        `;

        const customIcon = L.divIcon({
          className: 'voyanta-map-marker',
          html: iconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
            <strong style="color: ${bgColor}; font-size: 11px; text-transform: uppercase;">${stop.label}</strong>
            <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${stop.name}</div>
          </div>
        `);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      setRouteStats((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to draw route. Check place names or network.'
      }));
    }
  };

  // ==========================================
  // RENDER GOOGLE MAPS JS API ROUTE
  // ==========================================
  const loadGoogleMapsScript = (key) => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        return resolve(window.google.maps);
      }
      const existing = document.getElementById('google-maps-js-sdk');
      if (existing) {
        existing.onload = () => resolve(window.google.maps);
        existing.onerror = reject;
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-js-sdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  };

  const renderGoogleMapsRoute = async () => {
    if (!mapContainerRef.current) return;
    setRouteStats((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await loadGoogleMapsScript(apiKey);

      if (!gmapInstanceRef.current) {
        gmapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
          zoom: 8,
          center: { lat: 7.8731, lng: 80.7718 },
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        });

        gmapDirectionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: gmapInstanceRef.current,
          panel: null,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#4f46e5',
            strokeWeight: 6,
            strokeOpacity: 0.85
          }
        });
      }

      const directionsService = new window.google.maps.DirectionsService();

      const wpList = waypoints
        .map((w) => (typeof w === 'string' ? w : w.name || w.locationName))
        .filter(Boolean)
        .map((loc) => ({ location: loc, stopover: true }));

      const gModeMap = {
        driving: window.google.maps.TravelMode.DRIVING,
        walking: window.google.maps.TravelMode.WALKING,
        transit: window.google.maps.TravelMode.TRANSIT,
        bicycling: window.google.maps.TravelMode.BICYCLING
      };

      directionsService.route(
        {
          origin,
          destination,
          waypoints: wpList,
          travelMode: gModeMap[travelMode] || window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            gmapDirectionsRendererRef.current.setDirections(result);

            const route = result.routes[0];
            let totalMeters = 0;
            let totalSeconds = 0;
            const computedLegs = [];

            route.legs.forEach((leg) => {
              totalMeters += leg.distance.value;
              totalSeconds += leg.duration.value;
              computedLegs.push({
                from: leg.start_address,
                to: leg.end_address,
                distance: leg.distance.text,
                duration: leg.duration.text
              });
            });

            const totalKm = (totalMeters / 1000).toFixed(1);
            const totalHours = Math.floor(totalSeconds / 3600);
            const totalMins = Math.round((totalSeconds % 3600) / 60);
            const totalDurationStr = totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins} mins`;

            setRouteStats({
              totalDistance: `${totalKm} km`,
              totalDuration: totalDurationStr,
              legs: computedLegs,
              loading: false,
              error: null
            });

            if (onRouteCalculated) {
              onRouteCalculated({ totalDistance: `${totalKm} km`, totalDuration: totalDurationStr, legs: computedLegs });
            }
          } else {
            console.warn('Google Maps directions error:', status);
            setRouteStats((prev) => ({
              ...prev,
              loading: false,
              error: `Google Maps could not route between stops (${status}). Falling back to OpenStreetMap.`
            }));
            // Graceful fallback to OSM
            setMapEngine('osm');
          }
        }
      );
    } catch (err) {
      console.warn('Google Maps Load Error:', err);
      setRouteStats((prev) => ({
        ...prev,
        loading: false,
        error: 'Google Maps API failed. Using OpenStreetMap.'
      }));
      setMapEngine('osm');
    }
  };

  // Main Effect trigger to calculate/draw route
  useEffect(() => {
    // If switching engines, reset container DOM
    if (mapContainerRef.current) {
      if (mapEngine === 'google') {
        if (leafletMapInstanceRef.current) {
          leafletMapInstanceRef.current.remove();
          leafletMapInstanceRef.current = null;
        }
        renderGoogleMapsRoute();
      } else {
        if (gmapInstanceRef.current) {
          gmapInstanceRef.current = null;
        }
        renderOsmRoute();
      }
    }

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [origin, destination, waypoints, travelMode, mapEngine, apiKey]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Header & Controls Bar */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white border-b border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                {tripTitle ? `${tripTitle} — Route Map` : 'Interactive Trip Route Planner'}
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing route, waypoints, driving distance & duration
              </p>
            </div>
          </div>

          {/* Engine & Key Config Actions */}
          <div className="flex items-center gap-2">
            {/* Map Engine Badge */}
            <button
              onClick={() => setMapEngine(mapEngine === 'google' ? 'osm' : 'google')}
              title="Click to toggle between Google Maps and OpenStreetMap"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                mapEngine === 'google'
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{mapEngine === 'google' ? 'Google Maps Mode' : 'OpenStreetMap Mode'}</span>
            </button>

            {/* Config API Key Button */}
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>API Key</span>
            </button>

            {/* Open directly in Google Maps Application */}
            <a
              href={getGoogleMapsDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-transform hover:scale-105"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>

        {/* API Key Drawer / Configuration Notice */}
        {showKeyConfig && (
          <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-3 animate-in fade-in duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4" /> Google Maps API Key Setup
                </h4>
                <p className="text-xs text-slate-300">
                  Google Maps Directions API use panna ungaludaiya Google Maps Browser API Key-ai enter pannunga.
                  API Key illanaalum <span className="text-emerald-400 font-semibold">OpenStreetMap Free Engine</span> moolamaaga
                  road route smooth-aa work aagum!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AIzaSy... (Paste Google Maps API Key here)"
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                onClick={() => handleSaveApiKey(tempKeyInput)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Save & Apply
              </button>
              {apiKey && (
                <button
                  onClick={() => handleSaveApiKey('')}
                  className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Clear Key
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Tip: Neenga <code className="text-indigo-300">client/.env</code> file-il{' '}
              <code className="text-amber-300">VITE_GOOGLE_MAPS_API_KEY</code> aagavum set seiyalaam.
            </p>
          </div>
        )}

        {/* Travel Mode Pills & Quick Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700/60">
            {[
              { id: 'driving', label: 'Drive', icon: Car },
              { id: 'walking', label: 'Walk', icon: Footprints },
              { id: 'transit', label: 'Transit', icon: Bus },
              { id: 'bicycling', label: 'Cycle', icon: Bike }
            ].map((m) => {
              const Icon = m.icon;
              const isActive = travelMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setTravelMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            {routeStats.loading ? (
              <span className="text-xs text-indigo-400 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                Calculating Route...
              </span>
            ) : routeStats.totalDistance ? (
              <>
                <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-xl text-xs font-bold text-white">
                  <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{routeStats.totalDistance}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-xl text-xs font-bold text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{routeStats.totalDuration}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Column: Route Stops & Waypoints Manager (5 cols on lg) */}
        {canEdit && (
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 p-5 bg-slate-50/60 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Trip Itinerary Stops ({waypoints.length + 2})
                </h4>
                <button
                  onClick={swapOriginDestination}
                  title="Swap Origin and Destination"
                  className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Reverse</span>
                </button>
              </div>

              {/* Waypoints Sequence List */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {/* 1. Origin Stop */}
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block leading-tight">
                      Start Location
                    </span>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g. Colombo or Hotel"
                      className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 2. Middle Waypoints */}
                {waypoints.map((wp, index) => {
                  const wpName = typeof wp === 'string' ? wp : wp.name || wp.locationName;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs group hover:border-indigo-300 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 block leading-tight">
                          Stop #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={wpName}
                          onChange={(e) => {
                            const updated = [...waypoints];
                            updated[index] = e.target.value;
                            setWaypoints(updated);
                          }}
                          className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden truncate"
                        />
                      </div>

                      {/* Move Up/Down & Remove */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveWaypoint(index, -1)}
                          disabled={index === 0}
                          title="Move earlier"
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveWaypoint(index, 1)}
                          disabled={index === waypoints.length - 1}
                          title="Move later"
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeWaypoint(index)}
                          title="Remove Stop"
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 3. Final Destination */}
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                    F
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-rose-600 block leading-tight">
                      End Destination
                    </span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Galle Fort"
                      className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Add New Stop Along the Route */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newWaypoint}
                  onChange={(e) => setNewWaypoint(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addWaypoint()}
                  placeholder="+ Add stop (e.g. Nine Arch Bridge, Ella)"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button
                  onClick={addWaypoint}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-indigo-200 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Leg-by-leg breakdown drawer */}
            {routeStats.legs && routeStats.legs.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => setExpandedLegs(!expandedLegs)}
                  className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <span>Step-by-Step Leg Travel Times ({routeStats.legs.length})</span>
                  {expandedLegs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {expandedLegs && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs pr-1">
                    {routeStats.legs.map((leg, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-slate-600 text-[11px]"
                      >
                        <div className="truncate max-w-[170px]">
                          <span className="font-semibold text-slate-800">{leg.from || `Stop ${i}`}</span> →{' '}
                          <span className="font-semibold text-slate-800">{leg.to || `Stop ${i + 1}`}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-indigo-600">{leg.distance}</span>{' '}
                          <span className="text-slate-400">({leg.duration})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status / Error Toast */}
            {routeStats.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{routeStats.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Right Column: The Interactive Map (7 cols on lg or 12 if canEdit=false) */}
        <div className={`${canEdit ? 'lg:col-span-7' : 'lg:col-span-12'} relative w-full`} style={{ minHeight: height }}>
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[420px] rounded-b-3xl lg:rounded-b-none lg:rounded-br-3xl"
            style={{ height }}
          />

          {/* Quick Floating Overlays on Map */}
          <div className="absolute bottom-4 left-4 z-1000 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 shadow-lg">
              📍 {waypoints.length + 2} Locations Mapped
            </span>
            {routeStats.totalDistance && (
              <span className="px-3 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-lg">
                🚗 {routeStats.totalDistance} • {routeStats.totalDuration}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
