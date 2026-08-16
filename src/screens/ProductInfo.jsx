import "./../styles/global.css";
import { CaloriesIcon, ProteinIcon, CarbsIcon, FatIcon, ProductIcon } from "../components/icons";

function ProductInfo({
  product,
  onAdd,
  onBack
}) {

  function fmt(value, suffix) {

    const num = Number(value);

    return Number.isFinite(num) ? `${num}${suffix ?? ""}` : "N/A";

  }

  function handleAdd() {
    onAdd(product);
  }

  return (

    <div className="product-container">

      <div className="product-card premium-product">

        <div className="product-hero">

          {product.image_url ? (

            <img
              className="product-photo"
              src={product.image_url}
              alt={product.name}
            />

          ) : (

            <div className="product-image premium-product-icon">

              <ProductIcon size={44} />

              <span className="product-image-caption">No photo</span>

            </div>

          )}

          <h1>

            {product.name}

          </h1>

          <p className="brand premium-brand">

            🏷 {product.brand}

          </p>

        </div>

        <div className="nutrition-grid premium-nutrition">

          <div>

            <h2>
              <CaloriesIcon size={18} /> {fmt(product.calories)}
            </h2>

            <span>
              Calories
            </span>

          </div>

          <div>

            <h2>
              <ProteinIcon size={18} /> {fmt(product.protein, "g")}
            </h2>

            <span>
              Protein
            </span>

          </div>

          <div>

            <h2>
              <CarbsIcon size={18} /> {fmt(product.carbs, "g")}
            </h2>

            <span>
              Carbs
            </span>

          </div>

          <div>

            <h2>
              <FatIcon size={18} /> {fmt(product.fat, "g")}
            </h2>

            <span>
              Fat
            </span>

          </div>

        </div>

        <div className="product-buttons premium-product-buttons">

          <button

            className="secondary-btn"

            onClick={onBack}

          >

            ← Back

          </button>

          <button

            className="start-btn premium-btn"

            onClick={handleAdd}

          >

            Add to Basket

          </button>

        </div>

      </div>

    </div>

  );

}

export default ProductInfo;
