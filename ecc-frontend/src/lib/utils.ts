import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Common Framer Motion variants for reuse
export const fadeIn: any = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const slideIn: any = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const scaleUp: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export function getGamificationProgress(totalPoints: number) {
  const thresholds = [0, 1000, 3000, 6000, 10000, 15000];
  let currentLevel = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= thresholds[i]) {
      currentLevel = i + 1;
      break;
    }
  }
  
  if (currentLevel >= 6) {
    return {
      currentLevel: 6,
      currentPointsInLevel: totalPoints - 15000,
      pointsNeededForNext: 0,
      percentage: 100
    };
  }
  
  const currentLevelThreshold = thresholds[currentLevel - 1];
  const nextLevelThreshold = thresholds[currentLevel];
  const pointsInLevel = totalPoints - currentLevelThreshold;
  const levelTotalPoints = nextLevelThreshold - currentLevelThreshold;
  const pointsNeeded = nextLevelThreshold - totalPoints;
  const percentage = Math.min((pointsInLevel / levelTotalPoints) * 100, 100);
  
  return {
    currentLevel,
    currentPointsInLevel: pointsInLevel,
    pointsNeededForNext: pointsNeeded,
    percentage
  };
}
