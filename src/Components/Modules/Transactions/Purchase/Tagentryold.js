import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../StockEntry/StockEntry.css";
import InputField from "../../Masters/ItemMaster/Inputfield";
import StoneDetailsModal from "./PurchaseStoneDetails";
import { useNavigate } from "react-router-dom";
import baseURL from "../../../../Url/NodeBaseURL";

const TagEntry = ({ handleCloseModal1, selectedProduct }) => {
    const [productDetails, setProductDetails] = useState({
        pcs: selectedProduct?.pcs || 0,
        gross_weight: selectedProduct?.gross_weight || 0,
    });
    
    const [productOptions, setProductOptions] = useState([]);
    const [formData, setFormData] = useState({
        product_id: selectedProduct.product_id,
        Pricing: "",
        Tag_ID: "",
        Prefix: "tag",
        Category: selectedProduct.metal_type,
        Purity: selectedProduct.purity,
        PCode_BarCode: "",
        Gross_Weight: "",
        Stones_Weight: "",
        Stones_Price: "",
        HUID_No: "",
        Wastage_On: "",
        Wastage_Percentage: "",
        Status: "sold",
        Source: "Purchase",
        Stock_Point: "",
        WastageWeight: "",
        TotalWeight_AW: "",
        MC_Per_Gram: "",
        Making_Charges_On: "",
        Making_Charges: "",
        Design_Master: selectedProduct.design_name,
        product_Name: selectedProduct.product_name,
        Weight_BW: "",
    });

    const handleUpdateStoneDetails = (totalWeight, totalPrice) => {
        setFormData({
            ...formData,
            Stones_Weight: totalWeight.toFixed(2),
            Stones_Price: totalPrice.toFixed(2),
        });
    };

    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({
    //         ...prev,
    //         [name]: value,
    //     }));
    // };

    // Automatically calculate Weight_BW when Gross_Weight or Stones_Weight changes
    useEffect(() => {
        const grossWeight = parseFloat(formData.Gross_Weight) || 0;
        const stonesWeight = parseFloat(formData.Stones_Weight) || 0;
        const weightBW = grossWeight - stonesWeight;

        setFormData((prev) => ({
            ...prev,
            Weight_BW: weightBW.toFixed(2), // Ensures two decimal places
        }));
    }, [formData.Gross_Weight, formData.Stones_Weight]);
    // Automatically calculate WastageWeight and TotalWeight_AW
    useEffect(() => {
        const wastagePercentage = parseFloat(formData.Wastage_Percentage) || 0;
        const grossWeight = parseFloat(formData.Gross_Weight) || 0;
        const weightBW = parseFloat(formData.Weight_BW) || 0;

        let wastageWeight = 0;
        let totalWeight = 0;

        if (formData.Wastage_On === "Gross Weight") {
            wastageWeight = (grossWeight * wastagePercentage) / 100;
            totalWeight = weightBW + wastageWeight;
        } else if (formData.Wastage_On === "Weight BW") {
            wastageWeight = (weightBW * wastagePercentage) / 100;
            totalWeight = weightBW + wastageWeight;
        }

        setFormData((prev) => ({
            ...prev,
            WastageWeight: wastageWeight.toFixed(2),
            TotalWeight_AW: totalWeight.toFixed(2),
        }));
    }, [formData.Wastage_On, formData.Wastage_Percentage, formData.Gross_Weight, formData.Weight_BW]);

    const handleMakingChargesCalculation = () => {
        const totalWeight = parseFloat(formData.TotalWeight_AW) || 0;
        const mcPerGram = parseFloat(formData.MC_Per_Gram) || 0;
        const makingCharges = parseFloat(formData.Making_Charges) || 0;

        if (formData.Making_Charges_On === "By Weight") {
            const calculatedMakingCharges = totalWeight * mcPerGram;
            setFormData((prev) => ({
                ...prev,
                Making_Charges: calculatedMakingCharges.toFixed(2),
            }));
        } else if (formData.Making_Charges_On === "Fixed") {
            const calculatedMcPerGram = makingCharges / totalWeight;
            setFormData((prev) => ({
                ...prev,
                MC_Per_Gram: calculatedMcPerGram.toFixed(2),
            }));
        }
    };



    useEffect(() => {
        handleMakingChargesCalculation();
    }, [formData.Making_Charges_On, formData.MC_Per_Gram, formData.Making_Charges, formData.TotalWeight_AW]);

    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/stockEntryTable");
    };
    
    

    // Fetch product options for P ID dropdown (product_id)
    useEffect(() => {
        axios.get(`${baseURL}/get/products`)
            .then((response) => {
                const options = response.data.map((product) => ({
                    value: product.product_id,
                    label: `${product.product_id}`,
                }));
                setProductOptions(options);
            })
            .catch((error) => console.error("Error fetching products:", error));
    }, []);

    // Handle field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "product_id" && value) {
            // Fetch details for the selected product ID
            axios.get(`${baseURL}/get/products/${value}`)
                .then((response) => {
                    const product = response.data;
                    setFormData({
                        ...formData,
                        product_id: value,
                        product_Name: product.product_name,
                        Design_Master: product.design_master,
                        Category: product.Category,
                        Purity: product.purity,
                    });
                })
                .catch((error) =>
                    console.error(`Error fetching product details for ID: ${value}`, error)
                );
        }
    };
   
    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedGrossWeight = productDetails.gross_weight - (parseFloat(formData.Gross_Weight) || 0);
        const updatedPcs = productDetails.pcs - 1; // Decrement by 1

        try {
            // Save the form data
            await axios.post(`${baseURL}/post/opening-tags-entry`, formData, {
                headers: { 'Content-Type': 'application/json' },
            });

            // Update the gross weight and pieces count
            await axios.post(`${baseURL}/post/update-values`, {
                gross_weight: updatedGrossWeight,
                pieces: updatedPcs,
                product_id: selectedProduct.product_id, // Store product ID with the data
            });

            // Update UI with new data
            setProductDetails((prevDetails) => ({
                ...prevDetails,
                pcs: updatedPcs,
                gross_weight: updatedGrossWeight,
            }));

            alert('Data and updated values saved successfully!');
        } catch (error) {
            if (error.response) {
                alert(`Error: ${error.response.data.message || 'Invalid input data'}`);
            } else if (error.request) {
                alert('No response received from the server. Please try again.');
            } else {
                alert('An error occurred. Please check the console for details.');
            }
            console.error(error);
        }
    };
    

   useEffect(() => {
        if (selectedProduct?.product_id) {
            fetch(`${baseURL}/get/update-values?product_id=${selectedProduct.product_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch product details');
                    }
                    return response.json();
                })
                .then((data) => {
                    const fetchedData = data?.data?.[0] || {};
                    setProductDetails({
                        pcs: fetchedData.pieces || selectedProduct.pcs,
                        gross_weight: fetchedData.gross_weight || selectedProduct.gross_weight,
                    });
                })
                .catch((error) => {
                    console.error('Error fetching product details:', error);
                    alert('Failed to fetch product details. Please try again later.');
                });
        }
    }, [selectedProduct, baseURL]);


    return (
        <div style={{ paddingTop: "0px" }}>
            <div>
            <h4>Pieces: {productDetails.pcs}</h4>
            <h4>Gross Weight: {productDetails.gross_weight}</h4>

            {/* <h4>Pieces: {displayPieces}</h4> 
            <h4>Gross Weight: {displayGrossWeight}</h4>  */}
            </div>
            <div className="container mt-4">
                <div className="row mt-3">
                    <div className="col-12">
                        <form className="p-4 border rounded form-container-stockentry" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                {/* <h4>Stock Entry</h4> */}
                                <div className="row g-3">
                                    <div className="col-md-2">
                                        <InputField
                                            label="Pricing:"
                                            name="Pricing"
                                            type="select"
                                            value={formData.Pricing}
                                            onChange={handleChange}
                                            options={[
                                                { value: "By Weight", label: "By Weight" },
                                                { value: "By fixed", label: "By fixed" },
                                            ]}
                                        />
                                    </div>
                                    {/* <div className="col-md-2">
                                        <InputField
                                            label="P ID:"
                                            name="product_id"
                                            type="select"
                                            value={formData.product_id}
                                            onChange={handleChange}
                                            options={productOptions}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <InputField
                                            label="Tag ID:"
                                            name="Tag_ID"
                                            value={formData.Tag_ID}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Product Name:"
                                            name="product_Name"
                                            value={formData.product_Name}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Design Master:"
                                            name="Design_Master"
                                            value={formData.Design_Master}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Category:"
                                            name="Category"
                                            value={formData.Category}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField label="Prefix:" value="tag" readOnly />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Purity:"
                                            name="Purity"
                                            value={formData.Purity}
                                            readOnly
                                        />
                                    </div> */}
                                    <div className="col-md-3">
                                        <InputField
                                            label="PCode/BarCode:"
                                            name="PCode_BarCode"
                                            value={formData.PCode_BarCode}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <InputField
                                            label="Gross Weight:"
                                            name="Gross_Weight"
                                            value={formData.Gross_Weight}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Stones Weight:"
                                            name="Stones_Weight"
                                            value={formData.Stones_Weight}
                                            onChange={handleChange}
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
                                    <div className="col-md-2">
                                        <InputField
                                            label="Stones Price:"
                                            name="Stones_Price"
                                            value={formData.Stones_Price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <InputField label="Weight BW:"
                                            name="Weight_BW"
                                            value={formData.Weight_BW}
                                            onChange={handleChange}

                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <InputField
                                            label="Wastage On:"
                                            name="Wastage_On"
                                            type="select"
                                            value={formData.Wastage_On}
                                            onChange={handleChange}
                                            options={[
                                                { value: "Gross Weight", label: "Gross Weight" },
                                                { value: "Weight BW", label: "Weight BW" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Wastage %:"
                                            name="Wastage_Percentage"
                                            value={formData.Wastage_Percentage}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Wastage Weight:"
                                            name="WastageWeight"
                                            value={formData.WastageWeight}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Total Weight:"
                                            name="TotalWeight_AW"
                                            value={formData.TotalWeight_AW}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="Making Charges On:"
                                            name="Making_Charges_On"
                                            type="select"
                                            value={formData.Making_Charges_On}
                                            onChange={handleChange}
                                            options={[
                                                { value: "By Weight", label: "By Weight" },
                                                { value: "Fixed", label: "Fixed" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <InputField
                                            label="MC Per Gram:"
                                            name="MC_Per_Gram"
                                            value={formData.MC_Per_Gram}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <InputField
                                            label="Making Charges:"
                                            name="Making_Charges"
                                            value={formData.Making_Charges}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <InputField
                                            label="HUID No:"
                                            name="HUID_No"
                                            value={formData.HUID_No}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <InputField
                                            label="Stock Point:"
                                            name="Stock_Point"
                                            type="select"
                                            value={formData.Stock_Point}
                                            onChange={handleChange}
                                            options={[
                                                { value: "Main Store", label: "Main Store" },
                                                { value: "Secondary Store", label: "Secondary Store" },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* <button
                                type="button"
                                className="cus-back-btn"
                                onClick={handleCloseModal1}
                                style={{ backgroundColor: "gray", marginRight: "10px" }}
                            >
                                Cancel
                            </button> */}
                            <button type="submit" onClick={handleCloseModal1} className="cus-submit-btn">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <StoneDetailsModal
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                handleUpdateStoneDetails={handleUpdateStoneDetails}
            />
        </div>
    );
};

export default TagEntry;
