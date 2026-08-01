import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("NutriBasket crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="product-container">
          <div className="product-card">
            <h1>Something Went Wrong</h1>
            <p>The app hit an unexpected error.</p>
            <button
              className="start-btn premium-btn"
              onClick={() => window.location.reload()}
            >
              🔄 Tap to Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
