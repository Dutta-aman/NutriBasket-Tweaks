import { CheckIcon, LeafIcon } from "./icons";

import { computeBMI, riskProfile, perceptionCase, perceptionMessage } from "../lib/bmi";
import { productRiskFlags } from "../lib/explainer";

function RiskChips({ profile, product }) {

  if (!profile) return null;

  const bmi = computeBMI(profile.weightKg, profile.heightCm);

  if (bmi == null) return null;

  if (Number(profile.age) < 18) {

    return (
      <div className="risk-chips">

        <span className="risk-chip risk-note">
          BMI-for-age applies — adult risk bands not shown
        </span>

        <p className="risk-disclaimer">
          Not medical advice — consult a professional.
        </p>

      </div>
    );

  }

  const message = perceptionMessage(profile, bmi);

  const caseName = perceptionCase(profile, bmi);

  const bandRisks = riskProfile(bmi);

  const flags = productRiskFlags(product);

  if (bandRisks.length === 0 && flags.length === 0 && message == null) return null;

  const accurate = caseName === "accurate";

  return (
    <div className="risk-chips">

      {message ? (
        <p className={"risk-perception" + (accurate ? " risk-perception-ok" : "")}>

          {accurate ? (
            <CheckIcon size={15} />
          ) : (
            <LeafIcon size={15} />
          )}

          <span>
            {message}
          </span>

        </p>
      ) : null}

      {bandRisks.length > 0 ? (
        <div className="risk-chip-row">

          {bandRisks.map((risk) => (
            <span key={risk} className="risk-chip">
              {risk}
            </span>
          ))}

        </div>
      ) : null}

      {flags.length > 0 ? (
        <div className="risk-chip-row">

          {flags.map((flag) => (
            <span key={flag.label} className="risk-chip warn">

              <span className="risk-chip-label">
                {flag.label}
              </span>

              <span className="risk-chip-tip">
                {flag.tip}
              </span>

            </span>
          ))}

        </div>
      ) : null}

      <p className="risk-disclaimer">
        Not medical advice — consult a professional.
      </p>

    </div>
  );

}

export default RiskChips;