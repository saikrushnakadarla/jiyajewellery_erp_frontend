import React, { useState } from "react";
import "./Repairs.css";
import InputField from "../../../Pages/InputField/InputField";

const RepairForm = () => {

    const [metal, setMetal] = useState("");
    const [type, setType] = useState("");
    const [purity, setPurity] = useState("");

  return (
    <div className="repair-form-container">
      {/* <h2>Repair Form</h2> */}
      <form className="repair-form">
        {/* First Row */}
        <div className="form-section">
        <div className="form-row">
          <InputField label="Entry Type:" value="REPAIR" readOnly />
          <InputField label="Receipt No:" />
          <InputField label="Date:" type="date" />
        </div>
        </div>
        {/* Customer Details */}
        <div className="form-section">
          <h4>Customer Details</h4>
          <div className="form-row">
            <InputField label="Name:" />
            <InputField label="Mobile:" />
            <InputField label="Phone:" />
            <InputField label="Email:" type="email" />
          </div>
          <div className="form-row">           
            <InputField label="Address1:" />
            <InputField label="Address2:" />
            <InputField label="Address3:" />
          </div>
          <div className="form-row">
            <InputField label="Staff:" />
            <InputField label="Delivery Date:" type="date" />
            <InputField label="Place:" />
          </div>
        </div>

        {/* Staff and Delivery Info */}
        <div className="form-section">
          <div className="form-row">
          <InputField
              label="Metal:"
              type="select"
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
              options={[
                { value: "GOLD", label: "Gold" },
                { value: "SILVER", label: "Silver" },
                { value: "PLATINUM", label: "Platinum" },
              ]}
            />
             <InputField label="Counter:" placeholder="Counter Name" />
          </div>
          
        </div>
        
        {/* Repair Item Details */}
        <div className="form-section">
          <h4>Repair Item Details</h4>
          <div className="form-row">
            <div className="input-wrapper">             
              <InputField
              label="Type:"
              type="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: "ORDER PURPOSE", label: "Order Purpose" },
                { value: "REPAIR PURPOSE", label: "Repair Purpose" },
              ]}
            />
            </div>
            <InputField label="Item:" placeholder="Item Name" />
            <InputField label="Tag No:" />
            
          </div>
          <div className="form-row">
          <InputField label="Description:" placeholder="Description" />
            <div className="input-wrapper">
             
            <InputField
              label="Purity:"
              type="select"
              value={purity}
              onChange={(e) => setPurity(e.target.value)}
              options={[
                { value: "916HM", label: "916HM" },
                { value: "22K", label: "22K" },
                { value: "18K", label: "18K" },
              ]}
            />
            </div>
            
          </div>
        </div>

        {/* Extra Charges */}
        <div className="form-section">
          <h4>Extra Charges</h4>
          <div className="form-row">
            <InputField label="Extra Weight:" />
            <InputField label="Stone Value:" />
            <InputField label="Making Charge (MC):" />
            <InputField label="Handling Charge (HC):" />
            <InputField label="Total:" />
          </div>
          
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button">Print</button>
          
        </div>
      </form>
    </div>
  );
};

export default RepairForm;
