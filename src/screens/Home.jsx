import { useState } from "react";
import "./../styles/global.css";
import { LeafIcon, TomatoIcon, MushroomIcon } from "../components/icons";
import { Apple, Broccoli, Carrot, Banana, Cherry, Citrus, Leaf, Flower2, Sprout, Barcode } from "lucide-react";
import { loadScanHistory } from "../lib/storage";

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

function avatarIconFor(key) {
  const match = AVATARS.find(([avatarKey]) => avatarKey === key);
  return match ? match[1] : null;
}

function relativeTime(timestamp) {
  const diff = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function snapshotLine(snapshot) {
  if (!snapshot) return null;
  return snapshot.perceptionMessage || snapshot.budgetSummary || null;
}

function Home({
  profile,
  onScan,
  onBasket,
  onSetupProfile,
  onOpenScan
}) {

  const [setupPromptVisible, setSetupPromptVisible] = useState(true);

  const [history] = useState(() => loadScanHistory());

  const AvatarIcon = profile ? avatarIconFor(profile.avatar) : null;

  return (

    <div className="home-container">

      {profile && (
        <div
          className="profile-avatar-circle"
          role="img"
          aria-label={profile.name ? `${profile.name} profile` : "Profile"}
        >
          {AvatarIcon ? (
            <AvatarIcon />
          ) : (
            <span className="avatar-initial">
              {profile.name ? profile.name.charAt(0) : "?"}
            </span>
          )}
        </div>
      )}

      <div className="home-card premium-home dither-overlay">

        <div className="dashboard-header">

          <h1><LeafIcon size={24} className="inline-icon" /> NutriBasket</h1>


          <p>
            Smart shopping with real-time nutrition tracking
          </p>


        </div>

        <div className="session-box premium-session">


          <span>
            <span className="session-dot" /> Active Shopping Session
          </span>


        </div>

        {profile == null && setupPromptVisible && (
          <div className="home-setup-prompt">

            <div className="home-setup-prompt-text">

              <strong>Set up your profile</strong>

              <span>for personalised guidance</span>

            </div>

            <button
              className="secondary-btn home-setup-btn"
              onClick={onSetupProfile}
            >
              Set up profile
            </button>

            <button
              type="button"
              className="home-prompt-dismiss"
              aria-label="Dismiss"
              onClick={() => setSetupPromptVisible(false)}
            >
              ×
            </button>

          </div>
        )}

        {history.length > 0 && (
          <div className="recent-scans">

            <h2>Recent scans</h2>

            {history.map((entry) => {

              const line = snapshotLine(entry.profileSnapshot);

              return (
                <button
                  type="button"
                  className="scan-history-row"
                  key={entry.id}
                  onClick={() => onOpenScan(entry.barcode)}
                >
                  {entry.image ? (
                    <img
                      className="scan-thumb"
                      src={entry.image}
                      alt=""
                    />
                  ) : (
                    <span className="scan-thumb scan-thumb-fallback">
                      <LeafIcon size={18} />
                    </span>
                  )}

                  <span className="scan-history-main">
                    <span className="scan-history-name">{entry.name}</span>
                    <span className="scan-history-time">
                      {relativeTime(entry.timestamp)}
                    </span>
                  </span>

                  {line && (
                    <span className="scan-snapshot-chip">{line}</span>
                  )}
                </button>
              );

            })}

          </div>
        )}

        <div className="home-footer">
          Nutrition data © Open Food Facts contributors, licensed under ODbL 1.0
        </div>

        <div className="home-buttons premium-buttons">


          <button
            className="start-btn"
            onClick={onScan}
          >

            Scan Product

          </button>




          <button
            className="start-btn"
            onClick={onBasket}
          >

            My Basket

          </button>


        </div>

      </div>


    </div>

  );

}


export default Home;