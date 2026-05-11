import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../StockEntry/StockEntry.css";
import InputField from "../../Masters/ItemMaster/Inputfield";
import StoneDetailsModal from "./PurchaseStoneDetails";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL";
import { Form, Row, Col } from 'react-bootstrap';
import { Modal, Button } from "react-bootstrap";  // Add this import

const TagEntry = ({ handleCloseTagModal, selectedProduct }) => {
    console.log("Pricing=", selectedProduct.Pricing)
    const [productDetails, setProductDetails] = useState({
        pcs: selectedProduct?.pcs || 0,
        gross_weight: selectedProduct?.gross_weight || 0,
    });
    const navigate = useNavigate();
    const [subCategories, setSubCategories] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [purityOptions, setPurityOptions] = useState([]);
    const [formData, setFormData] = useState({
        product_id: selectedProduct.product_id,
        category: selectedProduct.category,
        sub_category: "",
        subcategory_id: "",
        // subcategory_id: "SBI001",
        product_Name: "",
        design_master: "",
        Pricing: selectedProduct.Pricing,
        cut: "",
        clarity: "",
        color: "",
        Tag_ID: "",
        Prefix: "", // Default value
        // Category: selectedProduct.metal_type,
        Purity: selectedProduct.purity,
        metal_type: selectedProduct.metal_type,
        PCode_BarCode: "",
        Gross_Weight: "",
        Stones_Weight: "",
        deduct_st_Wt: "",
        stone_price_per_carat: "",
        Stones_Price: "",
        HUID_No: "",
        Wastage_On: "Gross Weight",
        Wastage_Percentage: "",
        Status: "Available",
        Source: "Purchase",
        Stock_Point: "",
        pieace_cost: "",
        WastageWeight: "",
        TotalWeight_AW: "",
        MC_Per_Gram: "",
        Making_Charges_On: "",
        Making_Charges: "",
        Design_Master: selectedProduct.design_name,
        Weight_BW: "",
    });
    const isByFixed = formData.Pricing === "By fixed";
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    useEffect(() => {
        if (selectedProduct) {
            setFormData((prevState) => ({
                ...prevState,
                category: selectedProduct.category || "",
            }));
        }
    }, [selectedProduct]);

    useEffect(() => {
        const grossWeight = parseFloat(formData.Gross_Weight) || 0;
        const stonesWeight = parseFloat(formData.Stones_Weight) || 0;
        const weightBW = grossWeight - stonesWeight;

        setFormData((prev) => ({
            ...prev,
            Weight_BW: weightBW.toFixed(2), // Ensures two decimal places
        }));
    }, [formData.Gross_Weight, formData.Stones_Weight]);

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

        if (formData.Making_Charges_On === "MC / Gram") {
            // Calculate Making Charges based on MC/Gram
            const calculatedMakingCharges = totalWeight * mcPerGram;
            setFormData((prev) => ({
                ...prev,
                Making_Charges: calculatedMakingCharges.toFixed(2), // Automatically set Making Charges
            }));
        } else if (formData.Making_Charges_On === "MC / Piece") {
            // Calculate MC/Gram based on fixed Making Charges
            const calculatedMcPerGram = totalWeight ? makingCharges / totalWeight : 0;
            setFormData((prev) => ({
                ...prev,
                MC_Per_Gram: calculatedMcPerGram.toFixed(2), // Automatically set MC/Gram
            }));
        }
    };

    useEffect(() => {
        handleMakingChargesCalculation();
    }, [
        formData.Making_Charges_On,
        formData.MC_Per_Gram,
        formData.Making_Charges,
        formData.TotalWeight_AW,
    ]);

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


    const isGoldCategory = formData.category && formData.category.toLowerCase().includes("gold");
    const isSilverCategory = formData.category && formData.category.toLowerCase().includes("silver");

    useEffect(() => {
        if (isGoldCategory) {
            setFormData((prevData) => ({
                ...prevData,
                Making_Charges_On: "MC %",
                MC_Per_Gram_Label: "MC%",
                Making_Charges: "", // Reset field when hidden
            }));
        } else if (isSilverCategory) {
            setFormData((prevData) => ({
                ...prevData,
                Making_Charges_On: "MC / Gram",
                MC_Per_Gram_Label: "MC/Gm",
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                MC_Per_Gram_Label: "MC/Gm",
            }));
        }
    }, [formData.category]);

    const handleChange = async (fieldOrEvent, valueArg) => {
       
        let field, value;
        if (fieldOrEvent && fieldOrEvent.target) {
            
            field = fieldOrEvent.target.name;
            value = fieldOrEvent.target.value;
        } else {
            
            field = fieldOrEvent;
            value = valueArg;
        }
        setFormData((prevData) => {
            let updatedData = { ...prevData, [field]: value };

            // Update MC field only if Making_Charges_On is "MC / Gram" or "MC / Piece"
            if (field === "Making_Charges_On") {
                if (value === "MC / Gram" || value === "MC / Piece") {
                    updatedData.Making_Charges = prevData.Making_Charges || "";
                } else {
                    updatedData.Making_Charges = ""; // Hide field
                }
            }

            // Update MC_Per_Gram_Label when Making_Charges_On changes
            if (field === "Making_Charges_On") {
                let newLabel = "MC/Gm"; // Default
                if (value === "MC %") newLabel = "MC%";
                else if (value === "MC / Gram") newLabel = "MC/Gm";
                else if (value === "MC / Piece") newLabel = "MC/Gm";

                updatedData.MC_Per_Gram_Label = newLabel;
            }

            // --- Calculate Stones Price ---
            if (field === "Stones_Weight" || field === "stone_price_per_carat") {
                const stoneWeight =
                    parseFloat(
                        field === "Stones_Weight" ? value : prevData.Stones_Weight
                    ) || 0;
                const stonePricePerCarat =
                    parseFloat(
                        field === "stone_price_per_carat"
                            ? value
                            : prevData.stone_price_per_carat
                    ) || 0;
                if (stoneWeight > 0 && stonePricePerCarat > 0) {
                    const calculatedStonePrice = (stoneWeight / 0.20) * stonePricePerCarat;
                    updatedData.Stones_Price = calculatedStonePrice.toFixed(2);
                } else {
                    updatedData.Stones_Price = "";
                }
            }

            // --- Recalculate Weight BW ---
            if (
                field === "Gross_Weight" ||
                field === "Stones_Weight" ||
                field === "deduct_st_Wt"
            ) {
                const grossWt = parseFloat(updatedData.Gross_Weight) || 0;
                const stonesWt = parseFloat(updatedData.Stones_Weight) || 0;
                // Use deduct_st_Wt value if available; default to "yes" if not set.
                const deductOption = updatedData.deduct_st_Wt
                    ? updatedData.deduct_st_Wt.toLowerCase()
                    : "yes";
                if (deductOption === "yes") {
                    updatedData.Weight_BW = (grossWt - stonesWt).toFixed(2);
                } else {
                    updatedData.Weight_BW = grossWt.toFixed(2);
                }
            }

            return updatedData;
        });

        // --- Handle Category Change ---
        if (field === "category") {
            setFormData((prevData) => ({
                ...prevData,
                category: value,
            }));
            return;
        }

        // --- Handle Sub-Category Change and Fetch Prefix/PCode_BarCode ---
        if (field === "sub_category") {
            const selectedCategory = subCategories.find(
                (category) => category.subcategory_id === parseInt(value)
            );

            const newPrefix = selectedCategory ? selectedCategory.prefix : "";
            if (newPrefix) {
                try {
                    const response = await axios.get(`${baseURL}/getNextPCodeBarCode`, {
                        params: { prefix: newPrefix },
                    });
                    const nextPCodeBarCode = response.data.nextPCodeBarCode;
                    setFormData((prevData) => ({
                        ...prevData,
                        sub_category: selectedCategory
                            ? selectedCategory.sub_category_name
                            : "",
                        subcategory_id: selectedCategory
                            ? selectedCategory.subcategory_id
                            : "",
                        item_prefix: newPrefix,
                        Prefix: newPrefix,
                        PCode_BarCode: nextPCodeBarCode,
                    }));
                } catch (error) {
                    console.error("Error fetching PCode_BarCode:", error);
                }
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    sub_category: selectedCategory
                        ? selectedCategory.sub_category_name
                        : "",
                    subcategory_id: selectedCategory
                        ? selectedCategory.subcategory_id
                        : "",
                    item_prefix: "",
                    Prefix: "",
                    PCode_BarCode: "",
                }));
            }
        }
    };



    // Condition to check if "silver" or "gold" exists in category (case insensitive)
    const isSilverOrGold = /silver|gold/i.test(formData.category);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate based on the Pricing field selection:
        if (formData.Pricing === "By fixed") {
            // For 'By fixed' pricing, only check that PCS is greater than 0.
            if (pcs <= 0) {
                alert("The product's PCS must be greater than zero to submit the form.");
                return;
            }
            // Additionally, ensure that Piece Cost is provided and is a valid number.
            if (!formData.pieace_cost || parseFloat(formData.pieace_cost) <= 0) {
                alert("Please enter a Piece Cost.");
                return;
            }
            // grossWeight can be 0 or greater.
        } else {
            // For pricing other than 'By fixed', both PCS and Gross Weight must be > 0.
            if (pcs <= 0 || grossWeight <= 0) {
                alert("The product's PCS and Gross Weight must be greater than zero to submit the form.");
                return;
            }
        }

        if (!formData.sub_category || !formData.subcategory_id) {
            alert("Please select a valid sub-category before submitting.");
            return;
        }

        try {
            const currentSuffix = parseInt(formData.suffix || "001", 10);
            const nextSuffix = (currentSuffix + 1).toString().padStart(3, "0");

            const updatedGrossWeight = -parseFloat(formData.Gross_Weight || 0);
            const updatedPcs = -1;

            // Replace with actual logic for `prev`
            const prev = {
                item_prefix: "", // Adjust as needed
            };

            // Save form data
            await axios.post(`${baseURL}/post/opening-tags-entry`, formData, {
                headers: { 'Content-Type': 'application/json' },
            });

            // Uncomment if the additional API is needed
            // await axios.post(`${baseURL}/add-entry`, {
            //     id: formData.id,
            //     product_id: formData.product_id,
            //     pcs: updatedPcs,
            //     gross_weight: updatedGrossWeight,
            //     added_at: new Date().toISOString(),
            // });

            alert("Stock added successfully!");

            fetchData();
            setFormData((prevData) => ({
                ...prevData,
                product_id: selectedProduct.product_id,
                category: selectedProduct.category,
                sub_category: "",
                subcategory_id: "",
                product_Name: "",
                design_master: "",
                Pricing: selectedProduct.Pricing,
                cut: "",
                color: "",
                clarity: "",
                Tag_ID: "",
                Prefix: "",
                metal_type: selectedProduct.metal_type,
                Purity: selectedProduct.purity,
                PCode_BarCode: `${prev?.item_prefix || ""}${nextSuffix}`,
                suffix: nextSuffix,
                Gross_Weight: "",
                Stones_Weight: "",
                deduct_st_Wt: "",
                stone_price_per_carat: "",
                Stones_Price: "",
                HUID_No: "",
                Wastage_On: "Gross Weight",
                Wastage_Percentage: "",
                Status: "Available",
                Source: "Purchase",
                Stock_Point: "",
                pieace_cost: "",
                WastageWeight: "",
                TotalWeight_AW: "",
                MC_Per_Gram: "",
                Making_Charges_On: prevData.Making_Charges_On, // Preserve value
                MC_Per_Gram_Label: prevData.MC_Per_Gram_Label, // Preserve value
                Making_Charges: "",
                Design_Master: selectedProduct.design_name,
                Weight_BW: "",
            }));
        } catch (error) {
            console.error(error);
            alert("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        const getLastPcode = async () => {
            try {
                const response = await axios.get(`${baseURL}/last-pbarcode`);
                const suffix = response.data.lastPCode_BarCode || "001"; // Fallback to "001" if no value is fetched
                setFormData((prev) => ({
                    ...prev,
                    suffix, // Store the fetched suffix
                    PCode_BarCode: `${prev.item_prefix || ""}${suffix}`, // Combine prefix with fetched suffix
                }));
            } catch (error) {
                console.error("Error fetching last PCode_BarCode:", error);
            }
        };

        getLastPcode();
    }, []);


    const [newSubCategory, setNewSubCategory] = useState({
        name: '',
        prefix: '',
        category: ''
    });

    const handleModalChange = (e) => {
        const { name, value } = e.target;
        // Update newSubCategory values
        setNewSubCategory((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === "prefix") {
            setFormData((prev) => ({
                ...prev,
                Prefix: value,
            }));
        }

        setNewSubCategory((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (selectedProduct) {
            console.log("Product ID:", selectedProduct.product_id);
            console.log("Product ID:", selectedProduct.metal_type); // Use product_id as needed
        }
    }, [selectedProduct]);

    const handleAddSubCategory = async () => {
        try {
            const data = {
                category_id: selectedProduct.product_id,
                subcategory_id: 1, // Assuming this is a static value or comes from somewhere else
                sub_category_name: newSubCategory.name,
                category: newSubCategory.category || formData.category,
                prefix: newSubCategory.prefix,
                metal_type: selectedProduct.metal_type,
            };

            // Make POST request to the API
            const response = await axios.post(`${baseURL}/post/subcategory`, data);

            if (response.status === 201) { // Use 201 instead of 200 for created status
                // Successfully added the subcategory
                handleCloseModal();
                console.log('Subcategory added successfully');
                alert("Subcategory added successfully");

                // Clear the form
                setNewSubCategory({
                    name: '',
                    prefix: '',
                    category: ''
                });

                // Refresh the subcategory list
                fetchSubCategories();
            } else {
                console.error('Error adding subcategory:', response);
            }
        } catch (error) {
            console.error('Error during API request:', error);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const response = await axios.get(`${baseURL}/get/subcategories`);
            const filteredSubCategories = response.data.filter(
                (subCategory) => subCategory.category_id === selectedProduct.product_id
            );
            setSubCategories(filteredSubCategories); // Set the filtered subcategories
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        }
    };

    useEffect(() => {
        if (selectedProduct?.product_id) {
            fetchSubCategories();
        }
    }, [selectedProduct]);

    const [designOptions, setdesignOptions] = useState([]);
    useEffect(() => {
        const fetchDesignMaster = async () => {
            try {
                const response = await axios.get(`${baseURL}/designmaster`);
                const designMasters = response.data.map((item) => {
                    console.log('Design ID:', item.design_id); // Log design_id
                    return {
                        value: item.design_name,
                        label: item.design_name,
                        id: item.design_id,
                    };
                });
                setdesignOptions(designMasters);
            } catch (error) {
                console.error('Error fetching design masters:', error);
            }
        };

        fetchDesignMaster();
    }, []);

    const [pcs, setPcs] = useState(null);
    const [grossWeight, setGrossWeight] = useState(null);

    const fetchData = async () => {
        try {
            const response = await fetch(`${baseURL}/entry/${selectedProduct.product_id}`);
            const data = await response.json();
            setPcs(data.pcs);
            setGrossWeight(data.gross_weight);

            // Update formData with the fetched values
            // setFormData((prev) => ({
            //   ...prev,
            //   Gross_Weight: data.gross_weight,
            // }));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [selectedProduct.product_id]);

    useEffect(() => {
        const fetchPurity = async () => {
            try {
                const response = await axios.get(`${baseURL}/purity`);
                const filteredPurity = response.data.filter(
                    (item) => item.metal.toLowerCase() === formData.metal_type.toLowerCase()
                );
                setPurityOptions(filteredPurity);

                console.log("Purity=", filteredPurity);

                // Set the default option based on metal type
                if (formData.metal_type.toLowerCase() === "gold") {
                    const defaultOption = filteredPurity.find((option) =>
                        ["22k", "22 kt", "22"].some((match) =>
                            option.name.toLowerCase().includes(match)
                        )
                    );
                    if (defaultOption) {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            purity: defaultOption.name, // Adjust based on your form data structure
                        }));
                    }
                } else if (formData.metal_type.toLowerCase() === "silver") {
                    const defaultOption = filteredPurity.find((option) =>
                        ["22k", "22 kt", "22"].some((match) =>
                            option.name.toLowerCase().includes(match)
                        )
                    );
                    if (defaultOption) {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            purity: defaultOption.name, // Adjust based on your form data structure
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (formData.metal_type) {
            fetchPurity();
        }
    }, [formData.metal_type]);

    return (
        <div style={{ paddingTop: "0px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <h4 style={{ margin: "0" }}>Pieces: {pcs !== null ? pcs : "0"}</h4>
                <h4 style={{ margin: "0" }}>Gross Weight: {grossWeight !== null ? grossWeight : "0"}</h4>
            </div>
            <div className="container mt-4 mb-4">
                <div className="row mt-3">
                    <div className="col-12">
                        <Form className="p-4 border rounded form-container-stockentry" >
                            <div className="stock-entry-form">
                                <h4 className="mb-4">Stock Entry</h4>
                                <Row className="stock-form-section">
                                    {/* Always visible fields */}
                                    <Col xs={12} md={2}>
                                        <InputField
                                            label="Category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                        />
                                    </Col>

                                    <Col xs={12} md={4} className="d-flex align-items-center">
                                        <div style={{ flex: 1 }}>
                                            <InputField
                                                label="Sub Category"
                                                name="sub_category"
                                                type="select"
                                                value={formData.sub_category}
                                                onChange={handleChange}
                                                options={subCategories.map((category) => ({
                                                    value: category.subcategory_id,
                                                    label: category.sub_category_name,
                                                }))}
                                                autoFocus
                                            />
                                        </div>
                                        <AiOutlinePlus
                                            size={20}
                                            color="black"
                                            onClick={handleOpenModal}
                                            style={{
                                                marginLeft: "10px",
                                                cursor: "pointer",
                                                marginBottom: "20px",
                                            }}
                                        />
                                    </Col>

                                    <Col xs={12} md={3}>
                                        <InputField
                                            label="Product Design Name"
                                            name="design_master"
                                            type="select"
                                            value={formData.design_master}
                                            onChange={handleChange}
                                            options={designOptions.map(option => ({ value: option.value, label: option.label }))}
                                        />
                                    </Col>

                                    <Col xs={12} md={3}>
                                        <InputField
                                            label="Pricing"
                                            name="Pricing"
                                            type="select"
                                            value={formData.Pricing}
                                            onChange={handleChange}
                                            options={[
                                                { value: "By Weight", label: "By Weight" },
                                                { value: "By fixed", label: "By fixed" },
                                            ]}
                                        />
                                    </Col>

                                    {/* Render different fields based on Pricing selection */}
                                    {isByFixed ? (
                                        // If Pricing is "By fixed", show only these fields:
                                        <>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="PCode/BarCode"
                                                    name="PCode_BarCode"
                                                    type="text"
                                                    value={formData.PCode_BarCode}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="HUID No"
                                                    name="HUID_No"
                                                    value={formData.HUID_No}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Stock Point"
                                                    name="Stock_Point"
                                                    type="select"
                                                    value={formData.Stock_Point}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: "Floor1", label: "Floor1" },
                                                        { value: "Floor2", label: "Floor2" },
                                                        { value: "Strong room", label: "Strong room" },
                                                    ]}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        // Otherwise (if Pricing is not "By fixed"), show all fields:
                                        <>
                                            <Col xs={12} md={3}>
                                                <InputField
                                                    label="Purity"
                                                    name="Purity"
                                                    type="select"
                                                    value={formData.Purity}
                                                    onChange={handleChange}
                                                    options={purityOptions.map((option) => ({
                                                        value: `${option.name} | ${option.purity}`,
                                                        label: `${option.name} | ${option.purity}`,
                                                    }))}
                                                />
                                            </Col>

                                            {!isSilverOrGold && (
                                                <>
                                                    <Col xs={12} md={2}>
                                                        <InputField
                                                            label="Cut"
                                                            name="cut"
                                                            value={formData.cut}
                                                            onChange={handleChange}
                                                        />
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <InputField
                                                            label="Color"
                                                            name="color"
                                                            value={formData.color}
                                                            onChange={handleChange}
                                                        />
                                                    </Col>
                                                    <Col xs={12} md={2}>
                                                        <InputField
                                                            label="Clarity"
                                                            name="clarity"
                                                            value={formData.clarity}
                                                            onChange={handleChange}
                                                        />
                                                    </Col>
                                                </>
                                            )}

                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="PCode/BarCode"
                                                    name="PCode_BarCode"
                                                    type="text"
                                                    value={formData.PCode_BarCode}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Gross Wt"
                                                    name="Gross_Weight"
                                                    value={formData.Gross_Weight}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Stones Wt"
                                                    name="Stones_Weight"
                                                    value={formData.Stones_Weight}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={3}>
                                                <InputField
                                                    label="Deduct St Wt"
                                                    name="deduct_st_Wt"
                                                    type="select"
                                                    value={formData.deduct_st_Wt || ""}
                                                    onChange={(e) => handleChange("deduct_st_Wt", e.target.value)}
                                                    options={[
                                                        { value: "yes", label: "Yes" },
                                                        { value: "no", label: "No" },
                                                    ]}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Stone Price/Carat"
                                                    name="stone_price_per_carat"
                                                    value={formData.stone_price_per_carat}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Stones Price"
                                                    name="Stones_Price"
                                                    value={formData.Stones_Price}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Weight BW"
                                                    name="Weight_BW"
                                                    value={formData.Weight_BW}
                                                    onChange={handleChange}
                                                    readOnly
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="MC On"
                                                    name="Making_Charges_On"
                                                    type="select"
                                                    value={formData.Making_Charges_On}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: "MC / Gram", label: "MC / Gram" },
                                                        { value: "MC / Piece", label: "MC / Piece" },
                                                        { value: "MC %", label: "MC %" },
                                                    ]}
                                                />
                                            </Col>

                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label={formData.MC_Per_Gram_Label}
                                                    name="MC_Per_Gram"
                                                    value={formData.MC_Per_Gram}
                                                    onChange={handleChange}
                                                />
                                            </Col>

                                            {/* Show Making_Charges field only when Making_Charges_On is "MC / Gram" or "MC / Piece" */}
                                            {(formData.Making_Charges_On === "MC / Gram" || formData.Making_Charges_On === "MC / Piece") && (
                                                <Col xs={12} md={2}>
                                                    <InputField
                                                        label="MC"
                                                        name="Making_Charges"
                                                        value={formData.Making_Charges}
                                                        onChange={handleChange}
                                                    />
                                                </Col>
                                            )}


                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Wastage On"
                                                    name="Wastage_On"
                                                    type="select"
                                                    value={formData.Wastage_On}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: "Gross Weight", label: "Gross Weight" },
                                                        { value: "Weight BW", label: "Weight BW" },
                                                    ]}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Wastage %"
                                                    name="Wastage_Percentage"
                                                    value={formData.Wastage_Percentage}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="W.Wt"
                                                    name="WastageWeight"
                                                    value={formData.WastageWeight}
                                                    onChange={handleChange}
                                                    readOnly
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Total Weight"
                                                    name="TotalWeight_AW"
                                                    value={formData.TotalWeight_AW}
                                                    onChange={handleChange}
                                                    readOnly
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="HUID No"
                                                    name="HUID_No"
                                                    value={formData.HUID_No}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Stock Point"
                                                    name="Stock_Point"
                                                    type="select"
                                                    value={formData.Stock_Point}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: "Floor1", label: "Floor1" },
                                                        { value: "Floor2", label: "Floor2" },
                                                        { value: "Strong room", label: "Strong room" },
                                                    ]}
                                                />
                                            </Col>
                                        </>
                                    )}

                                    {formData.Pricing === "By fixed" && (
                                        <Col xs={12} md={2}>
                                            <InputField
                                                label="Piece Cost"
                                                type="number"
                                                value={formData.pieace_cost}
                                                onChange={(e) => handleChange("pieace_cost", e.target.value)}

                                            />
                                        </Col>
                                    )}

                                </Row>

                            </div>
                            <div className="text-end mt-4">
                                <Button
                                    variant="secondary"
                                    onClick={handleCloseTagModal} style={{ backgroundColor: 'gray', marginRight: '10px' }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="success" style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }} onClick={handleSubmit}>Save</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Sub Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="categoryName">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                type="text"
                                name="category"
                                value={newSubCategory.category || formData.category}
                                onChange={handleModalChange}
                                placeholder="Enter category"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="subCategoryName">
                            <Form.Label>Sub Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newSubCategory.name}
                                onChange={handleModalChange}

                            />
                        </Form.Group>
                        <Form.Group controlId="subCategoryPrefix">
                            <Form.Label>Prefix</Form.Label>
                            <Form.Control
                                type="text"
                                name="prefix"
                                value={newSubCategory.prefix}
                                onChange={handleModalChange}

                            />
                        </Form.Group>

                        {/* <Form.Group controlId="categoryName">
                <Form.Label>Category</Form.Label>
                <Form.Control
                    type="text"
                    name="category"
                    value={formData.category} 
                    onChange={handleModalChange}
                   readOnly
                />
            </Form.Group> */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddSubCategory}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default TagEntry;
