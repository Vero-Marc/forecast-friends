import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudSun } from 'lucide-react';
import { WeatherCondition } from '@/types/weather';
import { cn } from '@/lib/utils';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const colorMap: Record<WeatherCondition, string> = {
  sunny: 'text-weather-sunny',
  cloudy: 'text-weather-cloudy',
  rainy: 'text-weather-rainy',
  stormy: 'text-weather-stormy',
  snowy: 'text-weather-snowy',
  'partly-cloudy': 'text-weather-sunny',
};

export const WeatherIcon = ({ condition, size = 'md', className, animated = true }: WeatherIconProps) => {
  const baseClasses = cn(
    sizeMap[size],
    colorMap[condition],
    animated && 'transition-transform duration-300',
    className
  );

  const iconProps = {
    className: cn(baseClasses, animated && condition === 'sunny' && 'animate-pulse-soft'),
    strokeWidth: 1.5,
  };

  switch (condition) {
    case 'sunny':
      return <Sun {...iconProps} />;
    case 'cloudy':
      return <Cloud {...iconProps} />;
    case 'rainy':
      return <CloudRain {...iconProps} />;
    case 'stormy':
      return <CloudLightning {...iconProps} />;
    case 'snowy':
      return <Snowflake {...iconProps} />;
    case 'partly-cloudy':
      return <CloudSun {...iconProps} />;
    default:
      return <Sun {...iconProps} />;
  }
};
