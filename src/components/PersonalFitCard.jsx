import { CheckIcon, WarningIcon } from "./icons";

import { computeBMI, bmiCategory, computeTargets, fmt } from "../lib/bmi";
import { explainFit } from "../lib/explainer";
import RiskChips from "./RiskChips";

function PersonalFitCard({ product, profile }) {

  if (!profile) return null;

  const bmi = computeBMI(profile.weightKg, profile.heightCm);

  const targets = computeTargets(profile);

  if (bmi == null || targets == null) {

    return (
      <div className="personal-fit-note">
        Add your height &amp; weight for a personal fit analysis
      </div>
    );

  }

  const explanation = explainFit(profile, product);

  const isWarning =
    explanation.includes("Sugar") ||
    explanation.includes("salt") ||
    explanation.includes("budget");

  const calories = Number(product.calories);

  const hasBar = Number.isFinite(calories) && calories > 0;

  const pct = hasBar
    ? Math.min(100, Math.round((calories / targets.calories) * 100))
    : null;

  return (
    <div className="personal-fit-card">

      <div className="personal-fit-header">

        <span className="personal-fit-title">
          Personal Fit
        </span>

        <span className="personal-fit-chip">
          {bmiCategory(bmi).category} · Indian BMI
        </span>

      </div>

      <p className={"personal-fit-line" + (isWarning ? " personal-fit-warning" : "")}>

        {isWarning ? (
          <WarningIcon size={16} />
        ) : (
          <CheckIcon size={16} />
        )}

        <span>
          {explanation}
        </span>

      </p>

      {hasBar ? (
        <div className="personal-fit-calorie">

          <div className="personal-fit-bar">
            <span style={{ width: `${pct}%` }} />
          </div>

          <span className="personal-fit-caption">
            {fmt(calories)} of {fmt(targets.calories)} kcal daily budget
          </span>

        </div>
      ) : null}

      <RiskChips profile={profile} product={product} />

    </div>
  );

}

export default PersonalFitCard;