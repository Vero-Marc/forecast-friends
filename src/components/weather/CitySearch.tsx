import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin } from 'lucide-react';
import { availableCities } from '@/data/mockWeather';
import { cn } from '@/lib/utils';

interface CitySearchProps {
  onAddCity: (city: string) => void;
  addedCities: string[];
}

export const CitySearch = ({ onAddCity, addedCities }: CitySearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCities = availableCities.filter(
    (city) =>
      city.toLowerCase().includes(query.toLowerCase()) &&
      !addedCities.includes(city)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCity = (city: string) => {
    onAddCity(city);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search cities to compare..."
          className={cn(
            'w-full pl-12 pr-4 py-3 rounded-2xl',
            'bg-card/80 backdrop-blur-xl border border-border',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'transition-all duration-200'
          )}
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredCities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 py-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-card-hover overflow-hidden z-50"
          >
            <div className="max-h-64 overflow-y-auto">
              {filteredCities.map((city, index) => (
                <motion.button
                  key={city}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleAddCity(city)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-foreground">{city}</span>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {isOpen && query && filteredCities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-card text-center"
          >
            <p className="text-muted-foreground">No cities found matching "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
