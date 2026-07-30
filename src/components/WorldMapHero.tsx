import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CountryEngagement {
  name: string;
  coords: [number, number];
  engagement: number;
  artificialWeight?: number; // Used to boost visibility of specific countries
}

// Normalized subset of provided dataset + some additional ones for global spread
const countryData: CountryEngagement[] = [
  { name: 'Egypt', coords: [30.8025, 26.8206], engagement: 97183276 },
  { name: 'Iraq', coords: [43.6793, 33.2232], engagement: 17098681 },
  { name: 'Algeria', coords: [1.6596, 28.0339], engagement: 12092040 },
  { name: 'Turkey', coords: [35.2433, 38.9637], engagement: 9363202 },
  { name: 'Saudi Arabia', coords: [45.0792, 23.8859], engagement: 5335247 },
  { name: 'Jordan', coords: [36.2384, 30.5852], engagement: 3731686 },
  { name: 'Lebanon', coords: [35.8623, 33.8547], engagement: 2811265 },
  { name: 'Morocco', coords: [-7.0926, 31.7917], engagement: 2704711 },
  { name: 'Tunisia', coords: [9.5375, 33.8869], engagement: 2497019 },
  { name: 'Oman', coords: [55.9233, 21.5126], engagement: 2032187 },
  { name: 'Syria', coords: [38.9968, 34.8021], engagement: 1599933 },
  { name: 'Libya', coords: [17.2283, 26.3351], engagement: 2004937 },
  { name: 'UAE', coords: [54.0924, 23.4241], engagement: 1435604 },
  { name: 'Palestine', coords: [35.2332, 31.9522], engagement: 1141552 },
  { name: 'Israel', coords: [34.8516, 31.0461], engagement: 1129322 },
  { name: 'Yemen', coords: [48.5164, 15.5527], engagement: 804894 },
  { name: 'Kuwait', coords: [47.4818, 29.3117], engagement: 930495 },
  { name: 'Sudan', coords: [30.2176, 12.8628], engagement: 453139 },
  // Increased artificial weight for US, Canada, Australia
  { name: 'United States', coords: [-95.7129, 37.0902], engagement: 258258, artificialWeight: 25000000 },
  { name: 'Qatar', coords: [51.1839, 25.3548], engagement: 226934 },
  { name: 'Bahrain', coords: [50.5577, 26.0667], engagement: 126808 },
  { name: 'Germany', coords: [10.4515, 51.1657], engagement: 90924, artificialWeight: 1360000 },
  { name: 'Sweden', coords: [18.6435, 60.1282], engagement: 84634, artificialWeight: 1360000 },
  { name: 'France', coords: [2.2137, 46.2276], engagement: 69106, artificialWeight: 1360000 },
  { name: 'Canada', coords: [-106.3468, 56.1304], engagement: 67465, artificialWeight: 15000000 },
  { name: 'Australia', coords: [133.7751, -25.2744], engagement: 61510, artificialWeight: 15000000 },
  { name: 'Italy', coords: [12.5674, 41.8719], engagement: 59329, artificialWeight: 1360000 },
  { name: 'United Kingdom', coords: [-3.436, 55.3781], engagement: 45478, artificialWeight: 1360000 },
  { name: 'Netherlands', coords: [5.2913, 52.1326], engagement: 38992, artificialWeight: 1360000 },
  { name: 'India', coords: [78.9629, 20.5937], engagement: 18242 },
  { name: 'Iran', coords: [53.688, 32.4279], engagement: 15372 },
  { name: 'Spain', coords: [-3.7492, 40.4637], engagement: 5268, artificialWeight: 1360000 },
  { name: 'Brazil', coords: [-51.9253, -14.235], engagement: 2933 },
  { name: 'South Africa', coords: [22.9375, -30.5595], engagement: 501 },
  { name: 'Japan', coords: [138.2529, 36.2048], engagement: 415, artificialWeight: 680000 },
  { name: 'China', coords: [104.1954, 35.8617], engagement: 1, artificialWeight: 680000 },
  { name: 'South Korea', coords: [127.7669, 35.9078], engagement: 1, artificialWeight: 680000 },
  { name: 'Philippines', coords: [121.774, 12.8797], engagement: 1, artificialWeight: 680000 },
  // Adding low engagement countries with artificial weight to occasionally pop up
  { name: 'Maldives', coords: [73.2207, 3.2028], engagement: 1, artificialWeight: 800000 },
  { name: 'El Salvador', coords: [-88.8965, 13.7942], engagement: 1, artificialWeight: 800000 },
  { name: 'Liberia', coords: [-9.4295, 6.4281], engagement: 1, artificialWeight: 800000 },
  { name: 'Isle of Man', coords: [-4.5481, 54.2361], engagement: 1, artificialWeight: 800000 },
  { name: 'Jamaica', coords: [-77.2975, 18.1096], engagement: 2, artificialWeight: 800000 },
];

interface Pulse {
  id: string;
  coords: [number, number];
  name: string;
}

export const WorldMapHero: React.FC = () => {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [totalEngagements, setTotalEngagements] = useState(153928120); // starting approx number
  const [showInfo, setShowInfo] = useState(false);

  // Compute total weight using artificialWeight if present, otherwise engagement
  const totalWeight = useMemo(() => countryData.reduce((acc, curr) => acc + (curr.artificialWeight || curr.engagement), 0), []);

  useEffect(() => {
    // Determine random country based on engagement weight
    const getRandomCountry = () => {
      let r = Math.random() * totalWeight;
      for (const country of countryData) {
        const weight = country.artificialWeight || country.engagement;
        if (r < weight) return country;
        r -= weight;
      }
      return countryData[0];
    };

    const intervalId = setInterval(() => {
      // Create 1 to 3 pulses at a time to simulate high activity
      const numPulses = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numPulses; i++) {
        const country = getRandomCountry();
        
        // Add a slight randomization to coordinates so pulses don't perfectly overlap
        const jitterX = (Math.random() - 0.5) * 4;
        const jitterY = (Math.random() - 0.5) * 4;
        
        const newPulse: Pulse = {
          id: Math.random().toString(36).substr(2, 9),
          coords: [country.coords[0] + jitterX, country.coords[1] + jitterY] as [number, number],
          name: country.name
        };

        setPulses(prev => [...prev, newPulse]);
        setTotalEngagements(prev => prev + 1);

        // Remove pulse after animation (1.5s)
        setTimeout(() => {
          setPulses(prev => prev.filter(p => p.id !== newPulse.id));
        }, 1500);
      }
    }, 400); // Trigger new pulses every 400ms

    return () => clearInterval(intervalId);
  }, [totalWeight]);

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#0A0A0A] shadow-2xl border-y border-white/5">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-500 dark:bg-amber-600 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Info Button (Top Left) */}
      <div className="absolute top-6 inset-x-0 w-full max-w-7xl mx-auto px-4 z-40 pointer-events-none">
        <div className="pointer-events-auto w-max">
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all backdrop-blur-md cursor-pointer"
        >
          {showInfo ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </button>
        
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-14 left-4 w-64 p-4 bg-[#1C1C1C]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-left"
            >
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                In the map see people engage with our digital ministry around the world at this very moment. Every pulse represents a life intersecting with the message of hope.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full relative h-[450px] md:h-[550px] lg:h-[600px] opacity-70 flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          width={800}
          height={400}
          projectionConfig={{
            scale: 145,
            center: [0, 20]
          }}
          className="w-full h-full outline-none"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1C1C1C"
                  stroke="#2D2D2D"
                  strokeWidth={0.5}
                  className="outline-none"
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#242424" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Render active pulses */}
          <AnimatePresence>
            {pulses.map((pulse) => (
              <Marker key={pulse.id} coordinates={pulse.coords}>
                {/* Outer expanding ring */}
                <motion.circle
                  initial={{ r: 0, opacity: 0.8 }}
                  animate={{ r: 25, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  fill="rgba(252, 211, 77, 0)" // Rose-500 transparent
                  stroke="rgba(252, 211, 77, 0.8)"
                  strokeWidth={1.5}
                />
                {/* Inner bright dot */}
                <motion.circle
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: 3, opacity: 1 }}
                  exit={{ opacity: 0, r: 0 }}
                  transition={{ duration: 0.3 }}
                  fill="#FCD34D" // Amber-300
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(252, 211, 77, 0.8))' }}
                />
              </Marker>
            ))}
          </AnimatePresence>
        </ComposableMap>
      </div>

      {/* TOP OVERLAY - Title & Text */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center pointer-events-none px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
            Souls Touched in Real Time
          </h2>
          

        </motion.div>
      </div>

      {/* BOTTOM OVERLAY - Counter */}
      <div className="absolute top-[60%] md:top-[65%] lg:top-[70%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center pointer-events-none px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <p className="text-xs md:text-sm font-serif italic text-white/80 leading-relaxed drop-shadow-md">
            Every month, millions of seekers across the Middle East look for answers, truth, and community online. Join the Better Life Partnership to back frontline media outreach, online follow-up counseling, and local discipleship.
          </p>
          <div className="inline-block px-6 py-3 bg-[#1C1C1C]/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
            <span className="block text-[8px] uppercase tracking-widest font-mono text-white/50 mb-1 drop-shadow-sm">Total Digital Interactions</span>
            <span className="block text-2xl md:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              {totalEngagements.toLocaleString()}
            </span>
          </div>
        </motion.div>
      </div>
      
      {/* Gradient fades for edges */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none" />
    </div>
  );
};
