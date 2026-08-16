import "./../styles/global.css";
import { LeafIcon } from "../components/icons";
import BotanicalBackground from "../components/BotanicalBackground";


function Home({
  onScan,
  onBasket
}) {

  return (

    <div className="home-container">
      <BotanicalBackground />

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
