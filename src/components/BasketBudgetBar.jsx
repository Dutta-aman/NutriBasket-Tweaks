import { computeTargets, fmt } from "../lib/bmi";
import { WarningIcon } from "./icons";

const SWAP_TIPS = {
  calories: "Try swapping a heavy snack for fruit or a wholegrain option",
  sugar: "Swap sweetened drinks for water or unsweetened lassi",
  fat: "Prefer baked or air-fried over fried",
  salt: "Check for low-salt variants of the same brand",
  carbs: "Prefer wholegrain options over refined ones",
};

function sumField(basket, field) {
  return basket.reduce(
    (sum, item) => sum + (Number(item[field]) || 0) * (item.quantity || 1),
    0
  );
}

function pct(share, target) {
  if (target == null || target <= 0) return null;
  return Math.round((share / target) * 100);
}

function BasketBudgetBar({ basket, profile }) {
  const targets = computeTargets(profile);

  if (!profile || !targets) {
    return (
      <p className="budget-note">
        Set up your profile for a daily budget
      </p>
    );
  }

  const totalCalories = sumField(basket, "calories");
  const totalProtein = sumField(basket, "protein");
  const totalCarbs = sumField(basket, "carbs");
  const totalFat = sumField(basket, "fat");
  const totalSugars = sumField(basket, "sugars");
  const totalSalt = sumField(basket, "salt");
  const totalFiber = sumField(basket, "fiber");

  const hasField = (field) => basket.some((item) => item[field] != null);

  const rows = [
    {
      key: "calories",
      label: "Calories",
      value: totalCalories,
      target: targets.calories,
      unit: "kcal",
    },
    {
      key: "protein",
      label: "Protein",
      value: totalProtein,
      target: targets.proteinG,
      unit: "g",
    },
    {
      key: "carbs",
      label: "Carbs",
      value: totalCarbs,
      target: targets.carbsG,
      unit: "g",
    },
    {
      key: "fat",
      label: "Fat",
      value: totalFat,
      target: targets.fatG,
      unit: "g",
    },
  ];

  if (hasField("sugars")) {
    rows.push({
      key: "sugar",
      label: "Sugar",
      value: totalSugars,
      target: targets.sugarG,
      unit: "g",
    });
  }
  if (hasField("salt")) {
    rows.push({
      key: "salt",
      label: "Salt",
      value: totalSalt,
      target: targets.saltG,
      unit: "g",
    });
  }
  if (hasField("fiber")) {
    rows.push({
      key: "fiber",
      label: "Fiber",
      value: totalFiber,
      target: targets.fiberG,
      unit: "g",
    });
  }

  const over = rows.filter(
    (row) => row.key !== "fiber" && (pct(row.value, row.target) ?? 0) > 100
  );

  const tipKey = over.find((row) => SWAP_TIPS[row.key]);

  function fillClass(row) {
    const share = pct(row.value, row.target) ?? 0;
    if (row.key !== "fiber" && share > 100) return "budget-bar-fill danger";
    if (row.key === "calories" && share >= 80) return "budget-bar-fill warn";
    return "budget-bar-fill";
  }

  return (
    <div className="budget-card">

      {over.length > 0 && (
        <div className="budget-warning" role="alert">
          <WarningIcon size={18} />
          <div>
            <strong>Basket over budget</strong>
            <span>
              {over
                .map((row) => `${row.label} ${pct(row.value, row.target)}%`)
                .join(" · ")}
            </span>
          </div>
        </div>
      )}

      <h2 className="budget-title">🎯 Daily Budget</h2>

      {rows.map((row) => {
        const share = pct(row.value, row.target);
        const width = share == null ? 0 : Math.min(share, 100);
        return (
          <div className="budget-row" key={row.key}>
            <div className="budget-row-head">
              <span className="budget-label">{row.label}</span>
              <span className="budget-value">
                {row.key === "calories"
                  ? `${fmt(row.value)} of ${fmt(row.target)} kcal`
                  : `${fmt(row.value)} ${row.unit} / ${fmt(row.target)} ${row.unit}`}
                {share != null && ` · ${share}%`}
              </span>
            </div>
            <div className="budget-bar">
              <span
                className={fillClass(row)}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}

      {tipKey && (
        <p className="budget-tip">💡 {SWAP_TIPS[tipKey.key]}</p>
      )}

    </div>
  );
}

export default BasketBudgetBar;
