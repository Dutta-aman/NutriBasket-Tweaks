import { useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import {
  CheckIcon,
  LeafIcon,
  AppleIcon,
  BroccoliIcon,
  CarrotIcon,
  BananaIcon,
  TomatoIcon,
  CherryIcon,
  MushroomIcon,
  CitrusIcon,
  FlowerIcon,
  LeafSmallIcon,
  ProductIcon,
} from "../components/icons";

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
  ["apple", AppleIcon],
  ["broccoli", BroccoliIcon],
  ["carrot", CarrotIcon],
  ["banana", BananaIcon],
  ["tomato", TomatoIcon],
  ["cherry", CherryIcon],
  ["mushroom", MushroomIcon],
  ["citrus", CitrusIcon],
  ["leaf", LeafIcon],
  ["flower", FlowerIcon],
  ["leaf-small", LeafSmallIcon],
  ["product", ProductIcon],
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

function Profile({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnknown, setHeightUnknown] = useState(false);
  const [gender, setGender] = useState(null);
  const [perception, setPerception] = useState([]);
  const [goal, setGoal] = useState([]);
  const [activity, setActivity] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [touched, setTouched] = useState({});

  const ageNum = parseNumber(age);
  const weightNum = parseNumber(weight);
  const heightNum = heightUnknown ? null : parseNumber(height);

  const ageMissing = age.trim() === "";
  const weightMissing = weight.trim() === "";
  const heightMissing = !heightUnknown && height.trim() === "";

  const ageValid = ageNum !== null && ageNum >= 10 && ageNum <= 100;
  const weightValid = weightNum !== null && weightNum >= 30 && weightNum <= 250;
  const heightValid =
    heightUnknown || (heightNum !== null && heightNum >= 100 && heightNum <= 250);

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
  else if (!heightValid) heightError = "Height must be between 100 and 250 cm";

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
    let heightCm = null;
    if (!heightUnknown && heightValid) heightCm = heightNum;
    onComplete({
      version: 1,
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
      <div className="profile-card pixel-reveal" style={{ "--d": "0.1s" }}>
        <div className="pixel-reveal-inner">
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
                {touched.name && nameError ? <p className="manual-error">{nameError}</p> : null}
              </div>

              <div className="profile-grid">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="profile-age">
                    Age
                  </label>
                  <div className="profile-input-row">
                    <input
                      id="profile-age"
                      type="text"
                      className="manual-input"
                      inputMode="numeric"
                      placeholder="e.g. 25"
                      value={age}
                      onChange={(e) => setAge(cleanNumberInput(e.target.value, false))}
                      onBlur={() => markTouched("age")}
                    />
                    <span className="profile-unit">years</span>
                  </div>
                  {touched.age && ageError ? <p className="manual-error">{ageError}</p> : null}
                </div>

                <div className="profile-field">
                  <label className="profile-label" htmlFor="profile-weight">
                    Weight
                  </label>
                  <div className="profile-input-row">
                    <input
                      id="profile-weight"
                      type="text"
                      className="manual-input"
                      inputMode="decimal"
                      placeholder="e.g. 70.5"
                      value={weight}
                      onChange={(e) => setWeight(cleanNumberInput(e.target.value, true))}
                      onBlur={() => markTouched("weight")}
                    />
                    <span className="profile-unit">kg</span>
                  </div>
                  {touched.weight && weightError ? (
                    <p className="manual-error">{weightError}</p>
                  ) : null}
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-height">
                  Height
                  <small>— you can skip this if you don't know it</small>
                </label>
                <div className="profile-input-row">
                  <input
                    id="profile-height"
                    type="text"
                    className="manual-input"
                    inputMode="decimal"
                    placeholder="e.g. 165"
                    value={height}
                    disabled={heightUnknown}
                    onChange={(e) => setHeight(cleanNumberInput(e.target.value, true))}
                    onBlur={() => markTouched("height")}
                  />
                  <span className="profile-unit">cm</span>
                </div>
                <label className="profile-check">
                  <input
                    type="checkbox"
                    checked={heightUnknown}
                    onChange={(e) => setHeightUnknown(e.target.checked)}
                  />
                  <span>I don't know my height</span>
                </label>
                {heightUnknown ? (
                  <p className="profile-note" role="note">
                    No problem — without your height we can't calculate a BMI, so you'll get
                    generic guidance instead: general nutrition targets and tips, without
                    personal-fit scores on products.
                  </p>
                ) : null}
                {!heightUnknown && touched.height && heightError ? (
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
        </div>
      </div>
    </AppLayout>
  );
}

export default Profile;
