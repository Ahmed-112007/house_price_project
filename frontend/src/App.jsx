import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [carpetAreaSqft, setCarpetAreaSqft] = useState(1000);
  const [floorNum, setFloorNum] = useState(2);
  const [bathroom, setBathroom] = useState(2);
  const [balcony, setBalcony] = useState(1);
  const [furnishing, setFurnishing] = useState("Semi-Furnished");
  const [transaction, setTransaction] = useState("Resale");
  const [ownership, setOwnership] = useState("Freehold");
  const [facing, setFacing] = useState("North");
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/locations")
      .then((res) => {
        if (res.data.locations && res.data.locations.length > 0) {
          setLocations(res.data.locations);
          setLocation(res.data.locations[0]);
        }
      })
      .catch(() => {
        const defaultLocs = ["New Cairo", "Maadi", "Zamalek", "Nasr City", "Heliopolis", "Sheikh Zayed", "other"];
        setLocations(defaultLocs);
        setLocation(defaultLocs[0]);
      });
  }, []);

  const handlePredict = () => {
    axios.post("http://localhost:8000/predict", {
      location: location,
      carpet_area_sqft: parseFloat(carpetAreaSqft),
      floor_num: parseInt(floorNum),
      bathroom: parseInt(bathroom),
      balcony: parseInt(balcony),
      furnishing: furnishing,
      transaction: transaction,
      ownership: ownership,
      facing: facing
    })
    .then(res => setPrediction(res.data.predicted_price))
    .catch(err => alert("حدث خطأ أثناء إجراء التوقع"));
  };

  return (
    <div style={{ padding: "30px", color: "#fff", maxWidth: "500px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>House Price Predictor</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        
        <label>Location:</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          {locations.map((loc, index) => (
            <option key={index} value={loc}>{loc}</option>
          ))}
        </select>

        <label>Carpet Area (sq ft):</label>
        <input type="number" value={carpetAreaSqft} onChange={(e) => setCarpetAreaSqft(e.target.value)} />

        <label>Floor Number:</label>
        <input type="number" value={floorNum} onChange={(e) => setFloorNum(e.target.value)} />

        <label>Bathrooms:</label>
        <input type="number" value={bathroom} onChange={(e) => setBathroom(e.target.value)} />

        <label>Balconies:</label>
        <input type="number" value={balcony} onChange={(e) => setBalcony(e.target.value)} />

        <label>Furnishing Status:</label>
        <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)}>
          <option value="Furnished">Furnished</option>
          <option value="Semi-Furnished">Semi-Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>

        <label>Transaction Type:</label>
        <select value={transaction} onChange={(e) => setTransaction(e.target.value)}>
          <option value="New Property">New Property</option>
          <option value="Resale">Resale</option>
        </select>

        <label>Ownership:</label>
        <select value={ownership} onChange={(e) => setOwnership(e.target.value)}>
          <option value="Freehold">Freehold</option>
          <option value="Leasehold">Leasehold</option>
          <option value="Co-operative Society">Co-operative Society</option>
          <option value="Power of Attorney">Power of Attorney</option>
        </select>

        <label>Facing Direction:</label>
        <select value={facing} onChange={(e) => setFacing(e.target.value)}>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="North-East">North-East</option>
          <option value="North-West">North-West</option>
          <option value="South-East">South-East</option>
          <option value="South-West">South-West</option>
        </select>

        <button onClick={handlePredict} style={{ padding: "12px", backgroundColor: "#00aaff", color: "#fff", border: "none", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>
          Predict Price
        </button>

        {prediction !== null && (
          <h3 style={{ marginTop: "15px", color: "#4caf50", textAlign: "center" }}>
            Predicted Price: ~{prediction} Lakhs
          </h3>
        )}
      </div>
    </div>
  );
}

export default App;