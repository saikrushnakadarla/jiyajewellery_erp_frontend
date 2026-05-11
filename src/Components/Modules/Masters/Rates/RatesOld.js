
import React, { useState } from 'react';
import './Rates.css';
import InputField from "../../../Pages/InputField/InputField";

const Rates = () => {
    // Get today's date in YYYY-MM-DD format
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    };

    const [rates, setRates] = useState({
        currentDate: getCurrentDate(),
        gold16: "70000.00",
        gold18: "75000.00",
        gold22: "77000.00",
        gold24: "85000.00",
        silverRate: "1000.00",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRates((prevRates) => ({
            ...prevRates,
            [name]: value,
        }));
    };

    const handleUpdateRates = async () => {
        const { currentDate, gold16, gold18, gold22, gold24, silverRate } = rates;

        // Construct the data object to be sent in the POST request
        const requestData = {
            rate_date: currentDate,
            rate_time: new Date().toLocaleTimeString(), // Current time
            rate_16crt: gold16,
            rate_18crt: gold18,
            rate_22crt: gold22,
            rate_24crt: gold24,
            silver_rate: silverRate,
        };

        try {
            // Send POST request to the backend API
            const response = await fetch("http://localhost:3000/post/rates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (response.ok) {
                // Handle successful response
                alert("Rates updated successfully!");
                console.log(result);
            } else {
                // Handle error response
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            // Handle network errors
            alert("An error occurred while updating the rates.");
            console.error("Error:", error);
        }
    };

    return (
        <div className="main-container">
            <div className="rate-container">
                <h3 style={{ textAlign: 'center' }} className="title">ENTER TODAY RATE</h3>
                <div className="form-section">
                    <InputField
                        label="Current Date:"
                        name="currentDate"
                        type="date"
                        value={rates.currentDate}
                        readOnly={true} // Current date is displayed but not editable
                    />
                </div>

                <div className="form-section">
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }} className="sub-title">Enter Today Gold Rate</h3>
                    <div className="form-row">
                        <InputField
                            label="16 Crt"
                            name="gold16"
                            type="text"
                            value={rates.gold16}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label="18 Crt"
                            name="gold18"
                            type="text"
                            value={rates.gold18}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label="22 Crt"
                            name="gold22"
                            type="text"
                            value={rates.gold22}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label="24 Crt"
                            name="gold24"
                            type="text"
                            value={rates.gold24}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3 style={{ textAlign: 'center' }} className="sub-title">Enter Today Silver Rate</h3>
                    <InputField
                        label="Silver Rate:"
                        name="silverRate"
                        type="text"
                        value={rates.silverRate}
                        onChange={handleInputChange}
                    />
                </div>

                <button className="continue-btn" onClick={handleUpdateRates}>UPDATE</button>
            </div>
        </div>
    );
};

export default Rates;