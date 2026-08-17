import { useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import { ScanIcon, LeafIcon, HeartIcon, AppleIcon, BroccoliIcon, CarrotIcon, BananaIcon, TomatoIcon } from "../components/icons";

import "./../styles/global.css";


function Welcome({ onStart }) {


  const [time, setTime] = useState("");
  const [introKey, setIntroKey] = useState(0);


  useEffect(() => {
    const onShow = (e) => {
      if (e.persisted) setIntroKey((k) => k + 1);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);



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



  return (

    <AppLayout>

      <div key={introKey} className="welcome-card premium-welcome pixel-reveal" style={{ "--d": "0.1s" }}>

        <div className="pixel-reveal-inner">

        <div className="welcome-clock pixel-reveal" style={{ "--d": "0.2s" }}>
          <span className="pixel-reveal-inner">
            <time className="clock-date">{today}</time>
            <time className="clock-time">{time}</time>
          </span>
        </div>

        <div className="brand-logo pixel-reveal" style={{ "--d": "0.2s" }}>
          <span className="pixel-reveal-inner">
            <LeafIcon size={48} className="brand-icon" />
          </span>
        </div>



        <h1>

          {"Nutri".split("").map((c, i) => (
            <i key={c + i} className="brand-letter pixel-reveal" style={{ "--d": "0.3s" }}>
              <span className="pixel-reveal-inner">{c}</span>
            </i>
          ))}

          <span>

            {"Basket".split("").map((c, i) => (
              <i key={c + i} className="brand-letter pixel-reveal" style={{ "--d": "0.3s" }}>
                <span className="pixel-reveal-inner">{c}</span>
              </i>
            ))}

          </span>

        </h1>



        <h2 className="pixel-reveal" style={{ "--d": "0.4s" }}>

          <span className="pixel-reveal-inner">Smart Shopping Assistant</span>

        </h2>



        <p className="welcome-text pixel-reveal" style={{ "--d": "0.4s" }}>

          <span className="pixel-reveal-inner">
            Experience smarter grocery shopping with
            real-time product scanning, nutrition tracking,
            and a curated basket of fresh produce.
          </span>

        </p>
        <div className="botanical-row pixel-reveal" style={{ "--d": "0.4s" }}>
          <span className="pixel-reveal-inner">
            <AppleIcon size={24} />
            <BroccoliIcon size={24} />
            <CarrotIcon size={24} />
            <BananaIcon size={24} />
            <TomatoIcon size={24} />
          </span>
        </div>

        <div className="section-divider">
          <LeafIcon size={14} />
        </div>

        <button

          className="start-btn premium-btn pixel-reveal"

          style={{ "--d": "0.5s" }}

          onClick={onStart}

        >

          <span className="pixel-reveal-inner">Get Started</span>

        </button>
        <div className="section-divider">
          <LeafIcon size={14} />
        </div>


        <div className="feature-row premium-features pixel-reveal" style={{ "--d": "0.55s" }}>

          <div className="pixel-reveal-inner">

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

        </div>

      </div>


    </AppLayout>

  );

}


export default Welcome;