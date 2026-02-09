import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X, Clock } from 'lucide-react';
import { WeatherAlert } from '@/types/weather';
import { cn } from '@/lib/utils';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
  selectedCities: string[];
  onDismiss?: (id: string) => void;
}

const severityConfig = {
  low: {
    icon: Info,
    bgClass: 'bg-muted',
    borderClass: 'border-muted-foreground/20',
    iconClass: 'text-muted-foreground',
  },
  moderate: {
    icon: AlertCircle,
    bgClass: 'bg-accent/10',
    borderClass: 'border-accent/30',
    iconClass: 'text-accent',
  },
  high: {
    icon: AlertTriangle,
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive/30',
    iconClass: 'text-destructive',
  },
  extreme: {
    icon: AlertTriangle,
    bgClass: 'bg-destructive/20',
    borderClass: 'border-destructive/50',
    iconClass: 'text-destructive',
  },
};

export const WeatherAlerts = ({ alerts, selectedCities, onDismiss }: WeatherAlertsProps) => {
  console.log(alerts);
  
  const relevantAlerts = alerts.filter((alert) =>
    alert.cities.some((city) => selectedCities.includes(city))
  );

  if (relevantAlerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-accent" />
        Weather Alerts
      </h2>
      
      <AnimatePresence mode="popLayout">
        {relevantAlerts.map((alert, index) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative p-4 rounded-2xl border backdrop-blur-sm',
                config.bgClass,
                config.borderClass
              )}
            >
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}

              <div className="flex gap-3">
                <div className={cn('p-2 rounded-xl', config.bgClass)}>
                  <Icon className={cn('w-5 h-5', config.iconClass)} />
                </div>

                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full',
                      config.bgClass,
                      config.iconClass
                    )}>
                      {alert.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {alert.cities.join(', ')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Expires: {alert.expiresAt}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
