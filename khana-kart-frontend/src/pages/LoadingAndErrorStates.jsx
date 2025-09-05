import React from "react";

export default function LoadingAndErrorStates({ loading, error, fetchAll }) {
  const foodLoadingGif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWJxbXg2M3A2bGg2Mnk4N2czNW5wYm9yemptcTIwbzRzd3F2ZnJnNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xTkcEQACH24SMPxIQg/giphy.gif";

  if (loading) {
    return (
      <div className="loading-state">
        <img src={foodLoadingGif} alt="Loading food" className="food-loading-animation" />
        {/* Optional text */}
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p className="error-text">{error}</p>
        <button className="btn btn-primary" onClick={fetchAll}>
          Try Again
        </button>
      </div>
    );
  }

  return null;
}
