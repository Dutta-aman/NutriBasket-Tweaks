# BMI-Based Personalized Nutrition — Plan & Novelty

> Working document. Novelty analysis lives here; the implementation plan is tracked in
> PRs on this repo (see the "BMI plan" PR).

## 1. The Idea

The user sets up a **profile** (name, age, weight, gender, body perception, body goal,
food-themed avatar). The app calculates their **BMI** and recommends **nutritional value
ranges** (calories, protein, carbs, fat, fiber, sugar, salt) appropriate for that BMI value,
then scores and **recommends scanned products that fit those ranges**.

Example: an overweight user scans many products. The app still shows all nutrition values, but
suggests only the products suitable for their BMI-based ranges (fits a weight-loss budget,
enough protein, not too much sugar/salt).

## 2. The User Profile (setup screen)

### 2.1 Fields

| Field | Input | Spec |
|---|---|---|
| Name | text | `autocomplete="name"` |
| Age | number | 10–100, `inputmode="numeric"` |
| Weight | number | 30–250 kg, `inputmode="decimal"` step 0.1, unit label "kg" |
| Gender | selection | Woman / Man / Non-binary / Prefer not to say (optional; used to calibrate calorie targets) |

Profile flow fits as `Welcome → Profile → Home`; 3-step multi-step form (About you → Body →
Preferences), progress indicator ("Step 2 of 3"), inline validation on blur + step exit.

### 2.2 Body perception — "How would you describe your body right now?"

Bubble (chip) selection, multi-select optional — tap to select, tap a selected bubble again to
unselect, and each selected bubble shows a small **× cross mark** to undo the selection:

- Slim / underweight
- About right / healthy
- A bit heavier than I'd like
- Overweight
- Very overweight
- Not sure

### 2.3 Body goal — "What would you like your body to be?" (user-friendly wording)

Same bubble pattern:

- Lose weight
- Get fit / tone up
- Build muscle
- Eat healthier
- Stay healthy
- Not sure yet

### 2.4 Styling

- Bubbles use the **webpage theme color** (emerald). Selected: emerald fill + white text +
  check icon + small × to undo; unselected: light emerald outline.
- Contrast: selected fill `#047857` (emerald-700) with white text (~5:1, WCAG AA); focus
  rings via `:focus-visible` with emerald-700 outline. (Research: emerald-500 #10B981 fails
  WCAG at 2.5:1 — use emerald-700.)

### 2.5 Food-themed avatar

- User picks a **profile icon from a food set** (fruits, vegetables, meat, etc.) as SVG line
  icons (Lucide-style, 24px grid, currentColor) — not emoji.
- 4-column grid, single-select, selected cell = emerald ring + corner check badge,
  `role="radiogroup"` semantics. Optional step with "Skip" affordance.

### 2.6 Perceived vs measured BMI (the insight behind the bubbles)

Research: 40–60% of overweight people misperceive their weight as normal (CDC/Asian cutoffs;
62% of Chinese overweight youth misperceived). Comparing measured BMI (Indian cutoffs) with
the user's self-perception gives 3 cases:

- **Accurate perception** → normal targeting
- **Under-perception** (measured overweight, user says "about right") → gentle education,
  staged goals, no alarmist messaging
- **Over-perception** (measured normal, user feels overweight) → reassurance + maintenance
  focus, never a deficit plan

### 2.7 Account persistence (optional, non-coercive)

Profile is temporary by default (stored in the browser — no account, no backend changes).
At the end of setup, after the BMI result is shown, one optional prompt:

> "Want your profile to stay on this device and with you everywhere? Connect with Google to
> keep your plan."

with a prominent **"Skip for now"** (primary-looking secondary action, never forced; studies
show forced accounts cause ~20–24% abandonment).

Implementation (when we get there): Google Identity Services (GIS) button, client-side
`jwt-decode` of the ID token, profile JSON saved to localStorage keyed by the Google `sub`
claim. No server verification needed for this convenience layer (~2 KB profile, localStorage
fits easily). Users who skip keep the anonymous localStorage profile. ("saved on this device"
wording; Google is a convenience/save layer, not an auth boundary.)

## 3. The Science (how it is done)

### 3.1 BMI

```
BMI = weight (kg) / height (m)²
```

**Indian (ICMR/IDF) cutoffs** — Indians carry metabolic risk at lower BMI ("thin-fat Indian"
phenotype), so the app should use Indian, not WHO, cutoffs:

| Category | WHO | Indian (ICMR) |
|---|---|---|
| Underweight | < 18.5 | < 18.5 |
| Normal | 18.5–24.9 | 18.5–22.9 |
| Overweight | 25.0–29.9 | 23.0–24.9 |
| Obese I | 30.0–34.9 | 25.0–29.9 |
| Obese II | ≥ 35 | ≥ 30 |

Risk band (Indian): <18.5 moderate (malnutrition/osteoporosis), 18.5–22.9 low,
23.0–24.9 increased (pre-diabetes, dyslipidemia), 25.0–29.9 high (T2D, HTN, NAFLD),
≥30 very high (CVD, stroke, sleep apnea).

### 3.2 Daily calories

**BMR — Mifflin-St Jeor:**
```
Male:   BMR = 10×W + 6.25×H − 5×A + 5
Female: BMR = 10×W + 6.25×H − 5×A − 161
```
**TDEE = BMR × activity factor** (sedentary 1.2 · light 1.375 · moderate 1.55 · very active 1.725 · extra 1.9).

**Goal adjustment:** maintenance = TDEE; lose = TDEE − 300–500 kcal; gain = TDEE + 300–500 kcal.
Never below ~BMR; cap deficit at 1000 kcal.

Worked example — 30 y/o male, 90 kg, 170 cm:
- BMI = 31.1 → Indian **Obese II**
- BMR = 1817.5 kcal; TDEE (sedentary) = 2181 kcal
- Weight-loss target ≈ **1680 kcal/day**

### 3.3 Macros (ICMR-NIN 2024 + WHO)

| Nutrient | Target |
|---|---|
| Protein | 0.8 g/kg floor; 1.2–1.6 g/kg for obese/weight-loss users (weight capped at BMI-30 equivalent) |
| Carbs | 50–60% of energy |
| Fat | 20–30% of energy (sat < 10%, trans < 1%) |
| Fiber | ≥ 30 g/day (ICMR) |
| Sugar | < 10% energy, ideally < 5% |
| Salt | < 5 g/day (sodium < 2000 mg) |

### 3.4 What exists today

- MyFitnessPal / HealthifyMe: food diary + daily budget (Mifflin-St Jeor, ±500 kcal)
- Yuka / Fooducate / Nutri-Score: static per-product scores, identical for every user
- Diabetes scanners (SugarSimple, GoCoCo): fixed condition cut-offs, not derived from the user
- Somatotype quizzes (ecto/meso/endomorph): body-perception quizzes feeding generic plans;
  no app compares perception against measured BMI

## 4. The Novelty (what makes this different)

**Nobody mainstream combines "BMI-derived targets automatically" + "instant per-scan scoring" +
"Indian ICMR-2024 grounding" + "perceived vs measured BMI comparison".** The novel blocks:

1. **Personal Fit % per scan** — each product scored against targets derived automatically from
   the user's body stats (weight/height/age/sex/activity), shown as a fit rating using the
   product's share of the user's *remaining* daily calories/protein/carbs/fat. Scanner-first,
   zero food diary. (forme/Xume personalize by self-chosen priorities; MyNetDiary needs a
   diary; Yuka/Fooducate are static.)
2. **Basket-vs-budget conflict detection + swaps** — the basket's running totals (already
   computed in the app) are compared with the user's daily targets; when the basket would blow
   the budget, warn and suggest lighter alternatives from the same product category. No
   mainstream scanner app does this.
3. **ICMR-2024 risk-reduction layer for Indian packaged foods** — BMI band → flagged risks
   (e.g. obese → T2D/CVD → prioritize fiber ≥ 3 g/100 g, low sugar, low salt) shown as chips on
   the product page with one-line deterministic explanations and Indian-diet tips. An
   India-specific scientific anchor (ICMR-NIN 2024) no global app has.
4. **Perceived vs measured BMI comparison** — 40–60% of overweight people misperceive their
   weight; using the perception bubbles to calibrate messaging (gentle education vs
   reassurance vs normal targeting) is not done by mainstream apps.

**Cross-cutting differentiator:** privacy-first — the profile never leaves the device unless
the user opts into Google save (client-side computation + localStorage), a talking point under
India's DPDP Act.

## 4.5 The Explainer — deterministic, no LLM needed for the one-liner

Research (Aug 2026) confirmed hosted-LLM options (Gemini Flash free tier 1,500 req/day, Groq
free, both $0 for a student project) and ruled out self-hosting on Render (512 MB) / Vercel
(250 MB bundle). **Decision: the "why this product fits your profile" one-liner is
deterministic — a template filled with computed numbers, not generated text.**

Why deterministic wins: (1) accuracy is guaranteed — the numbers come from arithmetic
(profile targets ÷ product per-100 g data), and LLMs are documented to hallucinate values and
fail arithmetic on nutrition (Lancet Digital Health 2024; no generative AI is FDA-cleared as a
medical device); (2) zero cost, zero latency, works offline, no API key, no rate limits;
(3) testable — same profile + product always yields the same message.

How it works — the engine picks the message by **dominant factor**:

```
"Covers 38% of your remaining protein target — good for your 120 g goal"
"Uses 12% of your daily calorie budget — fits your 1,680 kcal weight-loss plan"
"Sugar 22 g/100 g — that's 44% of your daily sugar limit"
"Low in fiber — pair it with dal or fruit"
```

Rule set: if protein % is the biggest differentiator → protein message; if the product blows
the sugar/salt/fat limit → warning message; if calories share is notable → budget message;
if fiber is low → tip message. Every number is computed; the template is static.

Future AI (optional, after BMI): an LLM could only *rephrase* this same message — it adds
flavor, never accuracy — so it is **reserved for a future chat / meal-planning feature** and
must stay grounded in the deterministic numbers (deterministic guardrails + LLM as explainer),
keyed server-side in Render env, JSON-schema-constrained output, client-cached, with a
"not medical advice" disclaimer. Not needed for the core recommendation feature.

## 5. Feasibility (verified against the codebase)

- **Seed DB already contains** `energy_kcal, fat, satfat, carbs, sugars, fiber, proteins, salt,
  serving_size` (per-100 g) for 500 Indian products — but both normalizers currently drop them:
  - `server/lib/seed.js` (findInSeed) maps only calories/protein/carbs/fat
  - `server/lib/off.js` (normalizeProduct) discards fiber/sugars/salt/sat-fat from OFF India
  - Fix: ~4 extra mapping lines per normalizer
- **Open Food Facts India** (in.openfoodfacts.org, ODbL) returns the same per-100 g fields for
  the fallback path; FSSAI mandates these on Indian labels
- **Page flow**: profile slots in as `Welcome → Profile → Home → Scan → Product → Basket`;
  profile state lives in App.jsx next to basket/selectedProduct, persisted to localStorage —
  zero backend changes
- **ProductInfo.jsx** renders the 4-macro grid — a "Personal Fit" card slots below it;
  **Basket.jsx** already computes totals — the hook for the budget bar
- **Google save** — GIS script + button, no redirect URI needed for ID-token flow, no backend
  changes; falls back to anonymous localStorage profile

## 6. Roadmap

- **Phase 1** — Profile setup screen (3 steps: About you → Body → Preferences; bubbles with
  × undo; food avatar; optional Google save prompt) + BMI/targets math + "Personal Fit %"
  card on the product page
- **Phase 2** — Basket budget bar, over-budget warning, swap suggestions from the same category
- **Phase 3** — Risk-reduction chips (BMI band → risks → product flags) + Indian-diet tips +
  perceived-vs-measured BMI messaging + "not medical advice" disclaimer
- **Phase 4 (optional, later)** — LLM layer for chat / meal-planning only, grounded in the
  deterministic numbers (see §4.5); the one-liner explainer stays deterministic forever

## 7. Open Questions

- Serving-size parsing (seed `serving_size` is inconsistent TEXT) — use per-100 g as the base?
- How to present fit % (single score vs per-macro breakdown)?
- Bubble behavior: research says tap-again-to-unselect is the standard (MD3 chips); the spec
  here keeps the × cross mark as the visible undo affordance — confirm both together don't
  feel redundant in testing
- Where to put the disclaimer (product page vs profile setup)?
- Google save: verify GIS button works on the Vercel domain + localhost dev origin (OAuth
  client setup) before committing to it

## 8. Failure Handling & Fallbacks (no over-engineering)

Rule: never crash, never block the core flow, always degrade to something useful.

| # | Failure mode | Fallback |
|---|---|---|
| 1 | **Height missing (critical plan gap)** — BMI = weight/height²; current profile has no height field | Profile MUST collect height (cm, 100–250). If skipped: "generic guidance mode" — general targets, no BMI band, no Personal Fit %, generic explainer only |
| 2 | Gender = "Prefer not to say" | Mifflin-St Jeor with averaged constant (−78) — deterministic, never blocks |
| 3 | Storage: `setItem` throws (private mode / quota-full); `JSON.parse` throws (corrupt / old schema) | One `safeStorage` wrapper (~15 lines): try/catch → in-memory fallback + silent "won't survive reload" note; corrupt → discard + fresh profile, never crash at boot; `version` key → clean reset on future schema changes |
| 4 | Google save: GIS script blocked / popup cancelled / `jwt-decode` fails / `sub` claim missing | Silent catch → toast "connect later"; anonymous localStorage profile stays primary; never blocks setup |
| 5 | Explainer math: remaining target ≤ 0; height missing; product field missing (seed drops fiber/sugars) | ≤ 0 → "already over budget" message (no %); missing height → generic tip; rule referencing absent field → skip rule, use next dominant factor. Rule engine = pure exported function (unit-testable; deterministic by design) |
| 6 | Age 10–17 (BMI bands don't apply to children) | Show band with "BMI-for-age" disclaimer, no risk chips, no fit %; no percentile math (out of scope). >65 → capped weight-loss targets |
| 7 | Render crash in profile screen | Error boundary (~20 lines) → "Reset profile" fallback UI, never white screen |
| 8 | NaN / locale formatting | `toFixed(1)` everywhere; `Intl.NumberFormat` with `toFixed` fallback |

## 9. Implementation Integration (verified against the codebase, Aug 2026)

### 9.1 Frontend architecture

- **No router, no Context, no state lib** — `page` is one `useState` string (App.jsx:13, values
  `welcome|home|scan|product|basket`). New screen = new `page` value + `if` branch; the
  fallthrough `return null` (App.jsx:313) blank-screens unknown pages.
- **Profile state**: `const [profile, setProfile] = useState(null)` beside App.jsx:15; loaded at
  boot via `useState(() => safeStorage.get("profile"))` so returning users skip setup. Prop-drilled
  to ProductInfo (App.jsx:287–291) and Basket (App.jsx:303–308).
- **Flow change**: App.jsx:167 `onStart={() => setPage("home")}` → `setPage("profile")`; new
  `page === "profile"` branch between lines 171 and 173. (Scan's `onBack` goes to welcome today —
  leave it.)
- **No test framework** (only oxlint; scripts: dev/build/lint/preview). BMI math + explainer go in
  plain `src/lib/bmi.js` / `src/lib/explainer.js` (pure, oxlint-clean, unit-testable later).

### 9.2 Where each piece goes

| Piece | Location | Reuses | Creates |
|---|---|---|---|
| Profile screen | new `src/screens/Profile.jsx`, mounted in App.jsx (~172) | `AppLayout`, `.manual-input`/`.manual-error` (global.css:924–960), `.start-btn`/`.secondary-btn` (426–491), `.feature-card`/`.dashboard-card` as chip/grid bases (361–397, 538–571), food icons (icons.jsx:152–281) | 3-step stepper UI (no precedent — step indicator + state machine), bubble chips with × undo, `role="radiogroup"` avatar grid, `onComplete(profile)` |
| BMI math | `src/lib/bmi.js` (pure) | `pickFirst`/`numberOrNull` guard pattern (off.js:55–65) | `computeBMI`, Indian ICMR banding, Mifflin-St Jeor, TDEE factors, goal targets |
| Explainer | `src/lib/explainer.js` (pure) | math module targets | rule chain (dominant factor) + §8#5 fallbacks; `WarningIcon` (icons.jsx:133) |
| Personal Fit card | `src/components/PersonalFitCard.jsx`, rendered ProductInfo.jsx:114–116 | `.nutrition-grid` tiles (global.css:858–898), `.premium-brand` pill (847–856) | card JSX + CSS (extend global.css near 858 or new stylesheet; ProductInfo imports only global.css:1) |
| Budget bar | `src/components/BasketBudgetBar.jsx`, after `.total-box` (Basket.jsx:178) | `.total-box` amethyst styling (basket.css:181–200), `round2` (Basket.jsx:4) | horizontal progress-bar CSS in `basket.css` (imported only by Basket) |
| Risk chips | inline in PersonalFitCard | `.premium-brand` pill, `WarningIcon`/`CheckIcon` | chip markup per ICMR risk band + "not medical advice" disclaimer |
| safeStorage | `src/lib/storage.js` (~15 lines) | nothing (first persistence layer in the app) | `get`/`set` with try/catch → in-memory fallback, corrupt → discard, `version` key |
| Profile boundary | new `src/components/ProfileBoundary.jsx` | exact shape of `ErrorBoundary.jsx:3–37` | "Reset profile" (clear storage + `setProfile(null)` → welcome), no full reload |

### 9.3 Backend edits (2 files, ~10 lines — fields reach the API instantly, no whitelist)

- `server/lib/seed.js` after line 33 (`fat: row.fat ?? null,`):
  `satfat: row.satfat ?? null, sugars: row.sugars ?? null, fiber: row.fiber ?? null, salt: row.salt ?? null, serving_size: row.serving_size ?? null`
- `server/lib/off.js` after line 83 (`fat: pickFirst(...)`): same 5 fields via
  `pickFirst(n["saturated-fat_100g"], n["saturated-fat_serving"], n["saturated-fat"])` etc.,
  `serving_size: p.serving_size || null`; add `serving_size` to the `fields=` URL at off.js:91
- `res.json(product)` (server/index.js:81) passes the full object — no response-shape changes; the
  API cache (24 h TTL) stores whole objects, no invalidation needed

### 9.4 Verified gotchas (do not rediscover)

- Checkout.jsx / PaymentSuccess.jsx / `src/data/products.js` are **dead code** (never mounted) — don't build on them
- `price` is effectively always `0` client-side (App.jsx:100–105, `prices` never filled) — budget bar compares **macros/calories, never money**
- Seed `energy_kcal` is NOT uniformly per-100 g (118/500 rows < 100 kcal, e.g. Parle G = 3.4) and `fiber` is missing in 250/500 rows; OFF often omits `fiber_100g` entirely — every new field must tolerate `null` (§8#5)
- `serving_size` is inconsistent free text (`180`, `15g`, `100ml`, `1 portion (70 g)`, `''`) — pass through raw; keep per-100 g as the base (per §7)
- CSS: global.css is imported globally (main.jsx:5) — avoid generic names (`.card`, `.grid`, `.bar`); per-screen CSS goes in a new `profile.css` (precedent: Basket → basket.css); new profile container must join the shared container/card lists (global.css:246–258, 275–291, responsive 1025–1076)
- Basket totals today sum only calories/protein/carbs/fat (Basket.jsx:24–42) — extend for the Phase-2 budget bar
- oxlint `react/only-export-components` — keep screens single-component exports; pure logic in `.js`