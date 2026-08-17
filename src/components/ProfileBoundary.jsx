import { Component } from "react";

import Profile from "../screens/Profile";

class ProfileBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("NutriBasket profile setup crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="profile-container">
          <div className="profile-card">
            <h1>Something Went Wrong</h1>
            <p>Profile setup hit an unexpected error. Start over — your answers are safe.</p>
            <button
              className="start-btn premium-btn"
              onClick={() => {
                if (this.props.onReset) this.props.onReset();
              }}
            >
              Reset profile
            </button>
          </div>
        </div>
      );
    }

    const { onComplete, ...rest } = this.props;
    return <Profile onComplete={onComplete} {...rest} />;
  }
}

export default ProfileBoundary;
