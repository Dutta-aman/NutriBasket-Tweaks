import { useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import { ScanIcon, LeafIcon, HeartIcon, AppleIcon, BroccoliIcon, CarrotIcon, BananaIcon, TomatoIcon, CherryIcon, MushroomIcon, CitrusIcon, FlowerIcon, LeafSmallIcon, ProductIcon } from "../components/icons";
import { Apple, Broccoli, Carrot, Banana, Citrus } from "lucide-react";

import "./../styles/global.css";

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

function avatarIconFor(key) {
  const match = AVATARS.find(([avatarKey]) => avatarKey === key);
  return match ? match[1] : null;
}


function Welcome({ onStart, profile }) {


  const [time, setTime] = useState("");


  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);



  const today = new Date().toLocaleDateString(

    "en-IN",

    {

      day:"numeric",

      month:"long",

      year:"numeric"

    }

  );

  const AvatarIcon = profile ? avatarIconFor(profile.avatar) : null;



  return (

    <AppLayout>

      <div className="welcome-card premium-welcome">

        <div className="welcome-clock">
          <time className="clock-date">{today}</time>
          <time className="clock-time">{time}</time>
        </div>

        {profile && (
          <button
            type="button"
            className="profile-avatar-circle"
            aria-label={profile.name ? `${profile.name} profile` : "Profile"}
            onClick={onStart}
          >
            {AvatarIcon ? (
              <AvatarIcon />
            ) : (
              <span className="avatar-initial">
                {profile.name ? profile.name.charAt(0) : "?"}
              </span>
            )}
          </button>
        )}

        <div className="brand-logo">
          <LeafIcon size={48} className="brand-icon" />
        </div>



        <h1>

          Nutri<span>Basket</span>

        </h1>



        <h2>

          Smart Shopping Assistant

        </h2>



        <p className="welcome-text">

          Experience smarter grocery shopping with
          real-time product scanning, nutrition tracking,
          and a curated basket of fresh produce.

        </p>
        <div className="botanical-row">
          <Apple size={24} />
          <Broccoli size={24} />
          <Carrot size={24} />
          <Banana size={24} />
          <Citrus size={24} />
        </div>

        <div className="section-divider">
          <LeafIcon size={14} />
        </div>

        <button

          className="start-btn premium-btn"

          onClick={onStart}

        >

          Get Started

        </button>
        <div className="section-divider">
          <LeafIcon size={14} />
        </div>


        <div className="feature-row premium-features">

          <div className="feature-card">

            <strong>
              <ScanIcon size={32} />
            </strong>

            <span>
              Instant Scan
            </span>

            <small>
              Quick product detection
            </small>

          </div>



          <div className="feature-card">

            <strong>
              <HeartIcon size={32} />
            </strong>

            <span>
              Health Data
            </span>

            <small>
              Track calories & nutrients
            </small>

          </div>

        </div>

      </div>


    </AppLayout>

  );

}


export default Welcome;