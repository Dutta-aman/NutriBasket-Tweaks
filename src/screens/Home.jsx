import "./../styles/global.css";
import { BasketIcon, CaloriesIcon, ProteinIcon, CarbsIcon, FatIcon, ScanIcon, LeafIcon } from "../components/icons";
import BotanicalBackground from "../components/BotanicalBackground";


function Home({ 
  onScan, 
  onBasket, 
  basket 
}) {


  const totalProducts = basket.reduce(
    (sum,item)=> sum + (item.quantity || 1),
    0
  );


  const totalBill = basket.reduce(
    (sum,item)=> 
      sum + (item.price * (item.quantity || 1)),
    0
  );


  const totalCalories = basket.reduce(
    (sum,item)=>
      sum + (item.calories * (item.quantity || 1)),
    0
  );


  const totalProtein = basket.reduce(
    (sum,item)=>
      sum + (item.protein * (item.quantity || 1)),
    0
  );


  const totalCarbs = basket.reduce(
    (sum,item)=>
      sum + (item.carbs * (item.quantity || 1)),
    0
  );


  const totalFat = basket.reduce(
    (sum,item)=>
      sum + (item.fat * (item.quantity || 1)),
    0
  );



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


          <span>
            🏪 FreshMart Store
          </span>


        </div>





        <div className="dashboard-grid">



          <div className="dashboard-card nutrition-card">

            <div className="card-icon">
              <BasketIcon size={24} />
            </div>

            <h2>
              {totalProducts}
            </h2>

            <span>
              Products
            </span>

          </div>





          <div className="dashboard-card nutrition-card bill-card">

            <div className="card-icon">
              <ScanIcon size={24} />
            </div>

            <h2>
              ₹{totalBill}
            </h2>

            <span>
              Current Bill
            </span>

          </div>





          <div className="dashboard-card nutrition-card calorie-card">

            <div className="card-icon">
              <CaloriesIcon size={24} />
            </div>

            <h2>
              {totalCalories}
            </h2>

            <span>
              Calories
            </span>

          </div>





          <div className="dashboard-card nutrition-card">

            <div className="card-icon">
              <ProteinIcon size={24} />
            </div>

            <h2>
              {totalProtein}g
            </h2>

            <span>
              Protein
            </span>

          </div>





          <div className="dashboard-card nutrition-card">

            <div className="card-icon">
              <CarbsIcon size={24} />
            </div>

            <h2>
              {totalCarbs}g
            </h2>

            <span>
              Carbs
            </span>

          </div>





          <div className="dashboard-card nutrition-card">

            <div className="card-icon">
              <FatIcon size={24} />
            </div>

            <h2>
              {totalFat}g
            </h2>

            <span>
              Fat
            </span>

      </div>

      <div className="home-footer">
        Nutrition data © Open Food Facts contributors, licensed under ODbL 1.0
      </div>

    </div>






        <div className="home-buttons premium-buttons">


          <button
            className="start-btn"
            onClick={onScan}
          >

            📷 Scan Product

          </button>




          <button
            className="start-btn"
            onClick={onBasket}
          >

            🧺 My Basket

          </button>


        </div>



      </div>


    </div>

  );

}


export default Home;