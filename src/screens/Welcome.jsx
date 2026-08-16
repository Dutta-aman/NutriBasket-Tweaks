import { useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import { ScanIcon, LeafIcon, HeartIcon, AppleIcon, BroccoliIcon, CarrotIcon, BananaIcon, TomatoIcon } from "../components/icons";
import BotanicalBackground from "../components/BotanicalBackground";

import "./../styles/global.css";


function Welcome({ onStart }) {


  const [time, setTime] = useState("");


  useEffect(() => {

    const updateTime = () => {

      const now = new Date();

      setTime(

        now.toLocaleTimeString([], {

          hour: "2-digit",

          minute: "2-digit"

        })

      );

    };


    updateTime();


    const interval = setInterval(
      updateTime,
      1000
    );


    return () => clearInterval(interval);


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
      <BotanicalBackground />

      <div className="welcome-card premium-welcome dither-overlay">


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
          <AppleIcon size={24} />
          <BroccoliIcon size={24} />
          <CarrotIcon size={24} />
          <BananaIcon size={24} />
          <TomatoIcon size={24} />
        </div>

        <div className="section-divider" />

        <div className="store-info premium-info">

          <div>

            <span className="store-icon">📅</span>

            <p>
              {today}
            </p>

          </div>



          <div>

            <span className="store-icon">🕒</span>

            <p>
              {time}
            </p>

          </div>

        </div>

        <button

          className="start-btn premium-btn"

          onClick={onStart}

        >

          Get Started

        </button>

        <div className="section-divider" />


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