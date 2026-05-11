import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StockEntry.css";
import InputField from "../../Masters/ItemMaster/Inputfield";
import StoneDetailsModal from "./StoneDetailsModal";
import { useNavigate } from 'react-router-dom';

const StockEntry = () => {
    const [metal, setMetal] = useState("");
    const [productname, setproductname] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleCloseModal = () => setShowModal(false);
    const [formData, setFormData] = useState({
        productname: "",
        categories: "Jewelry",
        itemprefix: "",
        shortname: "",
        saleaccounthead: "",
        purchaseaccounthead: "",
        status: true,
        taxslab: 18.0,
        hsncode: "",
        opqty: 0,
        opvalue: 0.0,
        opweight: 0.0,
        purity: "",
        huidno: "",
        pricing: "",
        pid: "",
        category: "Gold",
        prefix: "",
        pcode: "",
        grossweight: "",
        stonesweight: "",
        stonesprice: "",
        weightww: "",
        wastageon: "",
        wastage: "",
        charges: "",
        percentage: "",
        weight: "",
        makingcharges: "",
        cal: "",
        tax: "",
        status: "",
        stackpoint: "",
    });



    const handleOpenModal = () => setShowModal(true);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Make sure formData is correctly passed and contains all required fields
            console.log("Form data before submission:", formData);
            const response = await axios.post("http://localhost:5000/addStockEntry", formData);
            console.log("Data saved successfully:", response.data);
            alert("Product added successfully!");
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to add product. Please try again.");
        }
    };
    const navigate = useNavigate();
    const handleBack = () => {
        navigate('/stockEntryTable');
    };
    return (
        <div style={{ paddingTop: "79px" }}>
            <div className="container mt-4">
                <div className="row mt-3">
                    <div className="col-12">
                        <form className="p-4 border rounded form-container-stockentry" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <h4>Stock Entry</h4>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <InputField
                                            label="Pricing:"
                                            name="pricing"
                                            type="select"
                                            value={formData.pricing}
                                            onChange={handleChange}
                                            options={[
                                                { value: "By Weight", label: "By Weight" },
                                                { value: "By fixed", label: "By fixed" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="P ID:"
                                            type="select"
                                            value={formData.pid}
                                            onChange={handleChange}
                                            name="pid"
                                            options={[
                                                { value: "PR001", label: "PR001" },
                                                { value: "PR002", label: "PR002" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                    <InputField
                                        label="Tag ID:"
                                        name="tagid"
                                        value={formData.tagid}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div className="col-md-2">
                                        <InputField
                                            label="productname:"
                                            type="select"
                                            value={formData.productname}
                                            onChange={handleChange}
                                            name="productname"
                                            options={[
                                                { value: "product1", label: "product1" },
                                                { value: "product2", label: "product2" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                    <InputField
                                        
                                        label="Design Master:"
                                        name="designmaster"
                                        type="select"
                                        value={formData.designmaster}
                                        onChange={handleChange}
                                        options={[
                                            { value: "Jewellery", label: "Jewellery" },
                                            { value: "Gold", label: "Gold" },
                                            { value: "Silver", label: "Silver" },
                                        ]}
                                    />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="Category:" value="Gold" readOnly />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="Prefix:" value="Gold" readOnly />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="purity:"
                                            type="select"
                                            value={formData.purity}
                                            onChange={handleChange}
                                            name="purity"
                                            options={[
                                                { value: "916HM", label: "916HM" },
                                                { value: "22K", label: "22k" },
                                                { value: "18K", label: "18k" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="PCode/BarCode:"
                                            value={formData.pcode}
                                            onChange={handleChange}
                                            name="pcode"
                                        />
                                    </div>
                                    {/* <div className="col-md-2">
                                    <InputField
                                        label="Status:"
                                        type="select"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={[
                                            { value: "Sold", label: "Sold" },
                                            { value: "Purchase", label: "Purchase" },
                                        ]}
                                    />
                                    </div> */}
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="row g-3">
                                    <div className="col-md-2">
                                        <InputField label="Gross Weight:"
                                            value={formData.grossweight}
                                            onChange={handleChange}
                                            name="grossweight"
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <InputField label="Stones Weight:"
                                            value={formData.stonesweight}
                                            onChange={handleChange}
                                            name="stonesweight"
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <button
                                            type="button" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
                                            className="btn btn-primary w-100"
                                            onClick={handleOpenModal}

                                        >
                                            Stone Details
                                        </button>
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="Stones Price:"
                                            value={formData.stonesprice}
                                            onChange={handleChange}
                                            name="stonesprice"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="Weight WW:"
                                            value={formData.weightww}
                                            onChange={handleChange}
                                            name="weightww"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                    <InputField
                                        label="Wastage On:"
                                        type="select"
                                        name="wastageon"
                                        value={formData.wastageon}
                                        onChange={handleChange}
                                        options={[
                                            { value: "Gross Weight", label: "Gross Weight" },
                                            { value: "Weight WW", label: "Weight WW" },
                                        ]}
                                    />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="Wastage %:"  value={formData.wastagepercentage}
                                            onChange={handleChange}
                                            name="wastagepercentage" />
                                    </div>
                                    {/* <div className="col-md-3">
                                        <InputField label="%:"
                                            value={formData.percentage}
                                            onChange={handleChange}
                                            name="percentage"
                                        />
                                    </div> */}
                                    <div className="col-md-3">
                                        <InputField label="Wastage Weight:"
                                            value={formData.wastageweight}
                                            onChange={handleChange}
                                            name="wastageweight"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                    <InputField label="total Weight:"
                                        name="totalweight"
                                        value={formData.totalweight}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Making Charges On:"
                                            type="select"
                                            value={formData.charges}
                                            onChange={handleChange}
                                            name="charges"
                                            options={[{ value: "By Weight", label: "by Weight" },
                                                { value: "Fixed", label: "Fixed" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                    <InputField label="Mc Per Gram:"
                                        name="mcpergram"
                                        value={formData.mcpergram}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="Making Charges:"
                                            value={formData.makingcharges}
                                            onChange={handleChange}
                                            name="makingcharges"
                                        />
                                    </div>
                                    {/* <div className="col-md-3">
                                        <InputField label="Cal:"
                                            value={formData.cal}
                                            onChange={handleChange}
                                            name="cal"
                                        />
                                    </div> */}
                                    {/* <div className="col-md-3">
                                        <InputField label="Tax:"
                                            value={formData.tax}
                                            onChange={handleChange}
                                            name="tax"
                                        />
                                    </div> */}
                                    <div className="col-md-3">
                                        {/* <div className="input-group"> */}
                                            <InputField
                                                label="Stock Point:"
                                                type="select"
                                                value={formData.stackpoint}
                                                onChange={handleChange}
                                                name="tax"
                                                options={[
                                                    { value: "Main Store", label: "Main Store" },
                                                    { value: "Secondary Store", label: "Secondary Store" },
                                                ]}
                                            />
                                              {/* </div> */}
                                            {/* <button
                                                type="button" style={{ height: '39px' }}
                                                className="btn btn-outline-secondary"
                                            // onClick={() => setShowStockPointModal(true)}
                                            >
                                                +
                                            </button> */}
                                      
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="cus-back-btn"
                                variant="secondary"
                                onClick={handleBack} style={{ backgroundColor: 'gray', marginRight: '10px' }}
                            >
                                cancel
                            </button>
                            <button type="submit" className="cus-submit-btn">Save</button>
                        </form>
                    </div>
                </div>

            </div>
            <StoneDetailsModal
                showModal={showModal}
                handleCloseModal={handleCloseModal}
            />
        </div>
    );
};

export default StockEntry;
