import React, { useState } from "react";
import logo from "../../logo.svg";
import "./App.css";
import ReactRating from "../Rating/ReactRating";

function App() {
  const [rating, setRating] = useState(1);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <ReactRating
          title="Rate this example"
          max-rating={5}
          rating={rating}
          ratingChanged={(value) => setRating(value)}
        />
        <p>React rating state: {rating}</p>
        <button
          className="randomButton"
          onClick={() => {
            setRating(parseInt(Math.random() * 4) + 1);
          }}
        >
          Set random rating
        </button>
      </header>
    </div>
  );
}

export default App;
