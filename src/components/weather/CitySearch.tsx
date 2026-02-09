import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin } from 'lucide-react';
import { searchCities } from '@/services/cityService';
import { mapToCity } from '@/utils/mapWeather';
import { City } from '@/types/weather';
import { cn } from '@/lib/utils';

interface CitySearchProps {
  onAddCity: (city: City) => void;
  addedCities: City[];
}

export const CitySearch = ({ onAddCity, addedCities }: CitySearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🔁 Debounced API search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      const data = await searchCities(query);
      setResults(data.map(mapToCity));
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // ❌ Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredResults = results.filter(
    city => !addedCities.some(c => c.id === city.id)
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="Search cities to compare..."
        className={cn(
          'w-full pl-12 pr-4 py-3 rounded-2xl',
          'bg-card/80 backdrop-blur-xl border border-border'
        )}
      />

      <AnimatePresence>
        {isOpen && filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-lg z-50"
          >
            {filteredResults.map(city => (
              <button
                key={city.id}
                onClick={() => {
                  onAddCity(city);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{city.name}, {city.country}</span>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
