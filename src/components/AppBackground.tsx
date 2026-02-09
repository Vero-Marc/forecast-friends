// components/AppBackground.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBackgroundImage } from '@/services/imageService';

interface AppBackgroundProps {
  weatherCondition: string;
}

export const AppBackground = ({ weatherCondition }: AppBackgroundProps) => {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    async function loadImage() {
      try {
        const img = await fetchBackgroundImage(weatherCondition);
        setBgImage(img);
      } catch (err) {
        console.error('Failed to fetch background image:', err);
      }
    }

    loadImage();
  }, [weatherCondition]);

  return (
    <AnimatePresence mode="wait">
      {bgImage && (
        <motion.div
          key={bgImage} // ensures smooth fade when image changes
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
