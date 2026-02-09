import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { cn } from '@/lib/utils';


interface ComparisonMetric {
  label: string;
  key: keyof WeatherData;
  unit: string;
  higherIsBetter?: boolean;
}

const metrics: ComparisonMetric[] = [
  { label: 'Temperature', key: 'temperature', unit: '°C' },
  { label: 'Feels Like', key: 'feelsLike', unit: '°C' },
  { label: 'Humidity', key: 'humidity', unit: '%', higherIsBetter: false },
  { label: 'Wind Speed', key: 'windSpeed', unit: 'km/h', higherIsBetter: false },
  { label: 'UV Index', key: 'uvIndex', unit: '', higherIsBetter: false },
  { label: 'Visibility', key: 'visibility', unit: 'km', higherIsBetter: true },
];

export const WeatherComparison = ({ cities }) => {
  if (cities.length < 2) {
    return (
      <div className="glass-card p-8 text-center">
        <ArrowUpDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          Compare Cities
        </h3>
        <p className="text-muted-foreground">
          Add at least 2 cities to see a detailed comparison
        </p>
      </div>
    );
  }

  const getMinMax = (key: keyof WeatherData) => {
    const values = cities.map((c) => c[key] as number);
    return { min: Math.min(...values), max: Math.max(...values) };
  };

  const getTrend = (value: number, metric: ComparisonMetric) => {
    const { min, max } = getMinMax(metric.key);
    if (value === max && value !== min) {
      return metric.higherIsBetter ? 'best' : 'highest';
    }
    if (value === min && value !== max) {
      return metric.higherIsBetter === false ? 'best' : 'lowest';
    }
    return 'neutral';
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <ArrowUpDown className="w-5 h-5 text-primary" />
        City Comparison
      </h2>

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="glass-card overflow-hidden min-w-max">
          {/* Header Row */}
          <div className="grid grid-flow-col auto-cols-fr border-b border-border">
            <div className="p-4 bg-muted/30 font-medium text-muted-foreground">
              Metric
            </div>
            {cities.map((city) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 text-center border-l border-border bg-muted/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <WeatherIcon condition={city.condition} size="sm" />
                  <span className="font-display font-semibold text-foreground">
                    {city.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Data Rows */}
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'grid grid-flow-col auto-cols-fr',
                index !== metrics.length - 1 && 'border-b border-border'
              )}
            >
              <div className="p-4 text-muted-foreground font-medium">
                {metric.label}
              </div>
              {cities.map((city) => {
                const value = city[metric.key] as number;
                const trend = getTrend(value, metric);

                return (
                  <div
                    key={`${city.id}-${metric.key}`}
                    className={cn(
                      'p-4 text-center border-l border-border flex items-center justify-center gap-2',
                      trend === 'best' && 'bg-primary/5',
                      trend === 'highest' && 'bg-accent/5',
                      trend === 'lowest' && 'bg-muted/30'
                    )}
                  >
                    <span className="font-semibold text-foreground">
                      {value}{metric.unit}
                    </span>
                    {trend === 'highest' && (
                      <TrendingUp className="w-4 h-4 text-accent" />
                    )}
                    {trend === 'lowest' && (
                      <TrendingDown className="w-4 h-4 text-primary" />
                    )}
                    {trend === 'best' && (
                      <span className="text-xs text-primary font-medium">Best</span>
                    )}
                    {trend === 'neutral' && (
                      <Minus className="w-4 h-4 text-muted-foreground opacity-50" />
                    )}
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
