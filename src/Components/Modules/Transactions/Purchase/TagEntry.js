import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../StockEntry/StockEntry.css";
import InputField from "./InputField";
import StoneDetailsModal from "./TagStoneDetailsModal";
import PurchaseStoneDetailsModal from "./PurchaseStoneDetailsModal";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import baseURL from "../../../../Url/NodeBaseURL";
import baseURL2 from "../../../../Url/NodeBaseURL2";
import "./TagEntry.css";
import { Form, Row, Col, Table } from 'react-bootstrap';
import * as XLSX from "xlsx";
import { FaCamera, FaUpload, FaTrash, FaEdit, FaFileExcel, FaEye } from "react-icons/fa";
import { Modal, Button, Dropdown, DropdownButton } from "react-bootstrap";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import Webcam from "react-webcam";

const TagEntry = ({ handleCloseTagModal, selectedProduct, fetchBalance }) => {
    console.log("Pricing=", selectedProduct.Pricing)
    console.log("Metal Type=", selectedProduct.metal_type)
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [productDetails, setProductDetails] = useState({
        pcs: selectedProduct?.pcs || 0,
        gross_weight: selectedProduct?.gross_weight || 0,
    });
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const webcamRef = useRef(null);
    const [subCategories, setSubCategories] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [purityOptions, setPurityOptions] = useState([]);
    const [showWebcam, setShowWebcam] = useState(false);
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({
        tag_id: selectedProduct.tag_id,
        product_id: selectedProduct.product_id,
        account_name: selectedProduct.account_name,
        category: selectedProduct.category,
        invoice: selectedProduct.invoice,
        sub_category: "",
        subcategory_id: "",
        product_Name: "",
        design_master: "",
        Pricing: selectedProduct.Pricing,
        cut: "",
        clarity: "",
        color: "",
        Tag_ID: "",
        Prefix: "",
        Purity: "",
        metal_type: selectedProduct.metal_type,
        PCode_BarCode: "",
        Gross_Weight: "",
        Stones_Weight: "",
        deduct_st_Wt: "Yes",
        stone_price_per_carat: "",
        Stones_Price: "",
        HUID_No: "",
        Wastage_On: "Gross Weight",
        Wastage_Percentage: "",
        Status: "Available",
        Source: "Purchase",
        Stock_Point: "Display Floor1",
        pieace_cost: "",
        tax_percent: "",
        mrp_price: "",
        total_pcs_cost: "",
        WastageWeight: "",
        TotalWeight_AW: "",
        MC_Per_Gram: "",
        Making_Charges_On: "",
        Making_Charges: "",
        Design_Master: selectedProduct.design_name,
        Weight_BW: "",
        rate: "",
        tax: "03% GST",
        tax_amt: "",
        total_price: "",
        pur_Gross_Weight: "",
        pur_rate_cut: "",
        pur_Purity: "",
        pur_purityPercentage: "",
        pur_Stones_Weight: "",
        pur_deduct_st_Wt: "Yes",
        pur_stone_price_per_carat: "",
        pur_Stones_Price: "",
        pur_Weight_BW: "",
        pur_Making_Charges_On: "",
        pur_MC_Per_Gram: "",
        pur_Making_Charges: "",
        pur_Wastage_On: "Gross Weight",
        pur_Wastage_Percentage: "",
        pur_WastageWeight: "",
        pur_TotalWeight_AW: "",
        size: "",
        tag_weight: "",
        pcs: "1",
        MC_Per_Gram_Label: "",
        printing_purity: '',
    });
    const [show, setShow] = useState(false);
    const [showPurchase, setShowPurchase] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleView = (item) => {
        setSelectedRow(item);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSelectedRow(null);
    };

    const [stoneDetails, setStoneDetails] = useState({
        stoneName: "",
        cut: "",
        color: "",
        clarity: "",
        stoneWt: "",
        caratWt: "",
        stonePrice: "",
        amount: "",
    });

    const [stoneList, setStoneList] = useState([]);
    const [editingStoneIndex, setEditingStoneIndex] = useState(null);

    useEffect(() => {
        const fetchCurrentRates = async () => {
            try {
                const response = await axios.get(`${baseURL}/get/current-rates`);
                const newRates = {
                    rate_24crt: response.data.rate_24crt || "",
                    rate_22crt: response.data.rate_22crt || "",
                    rate_18crt: response.data.rate_18crt || "",
                    rate_16crt: response.data.rate_16crt || "",
                    silver_rate: response.data.silver_rate || "",
                };
                setRates(newRates);

                const metalType = formData.metal_type?.toLowerCase();

                setFormData((prev) => ({
                    ...prev,
                    rate_24k: metalType === "silver" ? newRates.silver_rate : newRates.rate_24crt,
                }));
            } catch (error) {
                console.error('Error fetching current rates:', error);
            }
        };

        fetchCurrentRates();
    }, [formData.metal_type]);

    const handleAddStone = () => {
        let newStoneList = [...stoneList];

        if (editingStoneIndex !== null) {
            newStoneList[editingStoneIndex] = stoneDetails;
            setEditingStoneIndex(null);
        } else {
            newStoneList.push(stoneDetails);
        }

        setStoneList(newStoneList);
        localStorage.setItem("tagStoneDetails", JSON.stringify(newStoneList));
        window.dispatchEvent(new Event("storage"));
        setStoneDetails({
            stoneName: "",
            cut: "",
            color: "",
            clarity: "",
            stoneWt: "",
            caratWt: "",
            stonePrice: "",
            amount: "",
        });
    };

    const handleEditStone = (index) => {
        const selectedStone = stoneList[index];
        setStoneDetails(selectedStone);
        setEditingStoneIndex(index);
        handleShow();
    };

    const handleDeleteStone = (index) => {
        const updatedList = stoneList.filter((_, i) => i !== index);
        setStoneList(updatedList);
        localStorage.setItem("tagStoneDetails", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("storage"));
    };

    const handleShowPurchase = () => {
        console.log("Opening PurchaseStoneDetailsModal...");
        setShowPurchase(true);
    };

    const handleClosePurchase = () => setShowPurchase(false);

    const [purStoneDetails, setPurStoneDetails] = useState({
        stoneName: "",
        cut: "",
        color: "",
        clarity: "",
        stoneWt: "",
        caratWt: "",
        stonePrice: "",
        amount: "",
    });
    const [purchaseStoneList, setPurchaseStoneList] = useState([]);
    const [editingPurchaseStoneIndex, setEditingPurchaseStoneIndex] = useState(null);

    const handleAddTagPurStone = () => {
        let newPurchaseStoneList = [...purchaseStoneList];

        if (editingPurchaseStoneIndex !== null) {
            newPurchaseStoneList[editingPurchaseStoneIndex] = purStoneDetails;
            setEditingPurchaseStoneIndex(null);
        } else {
            newPurchaseStoneList.push(purStoneDetails);
        }

        setPurchaseStoneList(newPurchaseStoneList);
        localStorage.setItem("tagPurStoneDetails", JSON.stringify(newPurchaseStoneList));
        window.dispatchEvent(new Event("storage"));
        setPurStoneDetails({
            stoneName: "",
            cut: "",
            color: "",
            clarity: "",
            stoneWt: "",
            caratWt: "",
            stonePrice: "",
            amount: "",
        });
    };

    const handleTagPurEditStone = (index) => {
        const selectedStone = purchaseStoneList[index];
        setPurStoneDetails(selectedStone);
        setEditingPurchaseStoneIndex(index);
        handleShowPurchase();
    };

    const handleTagPurDeleteStone = (index) => {
        const updatedList = purchaseStoneList.filter((_, i) => i !== index);
        setPurchaseStoneList(updatedList);
        localStorage.setItem("tagPurStoneDetails", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("storage"));
    };

    const isByFixed = formData.Pricing === "By fixed";
    const [isGeneratePDF, setIsGeneratePDF] = useState(true);
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
        const calculateTotalWeight = () => {
            const storedStoneDetails = JSON.parse(localStorage.getItem("tagStoneDetails")) || [];

            const totalStoneWeight = storedStoneDetails.reduce(
                (sum, item) => sum + (parseFloat(item.stoneWt) || 0),
                0
            );
            const totalStoneValue = storedStoneDetails.reduce(
                (sum, item) => sum + (parseFloat(item.amount) || 0),
                0
            );

            setFormData((prevData) => ({
                ...prevData,
                Stones_Weight: totalStoneWeight.toFixed(3),
                Stones_Price: totalStoneValue.toFixed(2),
            }));
        };

        calculateTotalWeight();

        const handleStorageChange = () => calculateTotalWeight();
        window.addEventListener("storage", handleStorageChange);

        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        const calculateTotalWeight = () => {
            const storedStoneDetails = JSON.parse(localStorage.getItem("tagPurStoneDetails")) || [];

            const totalStoneWeight = storedStoneDetails.reduce(
                (sum, item) => sum + (parseFloat(item.stoneWt) || 0),
                0
            );
            const totalStoneValue = storedStoneDetails.reduce(
                (sum, item) => sum + (parseFloat(item.amount) || 0),
                0
            );

            setFormData((prevData) => ({
                ...prevData,
                pur_Stones_Weight: totalStoneWeight.toFixed(3),
                pur_Stones_Price: totalStoneValue.toFixed(2),
            }));
        };

        calculateTotalWeight();

        const handleStorageChange = () => calculateTotalWeight();
        window.addEventListener("storage", handleStorageChange);

        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        const wastagePercentage = parseFloat(formData.Wastage_Percentage) || 0;
        const grossWeight = parseFloat(formData.Gross_Weight) || 0;
        const weightBW = parseFloat(formData.Weight_BW) || 0;
        const purWastagePercentage = parseFloat(formData.pur_Wastage_Percentage) || 0;
        const purGrossWeight = parseFloat(formData.pur_Gross_Weight) || 0;
        const purWeightBW = parseFloat(formData.pur_Weight_BW) || 0;

        let wastageWeight = 0;
        let totalWeight = 0;
        let purWastageWeight = 0;
        let purTotalWeight = 0;

        if (formData.Wastage_On === "Gross Weight") {
            wastageWeight = (grossWeight * wastagePercentage) / 100;
            totalWeight = weightBW + wastageWeight;
        } else if (formData.Wastage_On === "Weight BW") {
            wastageWeight = (weightBW * wastagePercentage) / 100;
            totalWeight = weightBW + wastageWeight;
        }

        if (formData.pur_Wastage_On === "Gross Weight") {
            purWastageWeight = (purGrossWeight * purWastagePercentage) / 100;
            purTotalWeight = purWeightBW + purWastageWeight;
        } else if (formData.pur_Wastage_On === "Weight BW") {
            purWastageWeight = (purWeightBW * purWastagePercentage) / 100;
            purTotalWeight = purWeightBW + purWastageWeight;
        }

        setFormData((prev) => ({
            ...prev,
            WastageWeight: wastageWeight.toFixed(3),
            TotalWeight_AW: totalWeight.toFixed(3),
            pur_WastageWeight: purWastageWeight.toFixed(3),
            pur_TotalWeight_AW: purTotalWeight.toFixed(3),
        }));
    }, [formData.Wastage_On, formData.Wastage_Percentage, formData.Gross_Weight, formData.Weight_BW,
    formData.pur_Wastage_On, formData.pur_Wastage_Percentage, formData.pur_Gross_Weight, formData.pur_Weight_BW
    ]);

    const handleMakingChargesCalculation = () => {
        const totalWeight = parseFloat(formData.TotalWeight_AW) || 0;
        const mcPerGram = parseFloat(formData.MC_Per_Gram) || 0;
        const makingCharges = parseFloat(formData.Making_Charges) || 0;
        const rate = parseFloat(formData.rate) || 0;

        const purTotalWeight = parseFloat(formData.pur_TotalWeight_AW) || 0;
        const purMcPerGram = parseFloat(formData.pur_MC_Per_Gram) || 0;
        const purMakingCharges = parseFloat(formData.pur_Making_Charges) || 0;
        const purRate = parseFloat(formData.pur_rate_cut) || 0;

        if (formData.Making_Charges_On === "MC / Gram") {
            const calculatedMakingCharges = totalWeight * mcPerGram;

            setFormData((prev) => ({
                ...prev,
                Making_Charges: calculatedMakingCharges.toFixed(2),
            }));

        } else if (formData.Making_Charges_On === "MC / Piece") {
            const calculatedMcPerGram = totalWeight
                ? makingCharges / totalWeight
                : 0;

            setFormData((prev) => ({
                ...prev,
                MC_Per_Gram: calculatedMcPerGram.toFixed(2),
            }));

        } else if (formData.Making_Charges_On === "MC %") {
            const rateAmount = rate * totalWeight;

            const calculatedMakingCharges =
                (mcPerGram * rateAmount) / 100;

            setFormData((prev) => ({
                ...prev,
                Making_Charges: calculatedMakingCharges.toFixed(2),
            }));
        }

        if (formData.pur_Making_Charges_On === "MC / Gram") {
            const calculatedMakingCharges =
                purTotalWeight * purMcPerGram;

            setFormData((prev) => ({
                ...prev,
                pur_Making_Charges: calculatedMakingCharges.toFixed(2),
            }));

        } else if (formData.pur_Making_Charges_On === "MC / Piece") {
            const calculatedMcPerGram = purTotalWeight
                ? purMakingCharges / purTotalWeight
                : 0;

            setFormData((prev) => ({
                ...prev,
                pur_MC_Per_Gram: calculatedMcPerGram.toFixed(2),
            }));

        } else if (formData.pur_Making_Charges_On === "MC %") {
            const rateAmount = purRate * purTotalWeight;

            const calculatedMakingCharges =
                (purMcPerGram * rateAmount) / 100;

            setFormData((prev) => ({
                ...prev,
                pur_Making_Charges: calculatedMakingCharges.toFixed(2),
            }));
        }
    };

    useEffect(() => {
        const rate = parseFloat(formData.rate) || 0;
        const weight = parseFloat(formData.TotalWeight_AW) || 0;
        const stonesPrice = parseFloat(formData.Stones_Price) || 0;
        const makingCharges = parseFloat(formData.Making_Charges) || 0;

        const baseAmount =
            rate * weight + stonesPrice + makingCharges;

        const taxPercent = parseFloat(formData.tax) || 0;

        const taxAmt = (baseAmount * taxPercent) / 100;

        const totalPrice = baseAmount + taxAmt;

        setFormData((prev) => ({
            ...prev,
            tax_amt: taxAmt.toFixed(2),
            total_price: totalPrice.toFixed(2),
        }));
    }, [
        formData.rate,
        formData.TotalWeight_AW,
        formData.Stones_Price,
        formData.Making_Charges,
        formData.tax,
    ]);

    useEffect(() => {
        handleMakingChargesCalculation();
    }, [
        formData.Making_Charges_On,
        formData.MC_Per_Gram,
        formData.Making_Charges,
        formData.TotalWeight_AW,
        formData.pur_Making_Charges_On,
        formData.pur_MC_Per_Gram,
        formData.pur_Making_Charges,
        formData.pur_TotalWeight_AW,
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

    const isGoldCategory = formData.category &&
        ["gold", "diamond", "others"].some((metal) => formData.category.toLowerCase().includes(metal));

    const isSilverCategory = formData.category && formData.category.toLowerCase().includes("silver");

    useEffect(() => {
        if (isGoldCategory) {
            setFormData((prevData) => ({
                ...prevData,
                Making_Charges_On: "MC %",
                MC_Per_Gram_Label: "MC%",
                Making_Charges: "",
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

    useEffect(() => {
        if (isGoldCategory) {
            setFormData((prevData) => ({
                ...prevData,
                pur_Making_Charges_On: "MC %",
                pur_MC_Per_Gram_Label: "MC%",
                pur_Making_Charges: "",
            }));
        } else if (isSilverCategory) {
            setFormData((prevData) => ({
                ...prevData,
                pur_Making_Charges_On: "MC / Gram",
                pur_MC_Per_Gram_Label: "MC/Gm",
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                pur_MC_Per_Gram_Label: "MC/Gm",
            }));
        }
    }, [formData.category]);

    const [rates, setRates] = useState({
        rate_24crt: "",
        rate_22crt: "",
        rate_18crt: "",
        rate_16crt: ""
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await axios.get(`${baseURL}/get/current-rates`);
                setRates({
                    rate_24crt: response.data.rate_24crt || "",
                    rate_22crt: response.data.rate_22crt || "",
                    rate_18crt: response.data.rate_18crt || "",
                    rate_16crt: response.data.rate_16crt || "",
                    silver_rate: response.data.silver_rate || "",
                });
            } catch (error) {
                console.error("Error fetching current rates:", error);
            }
        };
        fetchRates();
    }, []);

    useEffect(() => {
        if (formData.pur_Purity && formData.metal_type) {
            const normalizedValue = formData.pur_Purity.toLowerCase();
            const metalType = formData.metal_type.toLowerCase();
            let newRate = "";

            if (metalType === "silver") {
                newRate = rates.silver_rate;
            } else {
                if (normalizedValue === "manual") {
                    newRate = rates.rate_22crt;
                } else if (normalizedValue.includes("22")) {
                    newRate = rates.rate_22crt;
                } else if (normalizedValue.includes("24")) {
                    newRate = rates.rate_24crt;
                } else if (normalizedValue.includes("18")) {
                    newRate = rates.rate_18crt;
                } else if (normalizedValue.includes("16")) {
                    newRate = rates.rate_16crt;
                } else {
                    newRate = rates.rate_22crt;
                }
            }

            setFormData((prev) => ({
                ...prev,
                pur_rate_cut: newRate,
            }));
        }
    }, [formData.pur_Purity, formData.metal_type, rates]);

    useEffect(() => {
        if (!formData.Purity) {
            setFormData((prev) => ({
                ...prev,
                rate: "",
            }));
            return;
        }

        const purityValue = parseFloat(formData.Purity);
        const baseRate = parseFloat(formData.rate_24k);

        if (!isNaN(purityValue) && !isNaN(baseRate)) {
            const calculatedRate = ((purityValue / 100) * baseRate).toFixed(2);

            setFormData((prev) => ({
                ...prev,
                rate: calculatedRate,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                rate: "",
            }));
        }
    }, [formData.Purity, formData.rate_24k]);

    const handleChange = async (fieldOrEvent, valueArg) => {
        let field, value;
        if (fieldOrEvent && fieldOrEvent.target) {
            field = fieldOrEvent.target.name;
            value = fieldOrEvent.target.value;

            if (fieldOrEvent.target.type === "file") {
                const file = fieldOrEvent.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFormData((prev) => ({
                            ...prev,
                            productImage: file,
                            imagePreview: reader.result,
                        }));
                    };
                    reader.readAsDataURL(file);
                }
                return;
            }
        } else {
            field = fieldOrEvent;
            value = valueArg;
        }

        if (field === "sub_category") {
            const selectedCategory = subCategories.find(
                (category) => category.sub_category_name === value
            );

            if (selectedCategory) {
                try {
                    const response = await axios.get(`${baseURL}/getNextPCodeBarCode`, {
                        params: { prefix: selectedCategory.prefix },
                    });

                    const nextPCodeBarCode = response.data.nextPCodeBarCode;

                    setFormData((prevData) => ({
                        ...prevData,
                        sub_category: selectedCategory.sub_category_name,
                        subcategory_id: selectedCategory.subcategory_id,
                        item_prefix: selectedCategory.prefix,
                        Prefix: selectedCategory.prefix,
                        PCode_BarCode: nextPCodeBarCode,
                        suffix: nextPCodeBarCode.replace(selectedCategory.prefix, ""),
                        Purity: selectedCategory.selling_purity || "",
                        pur_Purity: selectedCategory.purity || "",
                        printing_purity: selectedCategory.printing_purity || "",
                    }));
                } catch (error) {
                    console.error("Error fetching PCode_BarCode:", error);
                }
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    sub_category: "",
                    subcategory_id: "",
                    item_prefix: "",
                    Prefix: "",
                    PCode_BarCode: "",
                    Purity: "",
                    pur_Purity: "",
                    printing_purity: "",
                }));
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [field]: value,
            }));
        }

        setFormData((prevData) => {
            let updatedData = { ...prevData, [field]: value };

            if (field === "Gross_Weight") {
                updatedData.pur_Gross_Weight = value;
            }

            if (field === "Making_Charges_On") {
                if (value === "MC / Gram" || value === "MC / Piece") {
                    updatedData.Making_Charges = prevData.Making_Charges || "";
                } else {
                    updatedData.Making_Charges = "";
                }
            }

            if (field === "pur_Making_Charges_On") {
                if (value === "MC / Gram" || value === "MC / Piece") {
                    updatedData.pur_Making_Charges = prevData.pur_Making_Charges || "";
                } else {
                    updatedData.pur_Making_Charges = "";
                }
            }

            if (field === "Making_Charges_On") {
                let newLabel = "MC/Gm";
                if (value === "MC %") newLabel = "MC%";
                else if (value === "MC / Gram") newLabel = "MC/Gm";
                else if (value === "MC / Piece") newLabel = "MC/Gm";

                updatedData.MC_Per_Gram_Label = newLabel;
            }

            if (field === "pur_Making_Charges_On") {
                let newLabel = "MC/Gm";
                if (value === "MC %") newLabel = "MC%";
                else if (value === "MC / Gram") newLabel = "MC/Gm";
                else if (value === "MC / Piece") newLabel = "MC/Gm";

                updatedData.pur_MC_Per_Gram_Label = newLabel;
            }

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

            if (field === "pur_Stones_Weight" || field === "pur_stone_price_per_carat") {
                const stoneWeight =
                    parseFloat(
                        field === "pur_Stones_Weight" ? value : prevData.pur_Stones_Weight
                    ) || 0;
                const stonePricePerCarat =
                    parseFloat(
                        field === "pur_stone_price_per_carat"
                            ? value
                            : prevData.pur_stone_price_per_carat
                    ) || 0;
                if (stoneWeight > 0 && stonePricePerCarat > 0) {
                    const calculatedStonePrice = (stoneWeight / 0.20) * stonePricePerCarat;
                    updatedData.pur_Stones_Price = calculatedStonePrice.toFixed(2);
                } else {
                    updatedData.pur_Stones_Price = "";
                }
            }

            if (
                field === "Gross_Weight" ||
                field === "Stones_Weight" ||
                field === "deduct_st_Wt" ||
                field === "pur_Gross_Weight" ||
                field === "pur_Stones_Weight" ||
                field === "pur_deduct_st_Wt"
            ) {
                const grossWt = parseFloat(updatedData.Gross_Weight) || 0;
                const stonesWt = parseFloat(updatedData.Stones_Weight) || 0;
                const deductOption = updatedData.deduct_st_Wt
                    ? updatedData.deduct_st_Wt.toLowerCase()
                    : "";

                if (deductOption === "yes") {
                    updatedData.Weight_BW = (grossWt - stonesWt).toFixed(2);
                } else {
                    updatedData.Weight_BW = grossWt.toFixed(2);
                }

                const purGrossWt = parseFloat(updatedData.pur_Gross_Weight) || 0;
                const purStonesWt = parseFloat(updatedData.pur_Stones_Weight) || 0;
                const purDeductOption = updatedData.pur_deduct_st_Wt
                    ? updatedData.pur_deduct_st_Wt.toLowerCase()
                    : "";

                if (purDeductOption === "yes") {
                    updatedData.pur_Weight_BW = (purGrossWt - purStonesWt).toFixed(2);
                } else {
                    updatedData.pur_Weight_BW = purGrossWt.toFixed(2);
                }
            }

            if (field === "pieace_cost" || field === "tax_percent") {
                const taxPercent = parseFloat(field === "tax_percent" ? value : prevData.tax_percent) || 0;
                const pieaceCost = parseFloat(field === "pieace_cost" ? value : prevData.pieace_cost) || 0;
                const mrpPrice = (pieaceCost * taxPercent / 100) + pieaceCost;
                updatedData.mrp_price = mrpPrice.toFixed(2);
            }

            if (field === "pieace_cost" || field === "pcs") {
                const pcs = parseFloat(field === "pcs" ? value : prevData.pcs) || 0;
                const pieaceCost = parseFloat(field === "pieace_cost" ? value : prevData.pieace_cost) || 0;
                updatedData.total_pcs_cost = (pcs * pieaceCost).toFixed(2);
            }

            if (field === "mrp_price") {
                const mrpPrice = parseFloat(value) || 0;
                const taxPercent = parseFloat(prevData.tax_percent) || 0;

                const pieaceCost = ((mrpPrice / (100 + taxPercent)) * 100);
                updatedData.pieace_cost = pieaceCost.toFixed(2);

                const pcs = parseFloat(prevData.pcs) || 0;
                updatedData.total_pcs_cost = (pcs * pieaceCost).toFixed(2);
            }
            return updatedData;
        });

        if (field === "category") {
            setFormData((prevData) => ({
                ...prevData,
                category: value,
            }));
            return;
        }
    };

    const isGeneratePDFRef = useRef(isGeneratePDF);

    useEffect(() => {
        isGeneratePDFRef.current = isGeneratePDF;
    }, [isGeneratePDF]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.altKey && event.key.toLowerCase() === "s") {
                event.preventDefault();
                console.log("Alt + S detected, submitting form...");

                const pcsValue = parseFloat(formData.pcs) || 0;
                const grossWeightValue = parseFloat(formData.Gross_Weight) || 0;

                console.log("PCS:", pcsValue, "Gross Weight:", grossWeightValue);

                if (formData.Pricing === "By fixed" && pcsValue <= 0) {
                    alert("The product's PCS must be greater than zero to submit the form.");
                    return;
                }

                if (formData.Pricing === "By fixed" && (!formData.pieace_cost || parseFloat(formData.pieace_cost) <= 0)) {
                    alert("Please enter a Piece Cost.");
                    return;
                }

                if (formData.Pricing !== "By fixed" && (pcsValue <= 0 || grossWeightValue <= 0)) {
                    alert("The product's PCS and Gross Weight must be greater than zero to submit the form.");
                    return;
                }

                if (!formData.sub_category || !formData.subcategory_id) {
                    alert("Please select a valid sub-category before submitting.");
                    return;
                }

                if (formData.Pricing === "By Weight" && !formData.Gross_Weight) {
                    alert("Please add Gross Weight");
                    return;
                }

                handleSubmit();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [formData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
        setIsCameraOpen(false);
    };

    const clearImage = () => {
        setImage(null);
    };

    const [showDesignModal, setShowDesignModal] = useState(false);
    const [newDesign, setNewDesign] = useState({ design_name: "", design_prefix: "", category: formData.category });

    const handleOpenDesignModal = () => setShowDesignModal(true);
    const handleCloseDesignModal = () => setShowDesignModal(false);

    const handleDesignModalChange = (e) => {
        setNewDesign({ ...newDesign, [e.target.name]: e.target.value });
    };

    const handleAddDesign = async () => {
        if (!newDesign.design_name) {
            alert("Product Design Name required!");
            return;
        }

        try {
            const response = await axios.post(`${baseURL}/designmaster`, {
                category: newDesign.category || formData.category,
                design_name: newDesign.design_name,
                metal: newDesign.metal || formData.metal_type,
            });

            if (response.status === 201 || response.status === 200) {
                alert("Product Design Name added successfully!");

                handleCloseDesignModal();
                setNewDesign({ design_name: "", metal: formData.metal_type, category: formData.category });

                await fetchDesignMaster();

                const updatedResponse = await axios.get(`${baseURL}/designmaster`);
                const updatedDesignMasters = updatedResponse.data.map((item) => ({
                    value: item.design_name,
                    label: item.design_name,
                    id: item.design_id,
                }));

                setdesignOptions(updatedDesignMasters);

                const addedDesign = updatedDesignMasters.find(design => design.value === newDesign.design_name);

                if (addedDesign) {
                    setFormData((prevData) => ({
                        ...prevData,
                        design_master: addedDesign.value,
                        design_id: addedDesign.id,
                    }));
                }
            }
        } catch (error) {
            console.error("Error adding Product Design Name:", error);
            alert("Failed to add Product Design Name. Please try again.");
        }
    };

    // Updated handleSubmit to send data to both APIs and generate QR codes for both
const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (formData.Pricing === "By fixed") {
        if (pcs <= 0) {
            alert("The product's PCS must be greater than zero to submit the form.");
            return;
        }
        if (!formData.pieace_cost || parseFloat(formData.pieace_cost) <= 0) {
            alert("Please enter a Piece Cost.");
            return;
        }
    } else {
        if (pcs <= 0 || grossWeight <= 0) {
            alert("The product's PCS and Gross Weight must be greater than zero to submit the form.");
            return;
        }
    }

    if (!formData.sub_category || !formData.subcategory_id) {
        alert("Please select a valid sub-category before submitting.");
        return;
    }

    if (formData.Pricing === "By Weight" && !formData.Gross_Weight) {
        alert("Please add Gross Weight");
        return;
    }

    if (parseFloat(formData.Gross_Weight) > parseFloat(grossWeight)) {
        const diff = (parseFloat(formData.Gross_Weight) - parseFloat(grossWeight)).toFixed(3);
        const confirmSubmit = window.confirm(`The tag gross weight exceeds by ${diff} of balance Gross Weight. Do you want to proceed?`);
        if (!confirmSubmit) {
            return;
        }
    }

    try {
        const updatedData = { ...formData, image };

        // Prepare data for both APIs
        const requestData = {
            ...updatedData,
            stone_details: stoneList,
            purchase_stone_details: purchaseStoneList
        };

        let apiURL = `${baseURL}/post/opening-tags-entry`;
        let apiURL2 = `${baseURL2}/post/product`;
        
        let method = "POST";
        let method2 = "POST";
        
        let isUpdating = false;
        let response1, response2;

        if (formData.opentag_id) {
            apiURL = `${baseURL}/update/opening-tags-entry/${formData.opentag_id}`;
            method = "PUT";
            isUpdating = true;
        }

        // Send data to both APIs simultaneously
        [response1, response2] = await Promise.all([
            axios({
                method: method,
                url: apiURL,
                data: requestData,
                headers: { "Content-Type": "application/json" },
            }),
            axios({
                method: method2,
                url: apiURL2,
                data: {
                    // Map TagEntry data to ProductForm compatible format
                    product_name: formData.sub_category || "",
                    category_id: formData.subcategory_id || "",
                    barcode: formData.PCode_BarCode || "",
                    metal_type_id: "",
                    metal_type: formData.metal_type || "",
                    purity_id: "",
                    purity: formData.Purity || "",
                    design_id: "",
                    design: formData.design_master || "",
                    gross_wt: formData.Gross_Weight || "0",
                    stone_wt: formData.Stones_Weight || "0",
                    net_wt: formData.Weight_BW || "0",
                    stone_price: formData.Stones_Price || "0",
                    pricing: formData.Pricing || "By Weight",
                    va_on: formData.Wastage_On || "Gross Weight",
                    va_percent: formData.Wastage_Percentage || "0",
                    wastage_weight: formData.WastageWeight || "0",
                    total_weight_av: formData.TotalWeight_AW || "0",
                    mc_on: formData.Making_Charges_On || "MC %",
                    mc_per_gram: formData.MC_Per_Gram || "0",
                    making_charges: formData.Making_Charges || "0",
                    rate: formData.rate || "0",
                    rate_amt: "",
                    hm_charges: "60.00",
                    tax_percent: formData.tax || "0.9% GST",
                    tax_amt: formData.tax_amt || "0",
                    total_price: formData.total_price || "0",
                    pieace_cost: formData.pieace_cost || "0",
                    disscount_percentage: "",
                    disscount: "",
                    qty: formData.pcs || "1",
                    huid_no: formData.HUID_No || "",
                    stock_point: formData.Stock_Point || "Display Floor1",
                    product_image: image || null
                },
                headers: { "Content-Type": "application/json" },
            })
        ]);

        if (response1.status === 200 || response1.status === 201) {
            console.log("Tag Entry saved successfully to ERP:", response1.data);
        }

        if (response2.status === 200 || response2.status === 201) {
            console.log("Product saved successfully to Normal Jewelry App:", response2.data);
            
            // Get the product_id from the response to update QR status
            const productId = response2.data.product_id;
            
            // Generate and save QR code to BOTH servers if checkbox is checked
            if (isGeneratePDFRef.current && !isUpdating) {
                // Generate QR code PDF once
                const pdfBlob = await generateQRCodePDF(updatedData);
                
                if (pdfBlob) {
                    // Save to ERP server
                    await handleSavePDFToServer(pdfBlob, updatedData.PCode_BarCode, baseURL);
                    
                    // Save to Jewellery Application server
                    await handleSavePDFToServer(pdfBlob, updatedData.PCode_BarCode, baseURL2);
                    
                    // Update QR status in Jewellery Application
                    try {
                        await axios.put(`${baseURL2}/update-product-qr/${productId}`, {
                            qr_generated: true
                        });
                        console.log("QR status updated in Jewellery App");
                    } catch (qrError) {
                        console.error("Error updating QR status:", qrError);
                    }
                }
            }
        }

        alert(isUpdating ? "Stock updated successfully in both applications!" : "Stock added successfully in both applications!");
        
        if (fetchBalance) {
            fetchData();
            fetchBalance();
        }

        setIsEditMode(false);

        localStorage.removeItem("tagStoneDetails");
        localStorage.removeItem("tagPurStoneDetails");

        setStoneList([]);
        setPurchaseStoneList([]);

        if (isUpdating) {
            setTimeout(() => {
                setFormData((prevData) => ({
                    PCode_BarCode: "",
                    suffix: "",
                    tag_id: selectedProduct?.tag_id || "",
                    product_id: selectedProduct?.product_id || "",
                    category: selectedProduct?.category || "",
                    Pricing: selectedProduct?.Pricing || "",
                    metal_type: selectedProduct?.metal_type || "",
                    account_name: selectedProduct?.account_name || "",
                    invoice: selectedProduct?.invoice || "",
                    Gross_Weight: "",
                    Stones_Weight: "",
                    Stones_Price: "",
                    deduct_st_Wt: "Yes",
                    Weight_BW: "",
                    Wastage_On: "Gross Weight",
                    WastageWeight: "",
                    Purity: "",
                    printing_purity: "",
                    pur_Purity: "",
                    HUID_No: prevData.HUID_No,
                    Stock_Point: prevData.Stock_Point,
                    design_master: prevData.design_master,
                    Making_Charges_On: prevData.Making_Charges_On,
                    pur_Making_Charges_On: prevData.pur_Making_Charges_On,
                    MC_Per_Gram_Label: prevData.MC_Per_Gram_Label,
                    pur_MC_Per_Gram_Label: prevData.MC_Per_Gram_Label,
                    Status: "Available",
                    Source: "Purchase",
                    pur_Gross_Weight: "",
                    pur_Stones_Weight: "",
                    pur_Stones_Price: "",
                    pur_deduct_st_Wt: "Yes",
                    pur_Weight_BW: "",
                    pur_WastageWeight: "",
                    pur_Wastage_On: "Gross Weight",
                    pcs: "1",
                    pieace_cost: "",
                    mrp_price: "",
                    total_pcs_cost: "",
                }));
                setImage(null);
                fetchTagData();
            }, 100);
        } else {
            try {
                const response = await axios.get(`${baseURL}/getNextPCodeBarCode`, {
                    params: { prefix: formData.item_prefix },
                });
                const nextPCodeBarCode = response.data.nextPCodeBarCode;

                setFormData((prevData) => ({
                    ...prevData,
                    PCode_BarCode: nextPCodeBarCode,
                    suffix: nextPCodeBarCode.replace(formData.item_prefix, ""),
                    tag_id: selectedProduct?.tag_id || "",
                    product_id: selectedProduct?.product_id || "",
                    category: selectedProduct?.category || "",
                    Pricing: selectedProduct?.Pricing || "",
                    metal_type: selectedProduct?.metal_type || "",
                    Gross_Weight: "",
                    Stones_Weight: "",
                    Stones_Price: "",
                    deduct_st_Wt: "Yes",
                    Weight_BW: "",
                    Wastage_On: "Gross Weight",
                    WastageWeight: "",
                    Making_Charges_On: prevData.Making_Charges_On,
                    pur_Making_Charges_On: prevData.pur_Making_Charges_On,
                    MC_Per_Gram_Label: prevData.MC_Per_Gram_Label,
                    pur_MC_Per_Gram_Label: prevData.MC_Per_Gram_Label,
                    Status: "Available",
                    Source: "Purchase",
                    pur_Gross_Weight: "",
                    pur_Stones_Weight: "",
                    pur_Stones_Price: "",
                    pur_deduct_st_Wt: "Yes",
                    pur_Weight_BW: "",
                    pur_WastageWeight: "",
                    pur_Wastage_On: "Gross Weight",
                    pcs: "1",
                    pieace_cost: "",
                    mrp_price: "",
                    total_pcs_cost: "",
                }));
                setImage(null);
                fetchTagData();
            } catch (error) {
                console.error("Error fetching PCode_BarCode:", error);
            }
        }

        setIsGeneratePDF(true);

    } catch (error) {
        console.error("Error in submission:", error);
        if (error.response) {
            console.error("Response error:", error.response.data);
            alert(`Error: ${error.response.data.message || "An error occurred. Please try again."}`);
        } else if (error.request) {
            console.error("No response received:", error.request);
            alert("No response from server. Please check your connection.");
        } else {
            console.error("Error:", error.message);
            alert(`Error: ${error.message}`);
        }
    }
};

// New function to generate QR Code PDF and return blob
const generateQRCodePDF = async (data) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [65, 16],
    });

    const isByWeight = data.Pricing === "By Weight";

    try {
        const qrImageData = await QRCode.toDataURL(
            [
                `TAG: ${data.PCode_BarCode}`,
                `TOPS ${data.printing_purity}`,
                `NT WT: ${data.TotalWeight_AW}`,
                `MRP: ${data.total_price}`,
            ].join("\n"),
            { margin: 0 }
        );

        let startX = 2;
        let startY = 4;
        let lineGap = 3.2;
        let currentY = startY;

        doc.setFont("helvetica", "bold");

        doc.setFontSize(8.0);
        doc.text(`TAG: ${data.PCode_BarCode}`, startX, currentY);
        currentY += lineGap;

        if (isByWeight) {
            doc.text(`${data.sub_category}`, startX, currentY);
            currentY += lineGap;

            doc.setFontSize(8.0);
            doc.text("NT WT:", startX, currentY);
            doc.text(`${data.TotalWeight_AW}`, startX + 12, currentY);
            currentY += lineGap;
        }

        doc.setFontSize(8.0);
        doc.text("MRP:", startX, currentY);
        doc.text(`${data.total_price}`, startX + 11, currentY);

        const qrX = 35;
        const qrY = 2;
        const qrSize = 7;
        const moveRight = 6;

        doc.addImage(
            qrImageData,
            "PNG",
            qrX + moveRight,
            qrY,
            qrSize,
            qrSize
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.2);
        doc.text("O/N:", qrX + moveRight, qrY + qrSize + 2);
        doc.setFontSize(6.0);
        doc.text("NEW FRIENDS JEWELLERS", qrX - 2, qrY + qrSize + 4.5);

        return doc.output("blob");
    } catch (error) {
        console.error("PDF Error:", error);
        return null;
    }
};

// Updated handleSavePDFToServer to accept baseURL parameter
const handleSavePDFToServer = async (pdfBlob, pcode, serverBaseURL) => {
    const formData = new FormData();
    formData.append("invoice", pdfBlob, `${pcode}.pdf`);

    try {
        const response = await fetch(`${serverBaseURL}/upload-invoice`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload invoice");
        }

        console.log(`Tag PDF ${pcode} saved on server ${serverBaseURL}`);
        return true;
    } catch (error) {
        console.error("Error uploading tag PDF:", error);
        return false;
    }
};

// Keep the original generateAndDownloadPDF function for backward compatibility
const generateAndDownloadPDF = async (data) => {
    const pdfBlob = await generateQRCodePDF(data);
    if (pdfBlob) {
        await handleSavePDFToServer(pdfBlob, data.PCode_BarCode, baseURL);
        // Download to client
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR_${data.PCode_BarCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};

    useEffect(() => {
        const getLastPcode = async () => {
            try {
                const response = await axios.get(`${baseURL}/last-pbarcode`);
                const suffix = response.data.lastPCode_BarCode || "001";
                setFormData((prev) => ({
                    ...prev,
                    suffix,
                    PCode_BarCode: `${prev.item_prefix || ""}${suffix}`,
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
        category: '',
        purity: '',
        selling_purity: '',
        printing_purity: '',
    });

    const handleModalChange = (e) => {
        let { name, value } = e.target;

        if (name === "name" || name === "prefix") {
            value = value.toUpperCase();
        }

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
    };

    useEffect(() => {
        if (selectedProduct) {
            console.log("Product ID:", selectedProduct.product_id);
            console.log("Tag ID:", selectedProduct.tag_id);
        }
    }, [selectedProduct]);

    const handleAddSubCategory = async () => {
        if (!newSubCategory.name || !newSubCategory.prefix ||
            !newSubCategory.purity || !newSubCategory.selling_purity || !newSubCategory.printing_purity) {
            alert("All fields are required.");
            return;
        }
        try {
            const data = {
                category_id: selectedProduct.product_id,
                subcategory_id: 1,
                sub_category_name: newSubCategory.name,
                category: newSubCategory.category || formData.category,
                prefix: newSubCategory.prefix,
                metal_type: selectedProduct.metal_type,
                purity: newSubCategory.purity,
                selling_purity: newSubCategory.selling_purity,
                printing_purity: newSubCategory.printing_purity,
            };

            const response = await axios.post(`${baseURL}/post/subcategory`, data);

            if (response.status === 201) {
                console.log('Subcategory added successfully');
                alert("Subcategory added successfully");

                handleCloseModal();
                setNewSubCategory({ name: '', prefix: '', category: '', purity: '', selling_purity: '', printing_purity: '' });

                await fetchSubCategories();

                const updatedSubCategories = await axios.get(`${baseURL}/get/subcategories`);
                const filteredSubCategories = updatedSubCategories.data.filter(
                    (subCategory) => subCategory.category_id === selectedProduct.product_id
                );

                const addedSubCategory = filteredSubCategories.find(sub => sub.sub_category_name === newSubCategory.name);

                if (addedSubCategory) {
                    const response = await axios.get(`${baseURL}/getNextPCodeBarCode`, {
                        params: { prefix: addedSubCategory.prefix },
                    });

                    const nextPCodeBarCode = response.data.nextPCodeBarCode;

                    setFormData((prevData) => ({
                        ...prevData,
                        sub_category: addedSubCategory.sub_category_name,
                        subcategory_id: addedSubCategory.subcategory_id,
                        item_prefix: addedSubCategory.prefix,
                        Prefix: addedSubCategory.prefix,
                        PCode_BarCode: nextPCodeBarCode,
                        suffix: nextPCodeBarCode.replace(addedSubCategory.prefix, ""),
                        Purity: addedSubCategory.selling_purity,
                        pur_Purity: addedSubCategory.purity,
                        printing_purity: addedSubCategory.printing_purity
                    }));
                }
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
            setSubCategories(filteredSubCategories);
            console.log("filteredSubCategories=", filteredSubCategories);
            return filteredSubCategories;
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            return [];
        }
    };

    useEffect(() => {
        if (selectedProduct?.product_id) {
            fetchSubCategories();
        }
    }, [selectedProduct]);

    const [designOptions, setdesignOptions] = useState([]);

    const fetchDesignMaster = async () => {
        try {
            const response = await axios.get(`${baseURL}/designmaster`);
            const designMasters = response.data.map((item) => {
                console.log('Design ID:', item.design_id);
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

    useEffect(() => {
        fetchDesignMaster();
    }, []);

    const [pcs, setPcs] = useState(null);
    const [grossWeight, setGrossWeight] = useState(null);

    const fetchData = async () => {
        if (!selectedProduct.product_id || !selectedProduct.tag_id) return;

        try {
            const response = await fetch(`${baseURL}/entry/${selectedProduct.product_id}/${selectedProduct.tag_id}`);
            if (!response.ok) {
                throw new Error("Entry not found or server error");
            }
            const data = await response.json();
            console.log("Fetched data:", data);
            setPcs(data.bal_pcs);
            setGrossWeight(data.bal_gross_weight);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedProduct.product_id, selectedProduct.tag_id]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditMode, setIsEditMode] = useState(false);

    const fetchTagData = async () => {
        try {
            const response = await fetch(`${baseURL}/get/opening-tags-entry`);
            const jsonData = await response.json();

            console.log("Fetched Data:", jsonData);

            if (jsonData.result && Array.isArray(jsonData.result)) {
                const filteredData = jsonData.result.filter(
                    (item) =>
                        item.invoice === selectedProduct.invoice &&
                        item.category === selectedProduct.category
                );

                setData(filteredData);
            } else {
                console.error("Unexpected API response format:", jsonData);
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTagData();
    }, [selectedProduct]);

    const handleEdit = (rowData) => {
        setFormData(rowData);
        setIsEditMode(true);
        setImage(rowData.image || "");

        if (rowData.Making_Charges_On === "MC %") {
            setFormData((prevData) => ({
                ...prevData,
                MC_Per_Gram_Label: "MC%",
            }));
        } else if (rowData.Making_Charges_On === "MC / Gram" || rowData.Making_Charges_On === "MC / Piece") {
            setFormData((prevData) => ({
                ...prevData,
                MC_Per_Gram_Label: "MC/Gm",
            }));
        }
    };

    const handleDelete = async (id) => {
        console.log("Deleting ID:", id);
        const url = `${baseURL}/delete/opening-tags-entry/${id}`;
        console.log("DELETE Request URL:", url);

        if (!window.confirm("Are you sure you want to delete this record?")) {
            return;
        }

        try {
            const response = await axios.delete(url);
            alert(response.data.message);

            fetchData();
            fetchTagData();
        } catch (error) {
            console.error("Error deleting record:", error.response?.data || error.message);
            alert("Failed to delete record.");
        }
    };

    const exportToExcel = (event) => {
        event.preventDefault();

        if (data.length === 0) {
            alert("No data available to export.");
            return;
        }

        const worksheetData = data.map((item, index) => ({
            "SI": index + 1,
            "Supplier Name": item.account_name,
            "Barcode": item.PCode_BarCode,
            "Category": item.category,
            "Sub Category": item.sub_category,
            "Design Name": item.design_master,
            "Purity": item.Purity,
            "Pcs": item.pcs,
            "Gross Wt": item.Gross_Weight,
            "Stone Wt": item.Stones_Weight,
            "Wt BW": item.Weight_BW,
            "W.Wt": item.WastageWeight,
            "Total Wt": item.TotalWeight_AW,
            "MC On": item.Making_Charges_On,
            "Total MC": item.Making_Charges,
            "Piece Cost": item.pieace_cost,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        const columnWidths = Object.keys(worksheetData[0]).map((key) => ({
            wch: Math.max(
                key.length,
                ...worksheetData.map(row => row[key] ? row[key].toString().length : 0)
            ) + 2
        }));

        worksheet["!cols"] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        XLSX.writeFile(workbook, "TagDetails.xlsx");
    };

    const selectedCategory = subCategories.find(
        (category) => category.sub_category_name === formData.sub_category
    );

    return (
        <div style={{ paddingTop: "0px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <h4 style={{ margin: "0" }}>Pieces: {pcs !== null ? pcs : "0"}</h4>
                <h4 style={{ margin: "0" }}>Gross Weight: {grossWeight !== null ? grossWeight : "0"}</h4>
            </div>
            <div className="container mb-4">
                <div className="row mt-1">
                    <div className="col-12">
                        <Form className="p-4 border rounded form-container-stockentry" >
                            <div className="stock-entry-form">
                                <h4 className="mb-3" style={{ marginTop: '-16px' }}>Stock Entry</h4>
                                <Row className="stock-form-section">
                                    <Col xs={12} md={2}>
                                        <InputField
                                            label="Supplier Name"
                                            name="account_name"
                                            value={formData.account_name}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </Col>
                                    <Col xs={12} md={2}>
                                        <InputField
                                            label="Category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </Col>
                                    <Col xs={12} md={3} className="d-flex align-items-center">
                                        <div style={{ flex: 1 }}>
                                            <InputField
                                                label="Sub Category"
                                                name="sub_category"
                                                type="select"
                                                value={formData.sub_category}
                                                onChange={handleChange}
                                                options={subCategories.map((category) => ({
                                                    value: category.sub_category_name,
                                                    label: category.sub_category_name,
                                                }))}
                                                autoFocus
                                            />
                                        </div>
                                        <AiOutlinePlus
                                            size={20}
                                            color="black"
                                            onClick={handleOpenModal}
                                            style={{ marginLeft: "10px", cursor: "pointer", marginBottom: "20px" }}
                                        />
                                    </Col>
                                    <Col xs={12} md={3} className="d-flex align-items-center">
                                        <div style={{ flex: 1 }}>
                                            <InputField
                                                label="Product Design Name"
                                                name="design_master"
                                                type="select"
                                                value={formData.design_master}
                                                onChange={handleChange}
                                                options={designOptions.map(option => ({ value: option.value, label: option.label }))}
                                            />
                                        </div>
                                        <AiOutlinePlus
                                            size={20}
                                            color="black"
                                            onClick={handleOpenDesignModal}
                                            style={{ marginLeft: "10px", cursor: "pointer", marginBottom: "20px" }}
                                        />
                                    </Col>

                                    <Col xs={12} md={2}>
                                        <InputField
                                            label="Pricing"
                                            name="Pricing"
                                            value={formData.Pricing}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </Col>
                                    {isByFixed ? (
                                        <>
                                            <Col xs={12} md={2}>
                                                <InputField label="PCode/BarCode" name="PCode_BarCode" type="text" value={formData.PCode_BarCode} onChange={handleChange} />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Printing Purity"
                                                    name="Purity"
                                                    value={formData.printing_purity}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Selling Purity"
                                                    name="Purity"
                                                    value={formData.Purity}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Purchase Purity"
                                                    name="pur_Purity"
                                                    value={formData.pur_Purity}
                                                    onChange={(e) => handleChange("pur_Purity", e.target.value)}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField label="HUID No" name="HUID_No" value={formData.HUID_No} onChange={handleChange} />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField label="Stock Point" name="Stock_Point" type="select" value={formData.Stock_Point} onChange={handleChange} options={[
                                                    { value: "Display Floor1", label: "Display Floor1" },
                                                    { value: "Display Floor2", label: "Display Floor2" },
                                                    { value: "Strong room", label: "Strong room" },
                                                ]} />
                                            </Col>

                                        </>
                                    ) : (
                                        <>
                                            <Col xs={12} md={2}>
                                                <InputField label="PCode/BarCode" name="PCode_BarCode" type="text" value={formData.PCode_BarCode} onChange={handleChange} />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField
                                                    label="Printing Purity"
                                                    name="Purity"
                                                    value={formData.printing_purity}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField label="HUID No" name="HUID_No" value={formData.HUID_No} onChange={handleChange} />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField label="Stock Point" name="Stock_Point" type="select" value={formData.Stock_Point} onChange={handleChange} options={[
                                                    { value: "Display Floor1", label: "Display Floor1" },
                                                    { value: "Display Floor2", label: "Display Floor2" },
                                                    { value: "Strong room", label: "Strong room" },
                                                ]} />
                                            </Col>

                                            <Col xs={12} md={2}>
                                                <div className="image-upload-container">
                                                    <Dropdown>
                                                        <Dropdown.Toggle id="dropdown-basic-button">Upload Image</Dropdown.Toggle>

                                                        <Dropdown.Menu style={{ zIndex: 1050, position: "absolute" }}>
                                                            <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                                                                Select Image
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => setIsCameraOpen(true)}>
                                                                Capture Image
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={fileInputRef}
                                                        onChange={handleImageChange}
                                                        style={{ display: "none" }}
                                                    />

                                                    {isCameraOpen && (
                                                        <div className="webcam-container mt-2">
                                                            <Webcam
                                                                audio={false}
                                                                ref={webcamRef}
                                                                screenshotFormat="image/jpeg"
                                                                className="img-thumbnail"
                                                            />
                                                            <div className="d-flex gap-2 mt-2">
                                                                <Button onClick={captureImage} variant="primary">
                                                                    Capture
                                                                </Button>
                                                                <Button onClick={() => setIsCameraOpen(false)} variant="danger">
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {image && (
                                                        <div style={{ position: "relative", display: "inline-block", marginTop: "10px" }}>
                                                            <img src={image} alt="Selected"
                                                                style={{
                                                                    width: "100px",
                                                                    height: "100px",
                                                                    borderRadius: "8px",
                                                                }} />
                                                            <button
                                                                type="button"
                                                                onClick={clearImage}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "5px",
                                                                    right: "5px",
                                                                    background: "transparent",
                                                                    border: "none",
                                                                    color: "red",
                                                                    fontSize: "16px",
                                                                    cursor: "pointer",
                                                                    zIndex: 10,
                                                                }}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>

                                            <div className="purchase-form-left">
                                                <Col className="tag-urd-form1-section">
                                                    <h4 className="mb-3" style={{ marginTop: '-10px' }}>Sales</h4>
                                                    <Row className="mt-3">
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Gross Wt" name="Gross_Weight" value={formData.Gross_Weight} onChange={handleChange} />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Stones Wt" name="Stones_Weight" value={formData.Stones_Weight} onChange={handleChange} />
                                                        </Col>
                                                        <Col xs={12} md="2">
                                                            <Button variant="primary"
                                                                onClick={handleShow}
                                                                style={{
                                                                    backgroundColor: '#a36e29',
                                                                    borderColor: '#a36e29',
                                                                    fontSize: '0.8rem',
                                                                    marginLeft: '-20px',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                Stone Details
                                                            </Button>
                                                        </Col>
                                                        <Col xs={12} md={4}>
                                                            <InputField
                                                                label="Deduct St Wt"
                                                                name="deduct_st_Wt"
                                                                type="select"
                                                                value={formData.deduct_st_Wt || ""}
                                                                onChange={(e) => handleChange("deduct_st_Wt", e.target.value)}
                                                                options={[
                                                                    { value: "Yes", label: "Yes" },
                                                                    { value: "No", label: "No" },
                                                                ]}
                                                            />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label="Stones Price"
                                                                name="Stones_Price"
                                                                value={formData.Stones_Price}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label="Selling Purity"
                                                                name="Purity"
                                                                value={formData.Purity}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col xs={12} md={2}>
                                                            <InputField label="Wt BW" name="Weight_BW" value={formData.Weight_BW} onChange={handleChange} readOnly />
                                                        </Col>

                                                        <Col xs={12} md={4}>
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
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Wastage %" name="Wastage_Percentage" value={formData.Wastage_Percentage} onChange={handleChange} />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField label="W.Wt" name="WastageWeight" value={formData.WastageWeight} onChange={handleChange} readOnly />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Total Wt" name="TotalWeight_AW" value={formData.TotalWeight_AW} onChange={handleChange} readOnly />
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <InputField label="Rate" name="rate" value={formData.rate} onChange={handleChange} />
                                                        </Col>

                                                        <Col xs={12} md={4}>
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

                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label="MC"
                                                                name="Making_Charges"
                                                                value={formData.Making_Charges}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <InputField label="Tax%" name="tax" value={formData.tax} onChange={handleChange} />
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <InputField label="Total Amt" name="total_price" value={formData.total_price} onChange={handleChange} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </div>
                                            <div className="purchase-form-right">
                                                <Col className="tag-urd-form2-section">
                                                    <h4 className="mb-3" style={{ marginTop: '-10px' }}>Purchase</h4>
                                                    <Row className="mt-3">
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Gross Wt" name="pur_Gross_Weight" value={formData.pur_Gross_Weight} onChange={handleChange} />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Stones Wt" name="pur_Stones_Weight" value={formData.pur_Stones_Weight} onChange={handleChange} />
                                                        </Col>
                                                        <Col xs={12} md="2">
                                                            <Button variant="primary"
                                                                onClick={handleShowPurchase}
                                                                style={{
                                                                    backgroundColor: '#a36e29',
                                                                    borderColor: '#a36e29',
                                                                    fontSize: '0.8rem',
                                                                    marginLeft: '-20px',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                Stone Details
                                                            </Button>
                                                        </Col>
                                                        <Col xs={12} md={4}>
                                                            <InputField
                                                                label="Deduct St Wt"
                                                                name="pur_deduct_st_Wt"
                                                                type="select"
                                                                value={formData.pur_deduct_st_Wt || ""}
                                                                onChange={(e) => handleChange("pur_deduct_st_Wt", e.target.value)}
                                                                options={[
                                                                    { value: "Yes", label: "Yes" },
                                                                    { value: "No", label: "No" },
                                                                ]}
                                                            />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label="Stones Price"
                                                                name="pur_Stones_Price"
                                                                value={formData.pur_Stones_Price}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label="Purity"
                                                                name="pur_Purity"
                                                                type="select"
                                                                value={formData.pur_Purity}
                                                                onChange={(e) => handleChange("pur_Purity", e.target.value)}
                                                                options={[
                                                                    ...(formData.Purity
                                                                        ? [{ value: selectedCategory?.purity, label: selectedCategory?.purity }]
                                                                        : []),
                                                                    ...purityOptions
                                                                        .filter(option => option.name && option.purity)
                                                                        .map(option => ({
                                                                            value: `${option.name} | ${option.purity}`,
                                                                            label: `${option.name} | ${option.purity}`,
                                                                        })),
                                                                    { value: "Manual", label: "Manual" }
                                                                ]}
                                                            />
                                                        </Col>
                                                        {formData.pur_Purity === "Manual" && (
                                                            <Col xs={12} md={4}>
                                                                <InputField
                                                                    label="Custom Purity %"
                                                                    name="pur_purityPercentage"
                                                                    value={formData.pur_purityPercentage || ""}
                                                                    onChange={(e) => handleChange("pur_purityPercentage", e.target.value)}
                                                                />
                                                            </Col>
                                                        )}
                                                        <Col xs={12} md={2}>
                                                            <InputField label="Wt BW" name="pur_Weight_BW" value={formData.pur_Weight_BW} onChange={handleChange} readOnly />
                                                        </Col>

                                                        <Col xs={12} md={4}>
                                                            <InputField
                                                                label="Wastage On"
                                                                name="pur_Wastage_On"
                                                                type="select"
                                                                value={formData.pur_Wastage_On}
                                                                onChange={handleChange}
                                                                options={[
                                                                    { value: "Gross Weight", label: "Gross Weight" },
                                                                    { value: "Weight BW", label: "Weight BW" },
                                                                ]}
                                                            />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Wastage %" name="pur_Wastage_Percentage" value={formData.pur_Wastage_Percentage} onChange={handleChange} />
                                                        </Col>
                                                        <Col xs={12} md={2}>
                                                            <InputField label="W.Wt" name="pur_WastageWeight" value={formData.pur_WastageWeight} onChange={handleChange} readOnly />
                                                        </Col>
                                                        <Col xs={12} md={3}>
                                                            <InputField label="Total Wt" name="pur_TotalWeight_AW" value={formData.pur_TotalWeight_AW} onChange={handleChange} readOnly />
                                                        </Col>

                                                        <Col xs={12} md={4}>
                                                            <InputField
                                                                label="MC On"
                                                                name="pur_Making_Charges_On"
                                                                type="select"
                                                                value={formData.pur_Making_Charges_On}
                                                                onChange={handleChange}
                                                                options={[
                                                                    { value: "MC / Gram", label: "MC / Gram" },
                                                                    { value: "MC / Piece", label: "MC / Piece" },
                                                                    { value: "MC %", label: "MC %" },
                                                                ]}
                                                            />
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label={formData.MC_Per_Gram_Label}
                                                                name="pur_MC_Per_Gram"
                                                                value={formData.pur_MC_Per_Gram}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label="MC"
                                                                name="pur_Making_Charges"
                                                                value={formData.pur_Making_Charges}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>

                                                        <Col xs={12} md={3}>
                                                            <InputField
                                                                label="Rate"
                                                                type="number"
                                                                value={formData.pur_rate_cut}
                                                                onChange={(e) => handleChange("pur_rate_cut", e.target.value)}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </div>
                                        </>
                                    )}

                                    {formData.Pricing === "By fixed" && (
                                        <>
                                            <Col xs={12} md={1}>
                                                <InputField label="Pcs" type="number" value={formData.pcs} onChange={(e) => handleChange("pcs", e.target.value)} />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField label="Piece Cost" type="number" value={formData.pieace_cost} onChange={(e) => handleChange("pieace_cost", e.target.value)} />
                                            </Col>
                                            <Col xs={12} md={1}>
                                                <InputField label="Tax %" value={formData.tax_percent} onChange={(e) => handleChange("tax_percent", e.target.value)} />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField label="MRP" type="number" value={formData.mrp_price} onChange={(e) => handleChange("mrp_price", e.target.value)} />
                                            </Col>
                                            <Col xs={12} md={2}>
                                                <InputField label="Total Pcs Cost" type="number" value={formData.total_pcs_cost} onChange={(e) => handleChange("total_pcs_cost", e.target.value)} />
                                            </Col>
                                            <Col xs={12} md={4}>
                                                <div className="image-upload-container">
                                                    <Dropdown>
                                                        <Dropdown.Toggle id="dropdown-basic-button">Upload Image</Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                                                                Select Image
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => setIsCameraOpen(true)}>
                                                                Capture Image
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={fileInputRef}
                                                        onChange={handleImageChange}
                                                        style={{ display: "none" }}
                                                    />

                                                    {isCameraOpen && (
                                                        <div className="webcam-container mt-2">
                                                            <Webcam
                                                                audio={false}
                                                                ref={webcamRef}
                                                                screenshotFormat="image/jpeg"
                                                                className="img-thumbnail"
                                                            />
                                                            <div className="d-flex gap-2 mt-2">
                                                                <Button onClick={captureImage} variant="primary">
                                                                    Capture
                                                                </Button>
                                                                <Button onClick={() => setIsCameraOpen(false)} variant="danger">
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {image && (
                                                        <div style={{ position: "relative", display: "inline-block", marginTop: "10px" }}>
                                                            <img src={image} alt="Selected"
                                                                style={{
                                                                    width: "100px",
                                                                    height: "100px",
                                                                    borderRadius: "8px",
                                                                }} />
                                                            <button
                                                                type="button"
                                                                onClick={clearImage}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "5px",
                                                                    right: "5px",
                                                                    background: "transparent",
                                                                    border: "none",
                                                                    color: "red",
                                                                    fontSize: "16px",
                                                                    cursor: "pointer",
                                                                    zIndex: 10,
                                                                }}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <label className="checkbox-label" htmlFor="tcs">
                                    <input
                                        type="checkbox"
                                        id="tcs"
                                        name="tcsApplicable"
                                        className="checkbox-input"
                                        checked={isGeneratePDF}
                                        onChange={(e) => setIsGeneratePDF(e.target.checked)}
                                    />
                                    Print QR Code
                                </label>

                                <div className="text-end">
                                    <Button
                                        variant="secondary"
                                        onClick={handleCloseTagModal}
                                        style={{ backgroundColor: 'gray', marginRight: '10px' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="success"
                                        style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
                                        onClick={handleSubmit}
                                    >
                                        {isEditMode ? "Update" : "Save"}
                                    </Button>
                                </div>
                            </div>

                            <div className="container mt-2" style={{ overflowX: "auto", maxWidth: "100%" }}>
                                <button
                                    onClick={exportToExcel}
                                    style={{
                                        marginBottom: "10px",
                                        padding: "5px 5px",
                                        backgroundColor: "green",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    <FaFileExcel style={{ marginRight: "5px" }} /> Export to Excel
                                </button>
                                <Table bordered style={{ whiteSpace: "nowrap", fontSize: "15px" }}>
                                    <thead style={{ fontSize: "14px", fontWeight: "bold" }}>
                                        <tr>
                                            <th>SI</th>
                                            <th>Barcode</th>
                                            <th>Category</th>
                                            <th>Sub Category</th>
                                            <th>Design Name</th>
                                            <th>Gross Wt</th>
                                            <th>Net Wt</th>
                                            <th>MC</th>
                                            <th>Rate</th>
                                            <th>Total Amt</th>
                                            <th>Image</th>
                                            <th>Barcode</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: "14px" }}>
                                        {data.length > 0 ? (
                                            data.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.PCode_BarCode}</td>
                                                    <td>{item.category}</td>
                                                    <td>{item.sub_category}</td>
                                                    <td>{item.design_master}</td>
                                                    <td>{item.Gross_Weight}</td>
                                                    <td>{item.TotalWeight_AW}</td>
                                                    <td>{item.Making_Charges}</td>
                                                    <td>{item.rate}</td>
                                                    <td>{item.total_price}</td>
                                                    <td>
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt="Product"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "5px",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => {
                                                                    const newWindow = window.open();
                                                                    newWindow.document.write(
                                                                        `<img src="${item.image}" alt="Product" style="width: 100%; height: auto;" />`
                                                                    );
                                                                }}
                                                                onError={(e) => (e.target.src = "/placeholder.png")}
                                                            />
                                                        ) : (
                                                            "No Image"
                                                        )}
                                                    </td>
                                                    <td>
                                                        <a
                                                            href={`${baseURL}/invoices/${item.PCode_BarCode}.pdf`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ textDecoration: 'none' }}
                                                        >
                                                            📝 View
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <FaEye
                                                            style={{ cursor: "pointer", color: "green", marginRight: "10px" }}
                                                            onClick={() => handleView(item)}
                                                        />
                                                        <FaEdit
                                                            style={{ cursor: "pointer", color: "blue" }}
                                                            onClick={() => {
                                                                handleEdit(item);
                                                                setTimeout(() => handleEdit(item), 1);
                                                            }}
                                                        />
                                                        <FaTrash
                                                            style={{ cursor: "pointer", marginLeft: "10px", color: "red" }}
                                                            onClick={() => handleDelete(item.opentag_id)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="12" className="text-center">No data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
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

                        <Row>
                            <Col>
                                <Form.Group controlId="subCategoryPrefix">
                                    <Form.Label>Prefix</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="prefix"
                                        value={newSubCategory.prefix}
                                        onChange={handleModalChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="subCategoryPrintingPurity">
                                    <Form.Label>Printing Purity</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="printing_purity"
                                        value={newSubCategory.printing_purity}
                                        onChange={handleModalChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group controlId="subCategorySellingPurity">
                                    <Form.Label>Selling Purity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="selling_purity"
                                        value={newSubCategory.selling_purity}
                                        onChange={handleModalChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="subCategoryPurity">
                                    <Form.Label>Purchase Purity</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="purity"
                                        value={newSubCategory.purity}
                                        onChange={handleModalChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
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
            <Modal show={showDesignModal} onHide={handleCloseDesignModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Product Design Name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="designCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                type="text"
                                name="category"
                                value={newDesign.category || formData.category}
                                onChange={handleDesignModalChange}
                                placeholder="Enter category"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="metalType">
                            <Form.Label>Metal Type</Form.Label>
                            <Form.Control
                                type="text"
                                name="metal"
                                value={newDesign.metal || formData.metal_type}
                                onChange={handleDesignModalChange}
                                placeholder="Enter metal type"
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group controlId="designName">
                            <Form.Label>Product Design Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="design_name"
                                value={newDesign.design_name}
                                onChange={handleDesignModalChange}
                                placeholder="Enter design name"
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDesignModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddDesign}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            <StoneDetailsModal
                show={show}
                handleClose={handleClose}
                stoneDetails={stoneDetails}
                setStoneDetails={setStoneDetails}
                handleAddStone={handleAddStone}
                stoneList={stoneList}
                handleEditStone={handleEditStone}
                handleDeleteStone={handleDeleteStone}
                editingStoneIndex={editingStoneIndex}
            />
            <PurchaseStoneDetailsModal
                showPurchase={showPurchase}
                handleClosePurchase={handleClosePurchase}
                purStoneDetails={purStoneDetails}
                setPurStoneDetails={setPurStoneDetails}
                handleAddTagPurStone={handleAddTagPurStone}
                purchaseStoneList={purchaseStoneList}
                handleTagPurEditStone={handleTagPurEditStone}
                handleTagPurDeleteStone={handleTagPurDeleteStone}
                editingPurchaseStoneIndex={editingPurchaseStoneIndex}
            />
            <Modal show={showViewModal} onHide={handleCloseViewModal} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>View Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRow ? (
                        <>
                            <Row >
                                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                                    <p><strong>Supplier:</strong> {selectedRow.account_name}</p>
                                </Col>
                                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                                    <p><strong>Category:</strong> {selectedRow.category}</p>
                                </Col>
                                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                                    <p><strong>Sub Category:</strong> {selectedRow.sub_category}</p>
                                </Col>
                                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                                    <p><strong>Design Name:</strong> {selectedRow.design_master}</p>
                                </Col>
                            </Row>

                            <Row >
                                <Col md={3}>
                                    <p><strong>Pricing:</strong> {selectedRow.Pricing}</p>
                                </Col>
                                <Col md={3}>
                                    <p><strong>Barcode:</strong> {selectedRow.PCode_BarCode}</p>
                                </Col>
                                <Col md={3}>
                                    <p><strong>HUID No:</strong> {selectedRow.HUID_No}</p>
                                </Col>
                                <Col md={3}>
                                    <p><strong>Stock Point:</strong> {selectedRow.Stock_Point}</p>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={3}>
                                    <p><strong>Gross Weight:</strong> {selectedRow.Gross_Weight}</p>
                                    <p><strong>Stone Weight:</strong> {selectedRow.Stones_Weight}</p>
                                    <p><strong>Wastage %:</strong> {selectedRow.Wastage_Percentage}</p>
                                    <p><strong>Total Weight:</strong> {selectedRow.TotalWeight_AW}</p>
                                    <p><strong>Making Charges:</strong> {selectedRow.Making_Charges}</p>
                                    <p><strong>Status:</strong> {selectedRow.Status}</p>
                                    <p><strong>Purity:</strong> {selectedRow.Purity}</p>
                                    <p><strong>Metal Type:</strong> {selectedRow.metal_type}</p>
                                </Col>

                                <Col md={3}>
                                    <p><strong>Wastage On:</strong> {selectedRow.Wastage_On}</p>
                                    <p><strong>Wastage Weight:</strong> {selectedRow.WastageWeight}</p>
                                    <p><strong>MC Per Gram:</strong> {selectedRow.MC_Per_Gram}</p>
                                    <p><strong>Making Charges On:</strong> {selectedRow.Making_Charges_On}</p>
                                    <p><strong>Deduct Stone Wt:</strong> {selectedRow.deduct_st_Wt}</p>
                                    <p><strong>Size:</strong> {selectedRow.size}</p>
                                    <p><strong>Tag ID:</strong> {selectedRow.tag_id}</p>
                                    <p><strong>Tag Weight:</strong> {selectedRow.tag_weight}</p>
                                </Col>

                                <Col md={3}>
                                    <p><strong>Pur. Gross Weight:</strong> {selectedRow.pur_Gross_Weight}</p>
                                    <p><strong>Pur. Stone Weight:</strong> {selectedRow.pur_Stones_Weight}</p>
                                    <p><strong>Pur. Deduct Stone Wt:</strong> {selectedRow.pur_deduct_st_Wt}</p>
                                    <p><strong>Pur. Stones Price:</strong> {selectedRow.pur_Stones_Price}</p>
                                    <p><strong>Pur. Weight BW:</strong> {selectedRow.pur_Weight_BW}</p>
                                    <p><strong>Pur. Wastage On:</strong> {selectedRow.pur_Wastage_On}</p>
                                    <p><strong>Pur. Wastage %:</strong> {selectedRow.pur_Wastage_Percentage}</p>
                                    <p><strong>Pur. Wastage Weight:</strong> {selectedRow.pur_WastageWeight}</p>
                                    <p><strong>Pur. Total Weight:</strong> {selectedRow.pur_TotalWeight_AW}</p>
                                </Col>

                                <Col md={3}>
                                    <p><strong>Pur. MC / Gram:</strong> {selectedRow.pur_MC_Per_Gram}</p>
                                    <p><strong>Pur. MC Charges:</strong> {selectedRow.pur_Making_Charges}</p>
                                    <p><strong>Stone Price / Carat:</strong> {selectedRow.stone_price_per_carat}</p>
                                    <p><strong>Pcs:</strong> {selectedRow.pcs}</p>
                                    <p><strong>Piece Cost:</strong> {selectedRow.pieace_cost}</p>
                                    <p><strong>Selling Price:</strong> {selectedRow.selling_price}</p>
                                    <p><strong>Tax %:</strong> {selectedRow.tax_percent}</p>
                                    <p><strong>MRP Price:</strong> {selectedRow.mrp_price}</p>
                                    <p><strong>Total Pcs Cost:</strong> {selectedRow.total_pcs_cost}</p>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <p>No data available.</p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseViewModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TagEntry;