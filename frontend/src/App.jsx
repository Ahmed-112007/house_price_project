import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    carpetArea: '1200',
    floor: '3',
    bathrooms: '2',
    balconies: '1',
    furnishing: 'Semi-Furnished',
    transaction: 'Resale',
    ownership: 'Freehold',
    facing: 'North'
  });

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // جلب قائمة المناطق المباشرة من الباك إند
  useEffect(() => {
    fetch(`${API_BASE_URL}/locations`)
      .then((res) => res.json())
      .then((data) => {
        const locs = data.locations || (Array.isArray(data) ? data : []);
        if (locs.length > 0) {
          setLocations(locs);
          setFormData((prev) => ({ ...prev, location: locs[0] }));
        }
      })
      .catch((err) => console.error("خطأ في جلب الأماكن:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictedPrice(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: formData.location,
          carpet_area: Number(formData.carpetArea),
          floor: Number(formData.floor),
          bathrooms: Number(formData.bathrooms),
          balconies: Number(formData.balconies),
          furnishing: formData.furnishing,
          transaction: formData.transaction,
          ownership: formData.ownership,
          facing: formData.facing
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPredictedPrice(data.predicted_price);
      } else {
        alert("خطأ من السيرفر: " + (data.detail || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("تعذر الاتصال بالباك إند. تأكد من تشغيل الباك إند على Port 8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <h1>House Price Predictor</h1>
          <p className="subtitle">توقّع قيمة بيتك بذكاء وسهولة</p>
        </div>

        <form onSubmit={handlePredict}>
          <div className="form-group">
            <label>Location</label>
            <select name="location" value={formData.location} onChange={handleChange}>
              {locations.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Carpet Area (sq ft):</label>
            <input type="number" name="carpetArea" value={formData.carpetArea} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Floor Number:</label>
            <input type="number" name="floor" value={formData.floor} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Bathrooms:</label>
            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Balconies:</label>
            <input type="number" name="balconies" value={formData.balconies} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Furnishing Status:</label>
            <select name="furnishing" value={formData.furnishing} onChange={handleChange}>
              <option value="Furnished">Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Type:</label>
            <select name="transaction" value={formData.transaction} onChange={handleChange}>
              <option value="New Property">New Property</option>
              <option value="Resale">Resale</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ownership:</label>
            <select name="ownership" value={formData.ownership} onChange={handleChange}>
              <option value="Freehold">Freehold</option>
              <option value="Leasehold">Leasehold</option>
            </select>
          </div>

          <div className="form-group">
            <label>Facing Direction:</label>
            <select name="facing" value={formData.facing} onChange={handleChange}>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="North-East">North-East</option>
              <option value="North-West">North-West</option>
              <option value="South-East">South-East</option>
              <option value="South-West">South-West</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "جاري التوقع..." : "توقّع السعر"}
          </button>
        </form>

        {predictedPrice !== null && (
          <div className="result-box">
            <h3>السعر المتوقع:</h3>
            <p className="price">${predictedPrice.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;