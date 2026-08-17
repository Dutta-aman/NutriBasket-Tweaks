const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

const DEFAULT_ACTIVITY_FACTOR = 1.375;

const MALE_BMR_CONSTANT = 5;
const FEMALE_BMR_CONSTANT = -161;
const NEUTRAL_BMR_CONSTANT = -78;

const CATEGORIES = [
  { max: 18.5, category: "Underweight", risk: "moderate — malnutrition, osteoporosis" },
  { max: 23, category: "Normal", risk: "low — minimal metabolic risk" },
  { max: 25, category: "Overweight", risk: "increased — pre-diabetes, dyslipidemia" },
  { max: 30, category: "Obese I", risk: "high — T2D, HTN, NAFLD" },
  { max: Infinity, category: "Obese II", risk: "very high — CVD, stroke, sleep apnea" },
];

export function computeBMI(weightKg, heightCm) {
  if (!weightKg || weightKg <= 0 || !heightCm || heightCm <= 0) return null;
  const meters = heightCm / 100;
  const bmi = weightKg / (meters * meters);
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return null;
  const match = CATEGORIES.find((band) => bmi < band.max) ?? CATEGORIES[CATEGORIES.length - 1];
  return { category: match.category, risk: match.risk };
}

export function computeBmr(profile) {
  if (!profile) return null;
  const weightKg = profile.weightKg;
  const heightCm = profile.heightCm;
  const age = profile.age;
  if (!weightKg || weightKg <= 0 || !heightCm || heightCm <= 0 || !age || age <= 0) return null;
  const gender = String(profile.gender ?? "").toLowerCase();
  const constant =
    gender === "man" ? MALE_BMR_CONSTANT : gender === "woman" ? FEMALE_BMR_CONSTANT : NEUTRAL_BMR_CONSTANT;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + constant;
}

export function activityFactor(activity) {
  if (typeof activity !== "string") return DEFAULT_ACTIVITY_FACTOR;
  return ACTIVITY_FACTORS[activity.toLowerCase()] ?? DEFAULT_ACTIVITY_FACTOR;
}

export function computeTargets(profile) {
  const bmrRaw = computeBmr(profile);
  if (bmrRaw == null) return null;
  const bmr = Math.round(bmrRaw);
  const tdee = Math.round(bmrRaw * activityFactor(profile.activity));
  const goals = Array.isArray(profile.goal) ? profile.goal : [];
  const losing = goals.includes("Lose weight");
  const gaining = goals.includes("Build muscle");

  let calories;
  let caloriesNote;
  if (losing) {
    calories = tdee - 400;
    caloriesNote = "Weight-loss plan — 400 kcal below your daily TDEE";
  } else if (gaining) {
    calories = tdee + 400;
    caloriesNote = "Muscle-gain plan — 400 kcal above your daily TDEE";
  } else {
    calories = tdee;
    caloriesNote = "Maintenance plan — your daily TDEE";
  }
  calories = Math.min(calories, tdee + 500);
  calories = Math.max(calories, tdee - 1000);

  const bmi = computeBMI(profile.weightKg, profile.heightCm);
  let proteinG;
  if (bmi != null && bmi >= 23) {
    const capWeight = bmi > 30 ? 30 * Math.pow(profile.heightCm / 100, 2) : profile.weightKg;
    proteinG = Math.round(1.4 * capWeight);
  } else {
    proteinG = Math.round(0.8 * profile.weightKg);
  }

  return {
    bmr,
    tdee,
    calories,
    proteinG,
    carbsG: Math.round((0.55 * calories) / 4),
    fatG: Math.round((0.25 * calories) / 9),
    fiberG: 30,
    sugarG: Math.round((0.1 * calories) / 4),
    saltG: 5,
    caloriesNote,
  };
}

export function fmt(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

const RISK_BANDS = [
  { max: 18.5, risks: ["Malnutrition", "Osteoporosis"] },
  { max: 23, risks: [] },
  { max: 25, risks: ["Pre-diabetes", "Dyslipidemia"] },
  { max: 30, risks: ["Type 2 diabetes", "Hypertension", "NAFLD"] },
  { max: Infinity, risks: ["Cardiovascular disease", "Stroke", "Sleep apnea"] },
];

const UNDER_PERCEPTIONS = ["About right / healthy", "Slim / underweight"];
const OVER_PERCEPTIONS = ["Overweight", "Very overweight"];

export function riskProfile(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return [];
  const band = RISK_BANDS.find((b) => bmi < b.max) ?? RISK_BANDS[RISK_BANDS.length - 1];
  return band.risks;
}

export function perceptionCase(profile, bmi) {
  if (!profile || bmi == null || Number.isNaN(bmi)) return null;
  const perceptions = Array.isArray(profile.perception) ? profile.perception : [];
  if (perceptions.length === 0) return null;
  if (bmi >= 23 && perceptions.some((p) => UNDER_PERCEPTIONS.includes(p))) return "under";
  if (bmi < 23 && perceptions.some((p) => OVER_PERCEPTIONS.includes(p))) return "over";
  return "accurate";
}

export function perceptionMessage(profile, bmi) {
  const caseName = perceptionCase(profile, bmi);
  if (caseName === "under") {
    return "Your measured BMI suggests more than your current feeling — small, staged changes will help.";
  }
  if (caseName === "over") {
    return "You're within a healthy band — focus on maintaining, not losing.";
  }
  if (caseName === "accurate") {
    return "Your body sense matches your measured BMI — steady progress works.";
  }
  return null;
}
