import { motion } from 'framer-motion';
import { Droplets, Wind, Eye, Gauge, X } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { cn } from '@/lib/utils';

interface WeatherCardProps {
  weather: WeatherData;
  onRemove?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

export const WeatherCard = ({ 
  weather, 
  onRemove, 
  isSelected, 
  onSelect,
  compact = false 
}: WeatherCardProps) => {
  console.log(weather.condition);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => onSelect?.(weather.id)}
      className={cn(
        'glass-card p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        compact ? 'p-4' : 'p-6'
      )}
    >
      {/* Background gradient based on condition */}
      <div className={cn(
        'absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20',
        weather.condition === 'clear' && 'gradient-sunset',
        (weather.condition === 'rain' || weather.condition === 'drizzle' ) && 'gradient-sky',
        weather.condition === 'thunderstorm' && 'gradient-storm',
        (weather.condition === 'clouds' || weather.condition === 'mist' || weather.condition === 'fog' || weather.condition === 'haze' || weather.condition === 'smoke'  ) && 'bg-muted',
        (weather.condition === 'snow' || weather.condition === 'sleet') && 'gradient-snow'
      )} />

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(weather.id);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/50 hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              {weather.city}
            </h3>
            <p className="text-sm text-muted-foreground">{weather.country}</p>
          </div>
          <WeatherIcon condition={weather.condition} size={compact ? 'md' : 'lg'} />
        </div>

        {/* Temperature */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-foreground">
              {weather.temperature}°
            </span>
            <span className="text-muted-foreground text-sm">
              Feels like {weather.feelsLike}°
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            H: {weather.high}° L: {weather.low}°
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/80 mb-4">{weather.description}</p>

        {/* Stats Grid */}
        {!compact && (
          <div className="grid grid-cols-2 gap-3">
            <StatItem icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
            <StatItem icon={Wind} label="Wind" value={`${weather.windSpeed} km/h`} />
            <StatItem icon={Eye} label="Visibility" value={`${weather.visibility} km`} />
            <StatItem icon={Gauge} label="Pressure" value={`${weather.pressure} hPa`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const StatItem = ({ icon: Icon, label, value }: StatItemProps) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
    <Icon className="w-4 h-4 text-primary" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);
