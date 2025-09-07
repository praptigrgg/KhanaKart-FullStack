import React from "react";

export default function LoadingAndErrorStates({ loading, error, fetchAll }) {

  if (loading) {
    return (
      <div className="loading-state">
        
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
