import { useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import AuthPanel from "../components/AuthPanel";
import { CheckIcon, LeafIcon, TomatoIcon, MushroomIcon } from "../components/icons";
import { Apple, Broccoli, Carrot, Banana, Cherry, Citrus, Leaf, Flower2, Sprout, Barcode } from "lucide-react";

import "./../styles/global.css";
import "./../styles/profile.css";

const GENDERS = [
  ["woman", "Woman"],
  ["man", "Man"],
  ["nonbinary", "Non-binary"],
  ["prefer-not", "Prefer not to say"],
];

const PERCEPTIONS = [
  "Slim / underweight",
  "About right / healthy",
  "A bit heavier than I'd like",
  "Overweight",
  "Very overweight",
  "Not sure",
];

const GOALS = [
  "Lose weight",
  "Get fit / tone up",
  "Build muscle",
  "Eat healthier",
  "Stay healthy",
  "Not sure yet",
];

const ACTIVITIES = [
  ["sedentary", "Sedentary", "Mostly sitting, little exercise"],
  ["light", "Light", "Light exercise 1–3 days a week"],
  ["moderate", "Moderate", "Moderate exercise 3–5 days a week"],
  ["very", "Very active", "Hard exercise 6–7 days a week"],
  ["extra", "Extra active", "Athlete or very physical job"],
];

const AVATARS = [
  ["apple", Apple],
  ["broccoli", Broccoli],
  ["carrot", Carrot],
  ["banana", Banana],
  ["tomato", TomatoIcon],
  ["cherry", Cherry],
  ["mushroom", MushroomIcon],
  ["citrus", Citrus],
  ["leaf", Leaf],
  ["flower", Flower2],
  ["leaf-small", Sprout],
  ["product", Barcode],
];

function cleanNumberInput(value, allowDecimal) {
  let out = allowDecimal ? value.replace(/[^\d.]/g, "") : value.replace(/\D/g, "");
  if (allowDecimal) {
    const dot = out.indexOf(".");
    if (dot !== -1) {
      out = out.slice(0, dot + 1) + out.slice(dot + 1).replace(/\./g, "");
    }
  }
  return out;
}

function parseNumber(value) {
  if (value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const IN_PER_CM = 1 / 2.54;
const FT_PER_CM = 1 / (12 * 2.54);

function cmToFtIn(cm) {
  const ft = Math.floor(cm * FT_PER_CM);
  const inch = Math.round(cm * IN_PER_CM) % 12;
  return { ft, inch };
}

function ftInToCm(ft, inch) {
  return Math.round((ft * 12 + inch) / IN_PER_CM);
}

function Bubble({ label, sub, selected, onSelect, onRemove }) {
  return (
    <span className={"profile-bubble" + (selected ? " profile-bubble--selected" : "")}>
      <button
        type="button"
        className="profile-bubble-main"
        aria-pressed={selected}
        onClick={onSelect}
      >
        <span className="profile-bubble-label-row">
          <span className="profile-bubble-label">{label}</span>
          {selected ? <CheckIcon size={14} className="profile-bubble-check" /> : null}
        </span>
        {sub ? <small className="profile-bubble-sub">{sub}</small> : null}
      </button>
      {selected && onRemove ? (
        <button
          type="button"
          className="profile-bubble-x"
          aria-label={"Remove " + label}
          onClick={onRemove}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

function Profile({ onComplete, onSkip, activeAccount, onSignIn, onSignOut }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [gender, setGender] = useState(null);
  const [perception, setPerception] = useState([]);
  const [goal, setGoal] = useState([]);
  const [activity, setActivity] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [touched, setTouched] = useState({});

  const ageNum = parseNumber(age);
  const weightNum = parseNumber(weight);
  const heightFtNum = parseNumber(heightFt);
  const heightInNum = parseNumber(heightIn);
  const heightNum =
    heightUnit === "cm"
      ? parseNumber(height)
      : heightFtNum !== null && heightInNum !== null
        ? ftInToCm(heightFtNum, heightInNum)
        : null;

  const ageMissing = age.trim() === "";
  const weightMissing = weight.trim() === "";
  const heightMissing =
    heightUnit === "cm"
      ? height.trim() === ""
      : heightFt.trim() === "" || heightIn.trim() === "";

  const ageValid = ageNum !== null && ageNum >= 10 && ageNum <= 100;
  const weightValid = weightNum !== null && weightNum >= 30 && weightNum <= 250;
  const heightValid =
    heightUnit === "cm"
      ? heightNum !== null && heightNum >= 100 && heightNum <= 250
      : heightFtNum !== null &&
        heightInNum !== null &&
        heightFtNum >= 3 &&
        heightFtNum <= 8 &&
        heightInNum >= 0 &&
        heightInNum <= 11;

  let stepValid = true;
  if (step === 1) {
    stepValid = name.trim() !== "" && ageValid && weightValid && heightValid;
  } else if (step === 3) {
    stepValid = activity !== null;
  }

  let nameError = null;
  if (name.trim() === "") nameError = "Please enter your name";

  let ageError = null;
  if (ageMissing) ageError = "Please enter your age";
  else if (!ageValid) ageError = "Age must be between 10 and 100";

  let weightError = null;
  if (weightMissing) weightError = "Please enter your weight";
  else if (!weightValid) weightError = "Weight must be between 30 and 250 kg";

  let heightError = null;
  if (heightMissing) heightError = "Please enter your height";
  else if (!heightValid)
    heightError =
      heightUnit === "cm"
        ? "Height must be between 100 and 250 cm"
        : "Height must be between 3 ft 0 in and 8 ft 11 in";

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function switchHeightUnit(unit) {
    if (unit === heightUnit) return;
    if (unit === "ftin") {
      const cm = parseNumber(height);
      if (cm !== null) {
        const { ft, inch } = cmToFtIn(cm);
        setHeightFt(String(ft));
        setHeightIn(String(inch));
      }
    } else if (heightFtNum !== null && heightInNum !== null) {
      setHeight(String(ftInToCm(heightFtNum, heightInNum)));
    }
    setHeightUnit(unit);
  }

  function syncHeightToCm() {
    if (heightFtNum !== null && heightInNum !== null) {
      setHeight(String(ftInToCm(heightFtNum, heightInNum)));
    }
  }

  function selectGender(value) {
    setGender((prev) => (prev === value ? null : value));
  }

  function togglePerception(label) {
    setPerception((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  }

  function removePerception(label) {
    setPerception((prev) => prev.filter((p) => p !== label));
  }

  function toggleGoal(label) {
    setGoal((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  }

  function removeGoal(label) {
    setGoal((prev) => prev.filter((g) => g !== label));
  }

  function selectActivity(value) {
    setActivity((prev) => (prev === value ? null : value));
  }

  function handleContinue() {
    setTouched({ name: true, age: true, weight: true, height: true });
    if (!stepValid) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!onComplete) return;
    const heightCm = heightValid ? heightNum : null;
    onComplete({
      version: 2,
      name: name.trim(),
      age: ageValid ? ageNum : null,
      weightKg: weightValid ? weightNum : null,
      heightCm,
      gender,
      perception,
      goal,
      activity,
      avatar,
    });
  }

  return (
    <AppLayout>
      <div className="profile-card">
        <div className="profile-header">
            <div className="profile-header-badge">
              <LeafIcon size={26} />
            </div>
            <h1>Your Nutrition Profile</h1>
            <p>Three quick steps so your recommendations fit you.</p>
          </div>

          <div className="profile-steps">
            <span className="profile-step-count">Step {step} of 3</span>
            <div className="profile-steps-pills">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={"profile-step-pill" + (n <= step ? " is-active" : "")}
                  aria-current={n === step ? "step" : undefined}
                />
              ))}
            </div>
          </div>

          {step === 1 ? (
            <section className="profile-step-content">
              <h2 className="profile-question">About you</h2>
              <p className="profile-hint">A few details so your plan can be tailored to you.</p>

              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-name">
                  Name
                </label>
                <div className="profile-input-wrap">
                  <input
                    id="profile-name"
                    type="text"
                    className="manual-input"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched("name")}
                  />
                </div>
                {touched.name && nameError ? <p className="manual-error">{nameError}</p> : null}
              </div>

            <div className="profile-grid">
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-age">
                  Age
                </label>
                <div className="profile-input-wrap">
                  <input
                    id="profile-age"
                    type="text"
                    className="manual-input"
                    inputMode="numeric"
                    placeholder="e.g. 25"
                    aria-label="Age in years"
                    value={age}
                    onChange={(e) => setAge(cleanNumberInput(e.target.value, false))}
                    onBlur={() => markTouched("age")}
                  />
                  <span className="profile-unit-suffix" aria-hidden="true">
                    years
                  </span>
                </div>
                {touched.age && ageError ? <p className="manual-error">{ageError}</p> : null}
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-weight">
                  Weight
                </label>
                <div className="profile-input-wrap">
                  <input
                    id="profile-weight"
                    type="text"
                    className="manual-input"
                    inputMode="decimal"
                    placeholder="e.g. 70.5"
                    aria-label="Weight in kilograms"
                    value={weight}
                    onChange={(e) => setWeight(cleanNumberInput(e.target.value, true))}
                    onBlur={() => markTouched("weight")}
                  />
                  <span className="profile-unit-suffix" aria-hidden="true">
                    kg
                  </span>
                </div>
                {touched.weight && weightError ? (
                  <p className="manual-error">{weightError}</p>
                ) : null}
              </div>
            </div>

              <div className="profile-field">
                <label className="profile-label" id="profile-height-label">
                  Height
                </label>
                <div className="profile-segmented" role="group" aria-labelledby="profile-height-label">
                  <button
                    type="button"
                    className={"profile-segmented-option" + (heightUnit === "cm" ? " is-active" : "")}
                    aria-pressed={heightUnit === "cm"}
                    onClick={() => switchHeightUnit("cm")}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    className={
                      "profile-segmented-option" + (heightUnit === "ftin" ? " is-active" : "")
                    }
                    aria-pressed={heightUnit === "ftin"}
                    onClick={() => switchHeightUnit("ftin")}
                  >
                    ft/in
                  </button>
                </div>
                {heightUnit === "cm" ? (
                  <div className="profile-input-wrap">
                    <input
                      id="profile-height"
                      type="text"
                      className="manual-input"
                      inputMode="decimal"
                      placeholder="e.g. 165"
                      aria-label="Height in centimetres"
                      value={height}
                      onChange={(e) => setHeight(cleanNumberInput(e.target.value, true))}
                      onBlur={() => markTouched("height")}
                    />
                    <span className="profile-unit-suffix" aria-hidden="true">
                      cm
                    </span>
                  </div>
                ) : (
                  <div className="profile-ftin-row">
                    <div className="profile-input-wrap">
                      <input
                        id="profile-height-ft"
                        type="text"
                        className="manual-input"
                        inputMode="numeric"
                        placeholder="5"
                        aria-label="Height in feet"
                        value={heightFt}
                        onChange={(e) => setHeightFt(cleanNumberInput(e.target.value, false))}
                        onBlur={() => {
                          markTouched("height");
                          syncHeightToCm();
                        }}
                      />
                      <span className="profile-unit-suffix" aria-hidden="true">
                        ft
                      </span>
                    </div>
                    <div className="profile-input-wrap">
                      <input
                        id="profile-height-in"
                        type="text"
                        className="manual-input"
                        inputMode="numeric"
                        placeholder="5"
                        aria-label="Height in inches"
                        value={heightIn}
                        onChange={(e) => setHeightIn(cleanNumberInput(e.target.value, false))}
                        onBlur={() => {
                          markTouched("height");
                          syncHeightToCm();
                        }}
                      />
                      <span className="profile-unit-suffix" aria-hidden="true">
                        in
                      </span>
                    </div>
                  </div>
                )}
                {touched.height && heightError ? (
                  <p className="manual-error">{heightError}</p>
                ) : null}
              </div>

              <div className="profile-section">
                <span className="profile-section-title">Gender</span>
                <p className="profile-hint">Optional — used to calibrate calorie targets.</p>
                <div className="profile-bubbles">
                  {GENDERS.map(([value, label]) => (
                    <Bubble
                      key={value}
                      label={label}
                      selected={gender === value}
                      onSelect={() => selectGender(value)}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="profile-step-content">
              <h2 className="profile-question">Your body &amp; goals</h2>
              <p className="profile-hint">Nothing here is judged — it shapes how we talk to you.</p>

              <span className="profile-section-title">
                How would you describe your body right now?
              </span>
              <div className="profile-bubbles">
                {PERCEPTIONS.map((label) => (
                  <Bubble
                    key={label}
                    label={label}
                    selected={perception.includes(label)}
                    onSelect={() => togglePerception(label)}
                    onRemove={() => removePerception(label)}
                  />
                ))}
              </div>

              <div className="profile-section">
                <span className="profile-section-title">
                  What would you like your body to be?
                </span>
                <div className="profile-bubbles">
                  {GOALS.map((label) => (
                    <Bubble
                      key={label}
                      label={label}
                      selected={goal.includes(label)}
                      onSelect={() => toggleGoal(label)}
                      onRemove={() => removeGoal(label)}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="profile-step-content">
              <h2 className="profile-question">Your lifestyle</h2>

              <span className="profile-section-title">How active is your daily life?</span>
              <div className="profile-bubbles">
                {ACTIVITIES.map(([value, label, sub]) => (
                  <Bubble
                    key={value}
                    label={label}
                    sub={sub}
                    selected={activity === value}
                    onSelect={() => selectActivity(value)}
                  />
                ))}
              </div>

              <div className="profile-section">
                <span className="profile-section-title">Pick a profile icon</span>
                <p className="profile-hint">Your food-themed avatar — skip it if you like.</p>
                <div className="profile-avatar-grid" role="radiogroup" aria-label="Profile icon">
                  {AVATARS.map(([key, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={avatar === key}
                      className={
                        "profile-avatar" + (avatar === key ? " profile-avatar--selected" : "")
                      }
                      onClick={() => setAvatar(key)}
                    >
                      <Icon size={26} />
                      {avatar === key ? (
                        <span className="profile-avatar-badge">
                          <CheckIcon size={11} />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="secondary-btn profile-skip"
                  onClick={() => setAvatar("")}
                >
                  Skip for now
                </button>
              </div>
            </section>
          ) : null}

          <div className="profile-nav">
            {step > 1 ? (
              <button
                type="button"
                className="secondary-btn profile-back"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              className="start-btn premium-btn profile-continue"
              disabled={!stepValid}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>

          {onSkip ? (
            <div className="profile-skip-block">
              <button
                type="button"
                className="secondary-btn profile-skip"
                onClick={onSkip}
              >
                Skip for now
              </button>
              <small>I'll set it up later</small>
            </div>
          ) : null}

          {onSkip ? (
            <button
              type="button"
              className="secondary-btn back-btn"
              onClick={onSkip}
            >
              ← Home
            </button>
          ) : null}

          <div className="profile-section account-section">
            <span className="profile-section-title">Account</span>
            <p className="profile-hint">
              Optional — connect a Google account to keep your profile tied to it on
              this device.
            </p>
            <AuthPanel
              activeAccount={activeAccount}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
            />
          </div>
      </div>
    </AppLayout>
  );
}

export default Profile;
