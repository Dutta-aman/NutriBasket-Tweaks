import { computeBMI, computeTargets } from "./bmi.js";

const GENERIC_MESSAGE = "Add your height & weight for a personal fit analysis";
const LOW_FIBER_MESSAGE = "Low in fiber — pair it with dal or fruit";
const NO_DATA_MESSAGE = "Not enough nutrition data on this product";

function pct(share, total) {
  if (total == null || total <= 0) return null;
  return Math.round((share / total) * 100);
}

export function explainFit(profile, product) {
  const profileData = profile ?? {};
  const productData = product ?? {};
  if (computeBMI(profileData.weightKg, profileData.heightCm) == null) return GENERIC_MESSAGE;

  const targets = computeTargets(profileData);
  if (targets == null) return GENERIC_MESSAGE;

  const losing = Array.isArray(profileData.goal) && profileData.goal.includes("Lose weight");

  const sugars = productData.sugars;
  if (sugars != null && sugars > targets.sugarG * 0.1) {
    return `Sugar ${sugars} g/100 g — ${pct(sugars, targets.sugarG)}% of your daily sugar limit`;
  }
  const salt = productData.salt;
  if (salt != null && salt > 2) {
    return `Salt ${salt} g/100 g — ${pct(salt, targets.saltG)}% of your daily salt limit`;
  }
  const satfat = productData.satfat;
  if (satfat != null && satfat > 5) {
    return `Saturated fat ${satfat} g/100 g — ${pct(satfat, targets.fatG)}% of your daily fat limit`;
  }

  const protein = productData.protein;
  if (protein != null && pct(protein, targets.proteinG) >= 20) {
    return `Covers ${pct(protein, targets.proteinG)}% of your daily protein target — good for your ${targets.proteinG} g goal`;
  }

  const calories = productData.calories;
  if (calories != null && pct(calories, targets.calories) >= 15) {
    const plan = losing ? "weight-loss plan" : "plan";
    return `Uses ${pct(calories, targets.calories)}% of your daily calorie budget — fits your ${targets.calories} kcal ${plan}`;
  }

  const fiber = productData.fiber;
  if (fiber != null && fiber < 3) return LOW_FIBER_MESSAGE;

  if (calories != null) return `Fits your ${targets.calories} kcal daily plan`;

  return NO_DATA_MESSAGE;
}
