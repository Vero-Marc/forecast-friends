import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, MapPin, RefreshCw } from "lucide-react";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { CitySearch } from "@/components/weather/CitySearch";
import { WeatherAlerts } from "@/components/weather/WeatherAlerts";
import { WeatherAdvice } from "@/components/weather/WeatherAdvice";
import { WeatherComparison } from "@/components/weather/WeatherComparison";
import { mockCities, mockAlerts } from "@/data/mockWeather";
import { City, WeatherData } from "@/types/weather";
import {
  fetchWeatherAlerts,
  fetchWeatherByCoords,
} from "@/services/weatherService";
import { getCurrentLocation } from "@/utils/geoLocation";
import { getCityFromCoords } from "@/services/cityService";
import { mapToWeatherAlerts, mapToWeatherData } from "@/utils/mapWeather";

const Index = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [selectedCities, setSelectedCities] = useState<City[]>([]);

  const handleAddCity = async (city: City) => {
    setSelectedCities((prev) => [...prev, city]);

    const weatherRes = await fetchWeatherByCoords(city.lat, city.lon);
    setWeather((prev) => [...prev, mapToWeatherData(weatherRes)]);
  };

  const handleRemoveCity = (id: string) => {
    setSelectedCities((prev) => prev.filter((c) => c.id !== id));
    setWeather((prev) => prev.filter((w) => w.id !== id));
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  // if (loading) return <p>Loading...</p>;

  const [query, setQuery] = useState("");

  const selectedCityNames = selectedCities.map((city) => city.name);

  useEffect(() => {
    async function init() {
      try {
        const position = await getCurrentLocation();
        const { latitude, longitude } = position.coords;

        const lat = latitude;
        const lon = longitude;

        const cityData = await getCityFromCoords(lat, lon);

        const city: City = {
          id: `${lat}-${lon}`,
          name: cityData.name,
          country: cityData.country,
          lat,
          lon,
        };

        setSelectedCities([city]);

        const weatherRes = await fetchWeatherByCoords(lat, lon);
        const weatherData = mapToWeatherData(weatherRes);
        weatherData.isCurrentLocation = true;

        setWeather([weatherData]);

        const alertsRes = await fetchWeatherAlerts(lat, lon);
        setAlerts(mapToWeatherAlerts(alertsRes.alerts));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="p-2 rounded-xl gradient-sky">
                  <Cloud className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">
                    WeatherCompare
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Compare weather across cities
                  </p>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl glass-card hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Search Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {selectedCities.length} cities selected
                </span>
              </div>
              <CitySearch
                onAddCity={handleAddCity}
                addedCities={selectedCities}
              />
            </motion.section>

            {/* Alerts Section */}
            <AnimatePresence>
              {alerts.length > 0 && selectedCities.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WeatherAlerts
                    alerts={alerts}
                    selectedCities={selectedCityNames}
                    onDismiss={handleDismissAlert}
                  />
                </motion.section>
              )}
            </AnimatePresence>

            {/* Weather Cards Grid */}
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                Current Weather
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {weather.map((city) => (
                    <WeatherCard
                      key={city.id}
                      weather={city}
                      // onRemove={handleRemoveCity}
                      onRemove={!weather.isCurrentLocation ? handleRemoveCity : undefined}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {selectedCities.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No Cities Selected
                  </h3>
                  <p className="text-muted-foreground">
                    Search and add cities above to see weather information
                  </p>
                </motion.div>
              )}
            </section>

            {/* Comparison Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <WeatherComparison cities={selectedCities} />
            </motion.section>

            {/* Weather Advice Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WeatherAdvice weatherData={weather} />
            </motion.section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 backdrop-blur-md bg-background/80 py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Weather data is simulated for demonstration purposes
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
