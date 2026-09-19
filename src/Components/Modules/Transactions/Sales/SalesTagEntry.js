// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { Form, Row, Col, Table, Button, Modal, Dropdown } from "react-bootstrap";
// import { FaTrash, FaEdit, FaFileExcel, FaEye } from "react-icons/fa";
// import { AiOutlinePlus } from "react-icons/ai";
// import * as XLSX from "xlsx";
// import { jsPDF } from "jspdf";
// import QRCode from "qrcode";
// import Webcam from "react-webcam";
// import baseURL from "../../../../Url/NodeBaseURL";
// import baseURL2 from "../../../../Url/NodeBaseURL2";
// import InputField from "./InputField";
// import StoneDetailsModal from "./TagStoneDetailsModal";
// import PurchaseStoneDetailsModal from "./PurchaseStoneDetailsModal";
// import "../StockEntry/StockEntry.css";
// import "./SalesTagEntry.css";

// const SalesTagEntry = ({ handleCloseTagModal, selectedProduct, fetchBalance }) => {
//   console.log("Pricing =", selectedProduct?.Pricing);
//   console.log("Metal Type =", selectedProduct?.metal_type);

//   const [isCameraOpen, setIsCameraOpen] = useState(false);
//   const [productDetails, setProductDetails] = useState({
//     pcs: selectedProduct?.pcs || 0,
//     gross_weight: selectedProduct?.gross_weight || 0,
//   });

//   const fileInputRef = useRef(null);
//   const webcamRef = useRef(null);

//   const [subCategories, setSubCategories] = useState([]);
//   const [productOptions, setProductOptions] = useState([]);
//   const [purityOptions, setPurityOptions] = useState([]);
//   const [image, setImage] = useState(null);
//   const [stockPointOptions, setStockPointOptions] = useState([]);
//   const [defaultStockPoint, setDefaultStockPoint] = useState("");

//   const [formData, setFormData] = useState({
//     tag_id: selectedProduct?.tag_id || "",
//     product_id: selectedProduct?.product_id || "",
//     account_name: selectedProduct?.account_name || "",
//     category: selectedProduct?.category || selectedProduct?.product_name || "",
//     invoice: selectedProduct?.invoice_number || selectedProduct?.invoice || "",
//     sub_category: "",
//     subcategory_id: "",
//     product_Name: "",
//     design_master: "",
//     Pricing: selectedProduct?.Pricing || "By Weight",
//     cut: "",
//     clarity: "",
//     color: "",
//     Tag_ID: "",
//     Prefix: "",
//     Purity: "",
//     metal_type: selectedProduct?.metal_type || "",
//     PCode_BarCode: "",
//     Gross_Weight: "",
//     Stones_Weight: "",
//     deduct_st_Wt: "Yes",
//     stone_price_per_carat: "",
//     Stones_Price: "",
//     HUID_No: "",
//     Wastage_On: "Gross Weight",
//     Wastage_Percentage: "",
//     Status: "Available",
//     Source: "Sales",
//     Stock_Point: "Display Floor1",
//     pieace_cost: "",
//     tax_percent: "",
//     mrp_price: "",
//     total_pcs_cost: "",
//     WastageWeight: "",
//     TotalWeight_AW: "",
//     MC_Per_Gram: "",
//     Making_Charges_On: "",
//     Making_Charges: "",
//     Design_Master: selectedProduct?.design_name || "",
//     Weight_BW: "",
//     rate: "",
//     tax: "03% GST",
//     tax_amt: "",
//     total_price: "",
//     pur_Gross_Weight: "",
//     pur_rate_cut: "",
//     pur_Purity: "",
//     pur_purityPercentage: "",
//     pur_Stones_Weight: "",
//     pur_deduct_st_Wt: "Yes",
//     pur_stone_price_per_carat: "",
//     pur_Stones_Price: "",
//     pur_Weight_BW: "",
//     pur_Making_Charges_On: "",
//     pur_MC_Per_Gram: "",
//     pur_Making_Charges: "",
//     pur_Wastage_On: "Gross Weight",
//     pur_Wastage_Percentage: "",
//     pur_WastageWeight: "",
//     pur_TotalWeight_AW: "",
//     size: "",
//     tag_weight: "",
//     pcs: "1",
//     MC_Per_Gram_Label: "",
//     printing_purity: "",
//     source_from: "ERP",
//     Cover_Wt: "",
//     Card_Wt: "",
//     Packing_Wt: "",
//   });

//   const [show, setShow] = useState(false);
//   const [showPurchase, setShowPurchase] = useState(false);
//   const handleShow = () => setShow(true);
//   const handleClose = () => setShow(false);

//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const handleView = (item) => {
//     setSelectedRow(item);
//     setShowViewModal(true);
//   };
//   const handleCloseViewModal = () => {
//     setShowViewModal(false);
//     setSelectedRow(null);
//   };

//   const [stoneDetails, setStoneDetails] = useState({
//     stoneName: "",
//     cut: "",
//     color: "",
//     clarity: "",
//     stoneWt: "",
//     caratWt: "",
//     stonePrice: "",
//     amount: "",
//   });
//   const [stoneList, setStoneList] = useState([]);
//   const [editingStoneIndex, setEditingStoneIndex] = useState(null);

//   const [rates, setRates] = useState({
//     rate_24crt: "",
//     rate_22crt: "",
//     rate_18crt: "",
//     rate_16crt: "",
//     silver_rate: "",
//   });

//   // Fetch current rates
//   useEffect(() => {
//     const fetchCurrentRates = async () => {
//       try {
//         const response = await axios.get(`${baseURL}/get/current-rates`);
//         const newRates = {
//           rate_24crt: response.data.rate_24crt || "",
//           rate_22crt: response.data.rate_22crt || "",
//           rate_18crt: response.data.rate_18crt || "",
//           rate_16crt: response.data.rate_16crt || "",
//           silver_rate: response.data.silver_rate || "",
//         };
//         setRates(newRates);
//         const metalType = formData.metal_type?.toLowerCase();
//         setFormData((prev) => ({
//           ...prev,
//           rate_24k:
//             metalType === "silver" ? newRates.silver_rate : newRates.rate_24crt,
//         }));
//       } catch (error) {
//         console.error("Error fetching current rates:", error);
//       }
//     };
//     fetchCurrentRates();
//   }, [formData.metal_type]);

//   // Packing Wt = Cover Wt + Card Wt
//   useEffect(() => {
//     const coverWt = parseFloat(formData.Cover_Wt) || 0;
//     const cardWt = parseFloat(formData.Card_Wt) || 0;
//     setFormData((prev) => ({
//       ...prev,
//       Packing_Wt: (coverWt + cardWt).toFixed(3),
//     }));
//   }, [formData.Cover_Wt, formData.Card_Wt]);

//   // Fetch stock points
//   useEffect(() => {
//     const fetchStockPoints = async () => {
//       try {
//         const response = await axios.get(`${baseURL}/api/stockpoints`);
//         if (response.data && Array.isArray(response.data)) {
//           const options = response.data.map((p) => ({
//             value: p.stock_point_name,
//             label: p.stock_point_name,
//           }));
//           setStockPointOptions(options);
//           const defaultPoint = response.data.find(
//             (p) => p.default_status === "applied"
//           );
//           if (defaultPoint) {
//             const name = defaultPoint.stock_point_name;
//             setDefaultStockPoint(name);
//             setFormData((prev) => ({ ...prev, Stock_Point: name }));
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching stock points:", error);
//         setStockPointOptions([
//           { value: "Display Floor1", label: "Display Floor1" },
//           { value: "Display Floor2", label: "Display Floor2" },
//           { value: "Strong room", label: "Strong room" },
//         ]);
//       }
//     };
//     fetchStockPoints();
//   }, []);

//   // Stone totals
//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem("tagStoneDetails")) || [];
//     const totalWt = stored.reduce(
//       (s, i) => s + (parseFloat(i.stoneWt) || 0),
//       0
//     );
//     const totalVal = stored.reduce(
//       (s, i) => s + (parseFloat(i.amount) || 0),
//       0
//     );
//     setFormData((prev) => ({
//       ...prev,
//       Stones_Weight: totalWt.toFixed(3),
//       Stones_Price: totalVal.toFixed(2),
//     }));
//   }, []);

//   // Purchase stone totals
//   const [purStoneDetails, setPurStoneDetails] = useState({
//     stoneName: "",
//     cut: "",
//     color: "",
//     clarity: "",
//     stoneWt: "",
//     caratWt: "",
//     stonePrice: "",
//     amount: "",
//   });
//   const [purchaseStoneList, setPurchaseStoneList] = useState([]);
//   const [editingPurchaseStoneIndex, setEditingPurchaseStoneIndex] =
//     useState(null);

//   useEffect(() => {
//     const stored =
//       JSON.parse(localStorage.getItem("tagPurStoneDetails")) || [];
//     const totalWt = stored.reduce(
//       (s, i) => s + (parseFloat(i.stoneWt) || 0),
//       0
//     );
//     const totalVal = stored.reduce(
//       (s, i) => s + (parseFloat(i.amount) || 0),
//       0
//     );
//     setFormData((prev) => ({
//       ...prev,
//       pur_Stones_Weight: totalWt.toFixed(3),
//       pur_Stones_Price: totalVal.toFixed(2),
//     }));
//   }, []);

//   // Wastage + Total Weight calculation
//   useEffect(() => {
//     const wp = parseFloat(formData.Wastage_Percentage) || 0;
//     const gw = parseFloat(formData.Gross_Weight) || 0;
//     const wbw = parseFloat(formData.Weight_BW) || 0;
//     const pwp = parseFloat(formData.pur_Wastage_Percentage) || 0;
//     const pgw = parseFloat(formData.pur_Gross_Weight) || 0;
//     const pwbw = parseFloat(formData.pur_Weight_BW) || 0;

//     let ww = 0,
//       tw = 0,
//       pww = 0,
//       ptw = 0;

//     if (formData.Wastage_On === "Gross Weight") {
//       ww = (gw * wp) / 100;
//       tw = wbw + ww;
//     } else if (formData.Wastage_On === "Weight BW") {
//       ww = (wbw * wp) / 100;
//       tw = wbw + ww;
//     }
//     if (formData.pur_Wastage_On === "Gross Weight") {
//       pww = (pgw * pwp) / 100;
//       ptw = pwbw + pww;
//     } else if (formData.pur_Wastage_On === "Weight BW") {
//       pww = (pwbw * pwp) / 100;
//       ptw = pwbw + pww;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       WastageWeight: ww.toFixed(3),
//       TotalWeight_AW: tw.toFixed(3),
//       pur_WastageWeight: pww.toFixed(3),
//       pur_TotalWeight_AW: ptw.toFixed(3),
//     }));
//   }, [
//     formData.Wastage_On,
//     formData.Wastage_Percentage,
//     formData.Gross_Weight,
//     formData.Weight_BW,
//     formData.pur_Wastage_On,
//     formData.pur_Wastage_Percentage,
//     formData.pur_Gross_Weight,
//     formData.pur_Weight_BW,
//   ]);

//   // Making charges
//   const handleMakingChargesCalculation = () => {
//     const tw = parseFloat(formData.TotalWeight_AW) || 0;
//     const mcg = parseFloat(formData.MC_Per_Gram) || 0;
//     const mc = parseFloat(formData.Making_Charges) || 0;
//     const rate = parseFloat(formData.rate) || 0;

//     const ptw = parseFloat(formData.pur_TotalWeight_AW) || 0;
//     const pmcg = parseFloat(formData.pur_MC_Per_Gram) || 0;
//     const pmc = parseFloat(formData.pur_Making_Charges) || 0;
//     const prate = parseFloat(formData.pur_rate_cut) || 0;

//     if (formData.Making_Charges_On === "MC / Gram") {
//       setFormData((prev) => ({
//         ...prev,
//         Making_Charges: (tw * mcg).toFixed(2),
//       }));
//     } else if (formData.Making_Charges_On === "MC / Piece") {
//       setFormData((prev) => ({
//         ...prev,
//         MC_Per_Gram: (tw ? mc / tw : 0).toFixed(2),
//       }));
//     } else if (formData.Making_Charges_On === "MC %") {
//       const rateAmt = rate * tw;
//       setFormData((prev) => ({
//         ...prev,
//         Making_Charges: ((mcg * rateAmt) / 100).toFixed(2),
//       }));
//     }

//     if (formData.pur_Making_Charges_On === "MC / Gram") {
//       setFormData((prev) => ({
//         ...prev,
//         pur_Making_Charges: (ptw * pmcg).toFixed(2),
//       }));
//     } else if (formData.pur_Making_Charges_On === "MC / Piece") {
//       setFormData((prev) => ({
//         ...prev,
//         pur_MC_Per_Gram: (ptw ? pmc / ptw : 0).toFixed(2),
//       }));
//     } else if (formData.pur_Making_Charges_On === "MC %") {
//       const rateAmt = prate * ptw;
//       setFormData((prev) => ({
//         ...prev,
//         pur_Making_Charges: ((pmcg * rateAmt) / 100).toFixed(2),
//       }));
//     }
//   };

//   useEffect(() => {
//     handleMakingChargesCalculation();
//   }, [
//     formData.Making_Charges_On,
//     formData.MC_Per_Gram,
//     formData.Making_Charges,
//     formData.TotalWeight_AW,
//     formData.pur_Making_Charges_On,
//     formData.pur_MC_Per_Gram,
//     formData.pur_Making_Charges,
//     formData.pur_TotalWeight_AW,
//   ]);

//   // Tax + Total
//   useEffect(() => {
//     const rate = parseFloat(formData.rate) || 0;
//     const weight = parseFloat(formData.TotalWeight_AW) || 0;
//     const stonesPrice = parseFloat(formData.Stones_Price) || 0;
//     const makingCharges = parseFloat(formData.Making_Charges) || 0;
//     const baseAmount = rate * weight + stonesPrice + makingCharges;
//     const taxPercent = parseFloat(formData.tax) || 0;
//     const taxAmt = (baseAmount * taxPercent) / 100;
//     setFormData((prev) => ({
//       ...prev,
//       tax_amt: taxAmt.toFixed(2),
//       total_price: (baseAmount + taxAmt).toFixed(2),
//     }));
//   }, [
//     formData.rate,
//     formData.TotalWeight_AW,
//     formData.Stones_Price,
//     formData.Making_Charges,
//     formData.tax,
//   ]);

//   // Product options
//   useEffect(() => {
//     axios
//       .get(`${baseURL}/get/products`)
//       .then((response) => {
//         const options = response.data.map((p) => ({
//           value: p.product_id,
//           label: `${p.product_id}`,
//         }));
//         setProductOptions(options);
//       })
//       .catch((err) => console.error("Error fetching products:", err));
//   }, []);

//   const isGoldCategory =
//     formData.category &&
//     ["gold", "diamond", "others"].some((m) =>
//       formData.category.toLowerCase().includes(m)
//     );
//   const isSilverCategory =
//     formData.category && formData.category.toLowerCase().includes("silver");

//   useEffect(() => {
//     if (isGoldCategory) {
//       setFormData((prev) => ({
//         ...prev,
//         Making_Charges_On: "MC %",
//         MC_Per_Gram_Label: "MC%",
//         Making_Charges: "",
//       }));
//     } else if (isSilverCategory) {
//       setFormData((prev) => ({
//         ...prev,
//         Making_Charges_On: "MC / Gram",
//         MC_Per_Gram_Label: "MC/Gm",
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, MC_Per_Gram_Label: "MC/Gm" }));
//     }
//   }, [formData.category]);

//   useEffect(() => {
//     if (isGoldCategory) {
//       setFormData((prev) => ({
//         ...prev,
//         pur_Making_Charges_On: "MC %",
//         pur_MC_Per_Gram_Label: "MC%",
//         pur_Making_Charges: "",
//       }));
//     } else if (isSilverCategory) {
//       setFormData((prev) => ({
//         ...prev,
//         pur_Making_Charges_On: "MC / Gram",
//         pur_MC_Per_Gram_Label: "MC/Gm",
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, pur_MC_Per_Gram_Label: "MC/Gm" }));
//     }
//   }, [formData.category]);

//   // Auto rate_cut on purity change
//   useEffect(() => {
//     if (formData.pur_Purity && formData.metal_type) {
//       const normalized = formData.pur_Purity.toLowerCase();
//       const metal = formData.metal_type.toLowerCase();
//       let newRate = "";
//       if (metal === "silver") newRate = rates.silver_rate;
//       else if (normalized === "manual") newRate = rates.rate_22crt;
//       else if (normalized.includes("22")) newRate = rates.rate_22crt;
//       else if (normalized.includes("24")) newRate = rates.rate_24crt;
//       else if (normalized.includes("18")) newRate = rates.rate_18crt;
//       else if (normalized.includes("16")) newRate = rates.rate_16crt;
//       else newRate = rates.rate_22crt;
//       setFormData((prev) => ({ ...prev, pur_rate_cut: newRate }));
//     }
//   }, [formData.pur_Purity, formData.metal_type, rates]);

//   // Selling rate from purity
//   useEffect(() => {
//     if (!formData.Purity) {
//       setFormData((prev) => ({ ...prev, rate: "" }));
//       return;
//     }
//     const purityValue = parseFloat(formData.Purity);
//     const baseRate = parseFloat(formData.rate_24k);
//     if (!isNaN(purityValue) && !isNaN(baseRate)) {
//       setFormData((prev) => ({
//         ...prev,
//         rate: ((purityValue / 100) * baseRate).toFixed(2),
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, rate: "" }));
//     }
//   }, [formData.Purity, formData.rate_24k]);

//   // Main change handler
//   const handleChange = async (fieldOrEvent, valueArg) => {
//     let field, value;
//     if (fieldOrEvent && fieldOrEvent.target) {
//       field = fieldOrEvent.target.name;
//       value = fieldOrEvent.target.value;
//       if (fieldOrEvent.target.type === "file") {
//         const file = fieldOrEvent.target.files[0];
//         if (file) {
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             setFormData((prev) => ({
//               ...prev,
//               productImage: file,
//               imagePreview: reader.result,
//             }));
//           };
//           reader.readAsDataURL(file);
//         }
//         return;
//       }
//     } else {
//       field = fieldOrEvent;
//       value = valueArg;
//     }

//     if (field === "sub_category") {
//       const selected = subCategories.find(
//         (c) => c.sub_category_name === value
//       );
//       if (selected) {
//         try {
//           const response = await axios.get(
//             `${baseURL}/getNextPCodeBarCode`,
//             { params: { prefix: selected.prefix } }
//           );
//           const next = response.data.nextPCodeBarCode;
//           setFormData((prev) => ({
//             ...prev,
//             sub_category: selected.sub_category_name,
//             subcategory_id: selected.subcategory_id,
//             item_prefix: selected.prefix,
//             Prefix: selected.prefix,
//             PCode_BarCode: next,
//             suffix: next.replace(selected.prefix, ""),
//             Purity: selected.selling_purity || "",
//             pur_Purity: selected.purity || "",
//             printing_purity: selected.printing_purity || "",
//           }));
//         } catch (error) {
//           console.error("Error fetching PCode_BarCode:", error);
//         }
//       } else {
//         setFormData((prev) => ({
//           ...prev,
//           sub_category: "",
//           subcategory_id: "",
//           item_prefix: "",
//           Prefix: "",
//           PCode_BarCode: "",
//           Purity: "",
//           pur_Purity: "",
//           printing_purity: "",
//         }));
//       }
//     } else {
//       setFormData((prev) => ({ ...prev, [field]: value }));
//     }

//     setFormData((prev) => {
//       let updated = { ...prev, [field]: value };

//       if (field === "Gross_Weight") updated.pur_Gross_Weight = value;
//       if (field === "Making_Charges_On") {
//         if (value === "MC / Gram" || value === "MC / Piece")
//           updated.Making_Charges = prev.Making_Charges || "";
//         else updated.Making_Charges = "";
//         let label = "MC/Gm";
//         if (value === "MC %") label = "MC%";
//         updated.MC_Per_Gram_Label = label;
//       }
//       if (field === "pur_Making_Charges_On") {
//         if (value === "MC / Gram" || value === "MC / Piece")
//           updated.pur_Making_Charges = prev.pur_Making_Charges || "";
//         else updated.pur_Making_Charges = "";
//         let label = "MC/Gm";
//         if (value === "MC %") label = "MC%";
//         updated.pur_MC_Per_Gram_Label = label;
//       }

//       if (
//         field === "Gross_Weight" ||
//         field === "Stones_Weight" ||
//         field === "deduct_st_Wt" ||
//         field === "pur_Gross_Weight" ||
//         field === "pur_Stones_Weight" ||
//         field === "pur_deduct_st_Wt"
//       ) {
//         const g = parseFloat(updated.Gross_Weight) || 0;
//         const s = parseFloat(updated.Stones_Weight) || 0;
//         updated.Weight_BW =
//           updated.deduct_st_Wt?.toLowerCase() === "yes"
//             ? (g - s).toFixed(2)
//             : g.toFixed(2);

//         const pg = parseFloat(updated.pur_Gross_Weight) || 0;
//         const ps = parseFloat(updated.pur_Stones_Weight) || 0;
//         updated.pur_Weight_BW =
//           updated.pur_deduct_st_Wt?.toLowerCase() === "yes"
//             ? (pg - ps).toFixed(2)
//             : pg.toFixed(2);
//       }

//       if (field === "pieace_cost" || field === "tax_percent") {
//         const t = parseFloat(
//           field === "tax_percent" ? value : prev.tax_percent
//         ) || 0;
//         const p = parseFloat(
//           field === "pieace_cost" ? value : prev.pieace_cost
//         ) || 0;
//         updated.mrp_price = ((p * t) / 100 + p).toFixed(2);
//       }
//       if (field === "pieace_cost" || field === "pcs") {
//         const pcs = parseFloat(field === "pcs" ? value : prev.pcs) || 0;
//         const pc = parseFloat(
//           field === "pieace_cost" ? value : prev.pieace_cost
//         ) || 0;
//         updated.total_pcs_cost = (pcs * pc).toFixed(2);
//       }
//       if (field === "mrp_price") {
//         const mr = parseFloat(value) || 0;
//         const t = parseFloat(prev.tax_percent) || 0;
//         const pc = (mr / (100 + t)) * 100;
//         updated.pieace_cost = pc.toFixed(2);
//         const pcs = parseFloat(prev.pcs) || 0;
//         updated.total_pcs_cost = (pcs * pc).toFixed(2);
//       }
//       if (field === "Cover_Wt" || field === "Card_Wt") {
//         const cw = parseFloat(updated.Cover_Wt) || 0;
//         const cdw = parseFloat(updated.Card_Wt) || 0;
//         updated.Packing_Wt = (cw + cdw).toFixed(3);
//       }
//       return updated;
//     });

//     if (field === "category") {
//       setFormData((prev) => ({ ...prev, category: value }));
//     }
//   };

//   // Stone handlers
//   const handleAddStone = () => {
//     let list = [...stoneList];
//     if (editingStoneIndex !== null) {
//       list[editingStoneIndex] = stoneDetails;
//       setEditingStoneIndex(null);
//     } else list.push(stoneDetails);
//     setStoneList(list);
//     localStorage.setItem("tagStoneDetails", JSON.stringify(list));
//     window.dispatchEvent(new Event("storage"));
//     setStoneDetails({
//       stoneName: "",
//       cut: "",
//       color: "",
//       clarity: "",
//       stoneWt: "",
//       caratWt: "",
//       stonePrice: "",
//       amount: "",
//     });
//   };

//   const handleEditStone = (index) => {
//     setStoneDetails(stoneList[index]);
//     setEditingStoneIndex(index);
//     handleShow();
//   };

//   const handleDeleteStone = (index) => {
//     const updated = stoneList.filter((_, i) => i !== index);
//     setStoneList(updated);
//     localStorage.setItem("tagStoneDetails", JSON.stringify(updated));
//     window.dispatchEvent(new Event("storage"));
//   };

//   const handleShowPurchase = () => setShowPurchase(true);
//   const handleClosePurchase = () => setShowPurchase(false);

//   const handleAddTagPurStone = () => {
//     let list = [...purchaseStoneList];
//     if (editingPurchaseStoneIndex !== null) {
//       list[editingPurchaseStoneIndex] = purStoneDetails;
//       setEditingPurchaseStoneIndex(null);
//     } else list.push(purStoneDetails);
//     setPurchaseStoneList(list);
//     localStorage.setItem("tagPurStoneDetails", JSON.stringify(list));
//     window.dispatchEvent(new Event("storage"));
//     setPurStoneDetails({
//       stoneName: "",
//       cut: "",
//       color: "",
//       clarity: "",
//       stoneWt: "",
//       caratWt: "",
//       stonePrice: "",
//       amount: "",
//     });
//   };

//   const handleTagPurEditStone = (index) => {
//     setPurStoneDetails(purchaseStoneList[index]);
//     setEditingPurchaseStoneIndex(index);
//     handleShowPurchase();
//   };

//   const handleTagPurDeleteStone = (index) => {
//     const updated = purchaseStoneList.filter((_, i) => i !== index);
//     setPurchaseStoneList(updated);
//     localStorage.setItem("tagPurStoneDetails", JSON.stringify(updated));
//     window.dispatchEvent(new Event("storage"));
//   };

//   const isByFixed = formData.Pricing === "By fixed";
//   const [isGeneratePDF, setIsGeneratePDF] = useState(true);
//   const isGeneratePDFRef = useRef(isGeneratePDF);
//   useEffect(() => {
//     isGeneratePDFRef.current = isGeneratePDF;
//   }, [isGeneratePDF]);

//   // Save PDF to server
//   const handleSavePDFToServer = async (pdfBlob, pcode, serverBaseURL) => {
//     const fd = new FormData();
//     fd.append("invoice", pdfBlob, `${pcode}.pdf`);
//     try {
//       const response = await fetch(`${serverBaseURL}/upload-invoice`, {
//         method: "POST",
//         body: fd,
//       });
//       if (!response.ok) throw new Error("Failed to upload invoice");
//       return true;
//     } catch (error) {
//       console.error("Error uploading tag PDF:", error);
//       return false;
//     }
//   };

//   // Generate QR PDF
//   const generateQRCodePDF = async (data) => {
//     const doc = new jsPDF({
//       orientation: "landscape",
//       unit: "mm",
//       format: [65, 16],
//     });
//     const isByWeight = data.Pricing === "By Weight";
//     try {
//       const qrContent = JSON.stringify({
//         barcode: data.PCode_BarCode,
//         product_name: data.sub_category || "",
//         purity: data.printing_purity || "",
//         gross_weight: data.Gross_Weight || "0",
//         net_weight: data.TotalWeight_AW || "0",
//         mrp: data.total_price || "0",
//         pricing: data.Pricing || "By Weight",
//       });
//       const qrImageData = await QRCode.toDataURL(qrContent, { margin: 0 });
//       const startX = 2;
//       let currentY = 4;
//       const lineGap = 3.2;
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(8.0);
//       doc.text(`TAG: ${data.PCode_BarCode}`, startX, currentY);
//       currentY += lineGap;
//       if (isByWeight) {
//         doc.text(`${data.sub_category}`, startX, currentY);
//         currentY += lineGap;
//         doc.text("NT WT:", startX, currentY);
//         doc.text(`${data.TotalWeight_AW}`, startX + 12, currentY);
//         currentY += lineGap;
//       }
//       doc.text("MRP:", startX, currentY);
//       doc.text(`${data.total_price}`, startX + 11, currentY);

//       const qrX = 35,
//         qrY = 2,
//         qrSize = 7,
//         moveRight = 6;
//       doc.addImage(qrImageData, "PNG", qrX + moveRight, qrY, qrSize, qrSize);
//       doc.setFontSize(4.2);
//       doc.text("O/N:", qrX + moveRight, qrY + qrSize + 2);
//       doc.setFontSize(6.0);
//       doc.text("JIYA JEWELLERY", qrX - 2, qrY + qrSize + 4.5);
//       return doc.output("blob");
//     } catch (error) {
//       console.error("PDF Error:", error);
//       return null;
//     }
//   };

//   // Submit
//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     const pcs = parseFloat(formData.pcs) || 0;
//     const gw = parseFloat(formData.Gross_Weight) || 0;

//     if (formData.Pricing === "By fixed") {
//       if (pcs <= 0) {
//         alert("The product's PCS must be greater than zero.");
//         return;
//       }
//       if (!formData.pieace_cost || parseFloat(formData.pieace_cost) <= 0) {
//         alert("Please enter a Piece Cost.");
//         return;
//       }
//     } else {
//       if (pcs <= 0 || gw <= 0) {
//         alert("PCS and Gross Weight must be greater than zero.");
//         return;
//       }
//     }
//     if (!formData.sub_category || !formData.subcategory_id) {
//       alert("Please select a valid sub-category.");
//       return;
//     }
//     if (formData.Pricing === "By Weight" && !formData.Gross_Weight) {
//       alert("Please add Gross Weight");
//       return;
//     }

//     try {
//       const updatedData = { ...formData, image };
//       const requestData = {
//         ...updatedData,
//         stone_details: stoneList,
//         purchase_stone_details: purchaseStoneList,
//         source_from: "ERP",
//       };

//       const productDataForApp = {
//         product_name: formData.sub_category || "",
//         category_id: formData.subcategory_id || "",
//         barcode: formData.PCode_BarCode || "",
//         metal_type: formData.metal_type || "",
//         purity: formData.Purity || "",
//         design: formData.design_master || "",
//         gross_wt: formData.Gross_Weight || "0",
//         Cover_Wt: formData.Cover_Wt || "0",
//         Card_Wt: formData.Card_Wt || "0",
//         Packing_Wt: formData.Packing_Wt || "0",
//         stone_wt: formData.Stones_Weight || "0",
//         net_wt: formData.Weight_BW || "0",
//         stone_price: formData.Stones_Price || "0",
//         pricing: formData.Pricing || "By Weight",
//         va_on: formData.Wastage_On || "Gross Weight",
//         va_percent: formData.Wastage_Percentage || "0",
//         wastage_weight: formData.WastageWeight || "0",
//         total_weight_av: formData.TotalWeight_AW || "0",
//         mc_on: formData.Making_Charges_On || "MC %",
//         mc_per_gram: formData.MC_Per_Gram || "0",
//         making_charges: formData.Making_Charges || "0",
//         rate: formData.rate || "0",
//         hm_charges: "60.00",
//         tax_percent: formData.tax || "0.9% GST",
//         tax_amt: formData.tax_amt || "0",
//         total_price: formData.total_price || "0",
//         pieace_cost: formData.pieace_cost || "0",
//         qty: formData.pcs || "1",
//         huid_no: formData.HUID_No || "",
//         stock_point: formData.Stock_Point || "Display Floor1",
//         product_image: image || null,
//         source: "Order Management",
//       };

//       const [res1, res2] = await Promise.all([
//         axios.post(`${baseURL}/post/opening-tags-entry`, requestData, {
//           headers: { "Content-Type": "application/json" },
//         }),
//         axios.post(`${baseURL2}/post/product`, productDataForApp, {
//           headers: { "Content-Type": "application/json" },
//         }),
//       ]);

//       if (res1.status === 200 || res1.status === 201) {
//         console.log("Tag saved to ERP");
//       }
//       if (res2.status === 200 || res2.status === 201) {
//         console.log("Product saved to Jewellery App");
//         const productId = res2.data.product_id;
//         if (isGeneratePDFRef.current && formData.PCode_BarCode) {
//           const pdfBlob = await generateQRCodePDF(updatedData);
//           if (pdfBlob) {
//             await handleSavePDFToServer(
//               pdfBlob,
//               formData.PCode_BarCode,
//               baseURL
//             );
//             await handleSavePDFToServer(
//               pdfBlob,
//               formData.PCode_BarCode,
//               baseURL2
//             );
//             try {
//               await axios.put(
//                 `${baseURL2}/update-product-qr/${productId}`,
//                 { qr_generated: true }
//               );
//             } catch (err) {
//               console.error("QR status update failed:", err);
//             }
//           }
//         }
//       }

//       alert("Stock added successfully!");
//       if (fetchBalance) fetchBalance();

//       localStorage.removeItem("tagStoneDetails");
//       localStorage.removeItem("tagPurStoneDetails");
//       setStoneList([]);
//       setPurchaseStoneList([]);

//       // Reset barcode for next entry
//       try {
//         const response = await axios.get(
//           `${baseURL}/getNextPCodeBarCode`,
//           { params: { prefix: formData.item_prefix } }
//         );
//         const next = response.data.nextPCodeBarCode;
//         setFormData((prev) => ({
//           ...prev,
//           PCode_BarCode: next,
//           suffix: next.replace(formData.item_prefix, ""),
//           Gross_Weight: "",
//           Stones_Weight: "",
//           Stones_Price: "",
//           deduct_st_Wt: "Yes",
//           Weight_BW: "",
//           Wastage_On: "Gross Weight",
//           WastageWeight: "",
//           Status: "Available",
//           Source: "Sales",
//           pur_Gross_Weight: "",
//           pur_Stones_Weight: "",
//           pur_Stones_Price: "",
//           pur_deduct_st_Wt: "Yes",
//           pur_Weight_BW: "",
//           pur_WastageWeight: "",
//           pur_Wastage_On: "Gross Weight",
//           pcs: "1",
//           pieace_cost: "",
//           mrp_price: "",
//           total_pcs_cost: "",
//           Cover_Wt: "",
//           Card_Wt: "",
//           Packing_Wt: "",
//         }));
//         setImage(null);
//         fetchTagData();
//       } catch (err) {
//         console.error("Error fetching next barcode:", err);
//       }
//     } catch (error) {
//       console.error("Error in submission:", error);
//       alert(
//         error.response?.data?.message ||
//           "An error occurred. Please try again."
//       );
//     }
//   };

//   // Fetch tag data for this invoice
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchTagData = async () => {
//     try {
//       const response = await fetch(`${baseURL}/get/opening-tags-entry`);
//       const jsonData = await response.json();
//       if (jsonData.result && Array.isArray(jsonData.result)) {
//         const filtered = jsonData.result.filter(
//           (item) =>
//             item.invoice ===
//               (selectedProduct.invoice_number || selectedProduct.invoice) &&
//             item.category ===
//               (selectedProduct.category || selectedProduct.product_name)
//         );
//         setData(filtered);
//       } else setData([]);
//     } catch (error) {
//       console.error("Error fetching tag data:", error);
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedProduct) fetchTagData();
//   }, [selectedProduct]);

//   // Fetch subcategories
//   const fetchSubCategories = async () => {
//     try {
//       const response = await axios.get(`${baseURL}/get/subcategories`);
//       const filtered = response.data.filter(
//         (sub) => sub.category_id === selectedProduct.product_id
//       );
//       setSubCategories(filtered);
//       return filtered;
//     } catch (error) {
//       console.error("Error fetching subcategories:", error);
//       return [];
//     }
//   };

//   useEffect(() => {
//     if (selectedProduct?.product_id) fetchSubCategories();
//   }, [selectedProduct]);

//   // Design master
//   const [designOptions, setdesignOptions] = useState([]);
//   const fetchDesignMaster = async () => {
//     try {
//       const response = await axios.get(`${baseURL}/designmaster`);
//       const designMasters = response.data.map((item) => ({
//         value: item.design_name,
//         label: item.design_name,
//         id: item.design_id,
//       }));
//       setdesignOptions(designMasters);
//     } catch (error) {
//       console.error("Error fetching design masters:", error);
//     }
//   };
//   useEffect(() => {
//     fetchDesignMaster();
//   }, []);

//   // Modals for adding subcategory / design
//   const [showModal, setShowModal] = useState(false);
//   const handleOpenModal = () => setShowModal(true);
//   const handleCloseModal = () => setShowModal(false);
//   const [newSubCategory, setNewSubCategory] = useState({
//     name: "",
//     prefix: "",
//     category: "",
//     purity: "",
//     selling_purity: "",
//     printing_purity: "",
//   });
//   const handleModalChange = (e) => {
//     let { name, value } = e.target;
//     if (name === "name" || name === "prefix") value = value.toUpperCase();
//     setNewSubCategory((prev) => ({ ...prev, [name]: value }));
//     if (name === "prefix")
//       setFormData((prev) => ({ ...prev, Prefix: value }));
//   };
//   const handleAddSubCategory = async () => {
//     if (
//       !newSubCategory.name ||
//       !newSubCategory.prefix ||
//       !newSubCategory.purity ||
//       !newSubCategory.selling_purity ||
//       !newSubCategory.printing_purity
//     ) {
//       alert("All fields are required.");
//       return;
//     }
//     try {
//       const data = {
//         category_id: selectedProduct.product_id,
//         subcategory_id: 1,
//         sub_category_name: newSubCategory.name,
//         category: newSubCategory.category || formData.category,
//         prefix: newSubCategory.prefix,
//         metal_type: selectedProduct.metal_type,
//         purity: newSubCategory.purity,
//         selling_purity: newSubCategory.selling_purity,
//         printing_purity: newSubCategory.printing_purity,
//       };
//       const response = await axios.post(`${baseURL}/post/subcategory`, data);
//       if (response.status === 201) {
//         alert("Subcategory added successfully");
//         handleCloseModal();
//         setNewSubCategory({
//           name: "",
//           prefix: "",
//           category: "",
//           purity: "",
//           selling_purity: "",
//           printing_purity: "",
//         });
//         await fetchSubCategories();
//       }
//     } catch (error) {
//       console.error("Error during API request:", error);
//     }
//   };

//   const [showDesignModal, setShowDesignModal] = useState(false);
//   const [newDesign, setNewDesign] = useState({
//     design_name: "",
//     design_prefix: "",
//     category: formData.category,
//   });
//   const handleOpenDesignModal = () => setShowDesignModal(true);
//   const handleCloseDesignModal = () => setShowDesignModal(false);
//   const handleDesignModalChange = (e) => {
//     setNewDesign({ ...newDesign, [e.target.name]: e.target.value });
//   };
//   const handleAddDesign = async () => {
//     if (!newDesign.design_name) {
//       alert("Product Design Name required!");
//       return;
//     }
//     try {
//       const response = await axios.post(`${baseURL}/designmaster`, {
//         category: newDesign.category || formData.category,
//         design_name: newDesign.design_name,
//         metal: newDesign.metal || formData.metal_type,
//       });
//       if (response.status === 201 || response.status === 200) {
//         alert("Design added successfully!");
//         handleCloseDesignModal();
//         setNewDesign({
//           design_name: "",
//           metal: formData.metal_type,
//           category: formData.category,
//         });
//         await fetchDesignMaster();
//       }
//     } catch (error) {
//       console.error("Error adding design:", error);
//       alert("Failed to add design.");
//     }
//   };

//   // Alt+S to save
//   useEffect(() => {
//     const handler = (e) => {
//       if (e.altKey && e.key.toLowerCase() === "s") {
//         e.preventDefault();
//         handleSubmit();
//       }
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   });

//   // Image
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setImage(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };
//   const captureImage = () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     setImage(imageSrc);
//     setIsCameraOpen(false);
//   };
//   const clearImage = () => setImage(null);

//   // Excel export
//   const exportToExcel = (event) => {
//     event.preventDefault();
//     if (data.length === 0) {
//       alert("No data available to export.");
//       return;
//     }
//     const worksheetData = data.map((item, index) => ({
//       SI: index + 1,
//       "Supplier Name": item.account_name,
//       Barcode: item.PCode_BarCode,
//       Category: item.category,
//       "Sub Category": item.sub_category,
//       "Design Name": item.design_master,
//       Purity: item.Purity,
//       Pcs: item.pcs,
//       "Gross Wt": item.Gross_Weight,
//       "Stone Wt": item.Stones_Weight,
//       "Wt BW": item.Weight_BW,
//       "W.Wt": item.WastageWeight,
//       "Total Wt": item.TotalWeight_AW,
//       "MC On": item.Making_Charges_On,
//       "Total MC": item.Making_Charges,
//       "Piece Cost": item.pieace_cost,
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
//     XLSX.writeFile(workbook, "SalesTagDetails.xlsx");
//   };

//   const selectedCategory = subCategories.find(
//     (c) => c.sub_category_name === formData.sub_category
//   );

//   return (
//     <div style={{ paddingTop: "0px" }}>
//       <div className="container mb-4">
//         <div className="row mt-1">
//           <div className="col-12">
//             <Form className="p-4 border rounded form-container-stockentry">
//               <div className="stock-entry-form">
//                 <h4 className="mb-3" style={{ marginTop: "-16px" }}>
//                   Stock Entry
//                 </h4>

//                 <Row className="stock-form-section">
//                   <Col xs={12} md={2}>
//                     <InputField
//                       label="Supplier Name"
//                       name="account_name"
//                       value={formData.account_name}
//                       onChange={handleChange}
//                       readOnly
//                     />
//                   </Col>
//                   <Col xs={12} md={2}>
//                     <InputField
//                       label="Category"
//                       name="category"
//                       value={formData.category}
//                       onChange={handleChange}
//                       readOnly
//                     />
//                   </Col>
//                   <Col xs={12} md={3} className="d-flex align-items-center">
//                     <div style={{ flex: 1 }}>
//                       <InputField
//                         label="Sub Category"
//                         name="sub_category"
//                         type="select"
//                         value={formData.sub_category}
//                         onChange={handleChange}
//                         options={subCategories.map((c) => ({
//                           value: c.sub_category_name,
//                           label: c.sub_category_name,
//                         }))}
//                         autoFocus
//                       />
//                     </div>
//                     <AiOutlinePlus
//                       size={20}
//                       color="black"
//                       onClick={handleOpenModal}
//                       style={{
//                         marginLeft: "10px",
//                         cursor: "pointer",
//                         marginBottom: "20px",
//                       }}
//                     />
//                   </Col>
//                   <Col xs={12} md={3} className="d-flex align-items-center">
//                     <div style={{ flex: 1 }}>
//                       <InputField
//                         label="Product Design Name"
//                         name="design_master"
//                         type="select"
//                         value={formData.design_master}
//                         onChange={handleChange}
//                         options={designOptions.map((o) => ({
//                           value: o.value,
//                           label: o.label,
//                         }))}
//                       />
//                     </div>
//                     <AiOutlinePlus
//                       size={20}
//                       color="black"
//                       onClick={handleOpenDesignModal}
//                       style={{
//                         marginLeft: "10px",
//                         cursor: "pointer",
//                         marginBottom: "20px",
//                       }}
//                     />
//                   </Col>
//                   <Col xs={12} md={2}>
//                     <InputField
//                       label="Pricing"
//                       name="Pricing"
//                       value={formData.Pricing}
//                       onChange={handleChange}
//                       readOnly
//                     />
//                   </Col>

//                   {isByFixed ? (
//                     <>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="PCode/BarCode"
//                           name="PCode_BarCode"
//                           type="text"
//                           value={formData.PCode_BarCode}
//                           onChange={handleChange}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Printing Purity"
//                           name="Purity"
//                           value={formData.printing_purity}
//                           onChange={handleChange}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Selling Purity"
//                           name="Purity"
//                           value={formData.Purity}
//                           onChange={handleChange}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Purchase Purity"
//                           name="pur_Purity"
//                           value={formData.pur_Purity}
//                           onChange={(e) =>
//                             handleChange("pur_Purity", e.target.value)
//                           }
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="HUID No"
//                           name="HUID_No"
//                           value={formData.HUID_No}
//                           onChange={handleChange}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Stock Point"
//                           name="Stock_Point"
//                           type="select"
//                           value={formData.Stock_Point}
//                           onChange={handleChange}
//                           options={
//                             stockPointOptions.length > 0
//                               ? stockPointOptions
//                               : [
//                                   {
//                                     value: "Display Floor1",
//                                     label: "Display Floor1",
//                                   },
//                                   {
//                                     value: "Display Floor2",
//                                     label: "Display Floor2",
//                                   },
//                                   {
//                                     value: "Strong room",
//                                     label: "Strong room",
//                                   },
//                                 ]
//                           }
//                         />
//                       </Col>
//                     </>
//                   ) : (
//                     <>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="PCode/BarCode"
//                           name="PCode_BarCode"
//                           type="text"
//                           value={formData.PCode_BarCode}
//                           onChange={handleChange}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Printing Purity"
//                           name="Purity"
//                           value={formData.printing_purity}
//                           onChange={handleChange}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="HUID No"
//                           name="HUID_No"
//                           value={formData.HUID_No}
//                           onChange={handleChange}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Stock Point"
//                           name="Stock_Point"
//                           type="select"
//                           value={formData.Stock_Point}
//                           onChange={handleChange}
//                           options={
//                             stockPointOptions.length > 0
//                               ? stockPointOptions
//                               : [
//                                   {
//                                     value: "Display Floor1",
//                                     label: "Display Floor1",
//                                   },
//                                   {
//                                     value: "Display Floor2",
//                                     label: "Display Floor2",
//                                   },
//                                   {
//                                     value: "Strong room",
//                                     label: "Strong room",
//                                   },
//                                 ]
//                           }
//                         />
//                       </Col>

//                       <Col xs={12} md={2}>
//                         <div className="image-upload-container">
//                           <Dropdown>
//                             <Dropdown.Toggle id="dropdown-basic-button">
//                               Upload Image
//                             </Dropdown.Toggle>
//                             <Dropdown.Menu
//                               style={{
//                                 zIndex: 1050,
//                                 position: "absolute",
//                               }}
//                             >
//                               <Dropdown.Item
//                                 onClick={() => fileInputRef.current.click()}
//                               >
//                                 Select Image
//                               </Dropdown.Item>
//                               <Dropdown.Item
//                                 onClick={() => setIsCameraOpen(true)}
//                               >
//                                 Capture Image
//                               </Dropdown.Item>
//                             </Dropdown.Menu>
//                           </Dropdown>
//                           <input
//                             type="file"
//                             accept="image/*"
//                             ref={fileInputRef}
//                             onChange={handleImageChange}
//                             style={{ display: "none" }}
//                           />
//                           {isCameraOpen && (
//                             <div className="webcam-container mt-2">
//                               <Webcam
//                                 audio={false}
//                                 ref={webcamRef}
//                                 screenshotFormat="image/jpeg"
//                                 className="img-thumbnail"
//                               />
//                               <div className="d-flex gap-2 mt-2">
//                                 <Button
//                                   onClick={captureImage}
//                                   variant="primary"
//                                 >
//                                   Capture
//                                 </Button>
//                                 <Button
//                                   onClick={() => setIsCameraOpen(false)}
//                                   variant="danger"
//                                 >
//                                   Cancel
//                                 </Button>
//                               </div>
//                             </div>
//                           )}
//                           {image && (
//                             <div
//                               style={{
//                                 position: "relative",
//                                 display: "inline-block",
//                                 marginTop: "10px",
//                               }}
//                             >
//                               <img
//                                 src={image}
//                                 alt="Selected"
//                                 style={{
//                                   width: "100px",
//                                   height: "100px",
//                                   borderRadius: "8px",
//                                 }}
//                               />
//                               <button
//                                 type="button"
//                                 onClick={clearImage}
//                                 style={{
//                                   position: "absolute",
//                                   top: "5px",
//                                   right: "5px",
//                                   background: "transparent",
//                                   border: "none",
//                                   color: "red",
//                                   fontSize: "16px",
//                                   cursor: "pointer",
//                                   zIndex: 10,
//                                 }}
//                               >
//                                 <FaTrash />
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </Col>

//                       {/* SALES SECTION */}
//                       <div className="purchase-form-left">
//                         <Col className="tag-urd-form1-section">
//                           <h4 className="mb-3" style={{ marginTop: "-10px" }}>
//                             Sales
//                           </h4>
//                           <Row className="mt-3">
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Gross Wt"
//                                 name="Gross_Weight"
//                                 value={formData.Gross_Weight}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Cover Wt"
//                                 name="Cover_Wt"
//                                 value={formData.Cover_Wt}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Card Wt"
//                                 name="Card_Wt"
//                                 value={formData.Card_Wt}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Packing Wt"
//                                 name="Packing_Wt"
//                                 value={formData.Packing_Wt}
//                                 onChange={handleChange}
//                                 readOnly
//                               />
//                             </Col>

//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Stones Wt"
//                                 name="Stones_Weight"
//                                 value={formData.Stones_Weight}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md="2">
//                               <Button
//                                 variant="primary"
//                                 onClick={handleShow}
//                                 style={{
//                                   backgroundColor: "#a36e29",
//                                   borderColor: "#a36e29",
//                                   fontSize: "0.8rem",
//                                   marginLeft: "-20px",
//                                   whiteSpace: "nowrap",
//                                 }}
//                               >
//                                 Stone Details
//                               </Button>
//                             </Col>
//                             <Col xs={12} md={4}>
//                               <InputField
//                                 label="Deduct St Wt"
//                                 name="deduct_st_Wt"
//                                 type="select"
//                                 value={formData.deduct_st_Wt || ""}
//                                 onChange={(e) =>
//                                   handleChange("deduct_st_Wt", e.target.value)
//                                 }
//                                 options={[
//                                   { value: "Yes", label: "Yes" },
//                                   { value: "No", label: "No" },
//                                 ]}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Stones Price"
//                                 name="Stones_Price"
//                                 value={formData.Stones_Price}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Selling Purity"
//                                 name="Purity"
//                                 value={formData.Purity}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={2}>
//                               <InputField
//                                 label="Wt BW"
//                                 name="Weight_BW"
//                                 value={formData.Weight_BW}
//                                 onChange={handleChange}
//                                 readOnly
//                               />
//                             </Col>
//                             <Col xs={12} md={4}>
//                               <InputField
//                                 label="Wastage On"
//                                 name="Wastage_On"
//                                 type="select"
//                                 value={formData.Wastage_On}
//                                 onChange={handleChange}
//                                 options={[
//                                   {
//                                     value: "Gross Weight",
//                                     label: "Gross Weight",
//                                   },
//                                   { value: "Weight BW", label: "Weight BW" },
//                                 ]}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Wastage %"
//                                 name="Wastage_Percentage"
//                                 value={formData.Wastage_Percentage}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="W.Wt"
//                                 name="WastageWeight"
//                                 value={formData.WastageWeight}
//                                 onChange={handleChange}
//                                 readOnly
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Total Wt"
//                                 name="TotalWeight_AW"
//                                 value={formData.TotalWeight_AW}
//                                 onChange={handleChange}
//                                 readOnly
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Rate"
//                                 name="rate"
//                                 value={formData.rate}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Tax%"
//                                 name="tax"
//                                 value={formData.tax}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={4}>
//                               <InputField
//                                 label="MC On"
//                                 name="Making_Charges_On"
//                                 type="select"
//                                 value={formData.Making_Charges_On}
//                                 onChange={handleChange}
//                                 options={[
//                                   { value: "MC / Gram", label: "MC / Gram" },
//                                   { value: "MC / Piece", label: "MC / Piece" },
//                                   { value: "MC %", label: "MC %" },
//                                 ]}
//                               />
//                             </Col>
//                             <Col xs={12} md={2}>
//                               <InputField
//                                 label={formData.MC_Per_Gram_Label}
//                                 name="MC_Per_Gram"
//                                 value={formData.MC_Per_Gram}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="MC"
//                                 name="Making_Charges"
//                                 value={formData.Making_Charges}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Total Amt"
//                                 name="total_price"
//                                 value={formData.total_price}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                           </Row>
//                         </Col>
//                       </div>

//                       {/* PURCHASE SECTION */}
//                       <div className="purchase-form-right">
//                         <Col className="tag-urd-form2-section">
//                           <h4 className="mb-3" style={{ marginTop: "-10px" }}>
//                             Purchase
//                           </h4>
//                           <Row className="mt-3">
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Gross Wt"
//                                 name="pur_Gross_Weight"
//                                 value={formData.pur_Gross_Weight}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Stones Wt"
//                                 name="pur_Stones_Weight"
//                                 value={formData.pur_Stones_Weight}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md="2">
//                               <Button
//                                 variant="primary"
//                                 onClick={handleShowPurchase}
//                                 style={{
//                                   backgroundColor: "#a36e29",
//                                   borderColor: "#a36e29",
//                                   fontSize: "0.8rem",
//                                   marginLeft: "-20px",
//                                   whiteSpace: "nowrap",
//                                 }}
//                               >
//                                 Stone Details
//                               </Button>
//                             </Col>
//                             <Col xs={12} md={4}>
//                               <InputField
//                                 label="Deduct St Wt"
//                                 name="pur_deduct_st_Wt"
//                                 type="select"
//                                 value={formData.pur_deduct_st_Wt || ""}
//                                 onChange={(e) =>
//                                   handleChange(
//                                     "pur_deduct_st_Wt",
//                                     e.target.value
//                                   )
//                                 }
//                                 options={[
//                                   { value: "Yes", label: "Yes" },
//                                   { value: "No", label: "No" },
//                                 ]}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Stones Price"
//                                 name="pur_Stones_Price"
//                                 value={formData.pur_Stones_Price}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Purity"
//                                 name="pur_Purity"
//                                 type="select"
//                                 value={formData.pur_Purity}
//                                 onChange={(e) =>
//                                   handleChange("pur_Purity", e.target.value)
//                                 }
//                                 options={[
//                                   ...(formData.Purity
//                                     ? [
//                                         {
//                                           value: selectedCategory?.purity,
//                                           label: selectedCategory?.purity,
//                                         },
//                                       ]
//                                     : []),
//                                   ...purityOptions
//                                     .filter((o) => o.name && o.purity)
//                                     .map((o) => ({
//                                       value: `${o.name} | ${o.purity}`,
//                                       label: `${o.name} | ${o.purity}`,
//                                     })),
//                                   { value: "Manual", label: "Manual" },
//                                 ]}
//                               />
//                             </Col>
//                             {formData.pur_Purity === "Manual" && (
//                               <Col xs={12} md={4}>
//                                 <InputField
//                                   label="Custom Purity %"
//                                   name="pur_purityPercentage"
//                                   value={formData.pur_purityPercentage || ""}
//                                   onChange={(e) =>
//                                     handleChange(
//                                       "pur_purityPercentage",
//                                       e.target.value
//                                     )
//                                   }
//                                 />
//                               </Col>
//                             )}
//                             <Col xs={12} md={2}>
//                               <InputField
//                                 label="Wt BW"
//                                 name="pur_Weight_BW"
//                                 value={formData.pur_Weight_BW}
//                                 onChange={handleChange}
//                                 readOnly
//                               />
//                             </Col>
//                             <Col xs={12} md={4}>
//                               <InputField
//                                 label="Wastage On"
//                                 name="pur_Wastage_On"
//                                 type="select"
//                                 value={formData.pur_Wastage_On}
//                                 onChange={handleChange}
//                                 options={[
//                                   {
//                                     value: "Gross Weight",
//                                     label: "Gross Weight",
//                                   },
//                                   { value: "Weight BW", label: "Weight BW" },
//                                 ]}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Wastage %"
//                                 name="pur_Wastage_Percentage"
//                                 value={formData.pur_Wastage_Percentage}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={2}>
//                               <InputField
//                                 label="W.Wt"
//                                 name="pur_WastageWeight"
//                                 value={formData.pur_WastageWeight}
//                                 onChange={handleChange}
//                                 readOnly
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Total Wt"
//                                 name="pur_TotalWeight_AW"
//                                 value={formData.pur_TotalWeight_AW}
//                                 onChange={handleChange}
//                                 readOnly
//                               />
//                             </Col>
//                             <Col xs={12} md={4}>
//                               <InputField
//                                 label="MC On"
//                                 name="pur_Making_Charges_On"
//                                 type="select"
//                                 value={formData.pur_Making_Charges_On}
//                                 onChange={handleChange}
//                                 options={[
//                                   { value: "MC / Gram", label: "MC / Gram" },
//                                   { value: "MC / Piece", label: "MC / Piece" },
//                                   { value: "MC %", label: "MC %" },
//                                 ]}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label={formData.MC_Per_Gram_Label}
//                                 name="pur_MC_Per_Gram"
//                                 value={formData.pur_MC_Per_Gram}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="MC"
//                                 name="pur_Making_Charges"
//                                 value={formData.pur_Making_Charges}
//                                 onChange={handleChange}
//                               />
//                             </Col>
//                             <Col xs={12} md={3}>
//                               <InputField
//                                 label="Rate"
//                                 type="number"
//                                 value={formData.pur_rate_cut}
//                                 onChange={(e) =>
//                                   handleChange("pur_rate_cut", e.target.value)
//                                 }
//                               />
//                             </Col>
//                           </Row>
//                         </Col>
//                       </div>
//                     </>
//                   )}

//                   {formData.Pricing === "By fixed" && (
//                     <>
//                       <Col xs={12} md={1}>
//                         <InputField
//                           label="Pcs"
//                           type="number"
//                           value={formData.pcs}
//                           onChange={(e) => handleChange("pcs", e.target.value)}
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Piece Cost"
//                           type="number"
//                           value={formData.pieace_cost}
//                           onChange={(e) =>
//                             handleChange("pieace_cost", e.target.value)
//                           }
//                         />
//                       </Col>
//                       <Col xs={12} md={1}>
//                         <InputField
//                           label="Tax %"
//                           value={formData.tax_percent}
//                           onChange={(e) =>
//                             handleChange("tax_percent", e.target.value)
//                           }
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="MRP"
//                           type="number"
//                           value={formData.mrp_price}
//                           onChange={(e) =>
//                             handleChange("mrp_price", e.target.value)
//                           }
//                         />
//                       </Col>
//                       <Col xs={12} md={2}>
//                         <InputField
//                           label="Total Pcs Cost"
//                           type="number"
//                           value={formData.total_pcs_cost}
//                           onChange={(e) =>
//                             handleChange("total_pcs_cost", e.target.value)
//                           }
//                         />
//                       </Col>
//                     </>
//                   )}
//                 </Row>
//               </div>

//               <div className="d-flex justify-content-between align-items-center">
//                 <label className="checkbox-label" htmlFor="tcs">
//                   <input
//                     type="checkbox"
//                     id="tcs"
//                     name="tcsApplicable"
//                     className="checkbox-input"
//                     checked={isGeneratePDF}
//                     onChange={(e) => setIsGeneratePDF(e.target.checked)}
//                   />
//                   Print QR Code
//                 </label>

//                 <div className="text-end">
//                   <Button
//                     variant="secondary"
//                     onClick={handleCloseTagModal}
//                     style={{ backgroundColor: "gray", marginRight: "10px" }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     variant="success"
//                     style={{
//                       backgroundColor: "#a36e29",
//                       borderColor: "#a36e29",
//                     }}
//                     onClick={handleSubmit}
//                   >
//                     Save
//                   </Button>
//                 </div>
//               </div>

//               <div
//                 className="container mt-2"
//                 style={{ overflowX: "auto", maxWidth: "100%" }}
//               >
//                 <button
//                   onClick={exportToExcel}
//                   style={{
//                     marginBottom: "10px",
//                     padding: "5px 5px",
//                     backgroundColor: "green",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <FaFileExcel style={{ marginRight: "5px" }} /> Export to Excel
//                 </button>

//                 <Table
//                   bordered
//                   style={{ whiteSpace: "nowrap", fontSize: "15px" }}
//                 >
//                   <thead style={{ fontSize: "14px", fontWeight: "bold" }}>
//                     <tr>
//                       <th>SI</th>
//                       <th>Barcode</th>
//                       <th>Category</th>
//                       <th>Sub Category</th>
//                       <th>Design Name</th>
//                       <th>Gross Wt</th>
//                       <th>Net Wt</th>
//                       <th>MC</th>
//                       <th>Rate</th>
//                       <th>Total Amt</th>
//                       <th>Image</th>
//                       <th>Barcode</th>
//                     </tr>
//                   </thead>
//                   <tbody style={{ fontSize: "14px" }}>
//                     {data.length > 0 ? (
//                       data.map((item, index) => (
//                         <tr key={index}>
//                           <td>{index + 1}</td>
//                           <td>{item.PCode_BarCode}</td>
//                           <td>{item.category}</td>
//                           <td>{item.sub_category}</td>
//                           <td>{item.design_master}</td>
//                           <td>{item.Gross_Weight}</td>
//                           <td>{item.TotalWeight_AW}</td>
//                           <td>{item.Making_Charges}</td>
//                           <td>{item.rate}</td>
//                           <td>{item.total_price}</td>
//                           <td>
//                             {item.image ? (
//                               <img
//                                 src={item.image}
//                                 alt="Product"
//                                 style={{
//                                   width: "50px",
//                                   height: "50px",
//                                   objectFit: "cover",
//                                   borderRadius: "5px",
//                                   cursor: "pointer",
//                                 }}
//                                 onClick={() => {
//                                   const newWindow = window.open();
//                                   newWindow.document.write(
//                                     `<img src="${item.image}" alt="Product" style="width: 100%; height: auto;" />`
//                                   );
//                                 }}
//                                 onError={(e) =>
//                                   (e.target.src = "/placeholder.png")
//                                 }
//                               />
//                             ) : (
//                               "No Image"
//                             )}
//                           </td>
//                           <td>
//                             <a
//                               href={`${baseURL}/invoices/${item.PCode_BarCode}.pdf`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               style={{ textDecoration: "none" }}
//                             >
//                               📝 View
//                             </a>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="13" className="text-center">
//                           No data available
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </Table>
//               </div>
//             </Form>
//           </div>
//         </div>
//       </div>

//       {/* Sub Category Modal */}
//       <Modal show={showModal} onHide={handleCloseModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Sub Category</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="categoryName">
//               <Form.Label>Category</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="category"
//                 value={newSubCategory.category || formData.category}
//                 onChange={handleModalChange}
//                 readOnly
//               />
//             </Form.Group>
//             <Form.Group controlId="subCategoryName">
//               <Form.Label>Sub Category Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="name"
//                 value={newSubCategory.name}
//                 onChange={handleModalChange}
//               />
//             </Form.Group>
//             <Row>
//               <Col>
//                 <Form.Group controlId="subCategoryPrefix">
//                   <Form.Label>Prefix</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="prefix"
//                     value={newSubCategory.prefix}
//                     onChange={handleModalChange}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group controlId="subCategoryPrintingPurity">
//                   <Form.Label>Printing Purity</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="printing_purity"
//                     value={newSubCategory.printing_purity}
//                     onChange={handleModalChange}
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row>
//               <Col>
//                 <Form.Group controlId="subCategorySellingPurity">
//                   <Form.Label>Selling Purity</Form.Label>
//                   <Form.Control
//                     type="number"
//                     name="selling_purity"
//                     value={newSubCategory.selling_purity}
//                     onChange={handleModalChange}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group controlId="subCategoryPurity">
//                   <Form.Label>Purchase Purity</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="purity"
//                     value={newSubCategory.purity}
//                     onChange={handleModalChange}
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleAddSubCategory}>
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Design Modal */}
//       <Modal show={showDesignModal} onHide={handleCloseDesignModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Product Design Name</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="designCategory">
//               <Form.Label>Category</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="category"
//                 value={newDesign.category || formData.category}
//                 onChange={handleDesignModalChange}
//                 readOnly
//               />
//             </Form.Group>
//             <Form.Group controlId="metalType">
//               <Form.Label>Metal Type</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="metal"
//                 value={newDesign.metal || formData.metal_type}
//                 onChange={handleDesignModalChange}
//                 readOnly
//               />
//             </Form.Group>
//             <Form.Group controlId="designName">
//               <Form.Label>Product Design Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="design_name"
//                 value={newDesign.design_name}
//                 onChange={handleDesignModalChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseDesignModal}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleAddDesign}>
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Stone Modals */}
//       <StoneDetailsModal
//         show={show}
//         handleClose={handleClose}
//         stoneDetails={stoneDetails}
//         setStoneDetails={setStoneDetails}
//         handleAddStone={handleAddStone}
//         stoneList={stoneList}
//         handleEditStone={handleEditStone}
//         handleDeleteStone={handleDeleteStone}
//         editingStoneIndex={editingStoneIndex}
//       />
//       <PurchaseStoneDetailsModal
//         showPurchase={showPurchase}
//         handleClosePurchase={handleClosePurchase}
//         purStoneDetails={purStoneDetails}
//         setPurStoneDetails={setPurStoneDetails}
//         handleAddTagPurStone={handleAddTagPurStone}
//         purchaseStoneList={purchaseStoneList}
//         handleTagPurEditStone={handleTagPurEditStone}
//         handleTagPurDeleteStone={handleTagPurDeleteStone}
//         editingPurchaseStoneIndex={editingPurchaseStoneIndex}
//       />

//       {/* View Modal */}
//       <Modal show={showViewModal} onHide={handleCloseViewModal} centered size="xl">
//         <Modal.Header closeButton>
//           <Modal.Title>View Product Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedRow ? (
//             <>
//               <Row>
//                 <Col md={3}>
//                   <p>
//                     <strong>Supplier:</strong> {selectedRow.account_name}
//                   </p>
//                 </Col>
//                 <Col md={3}>
//                   <p>
//                     <strong>Category:</strong> {selectedRow.category}
//                   </p>
//                 </Col>
//                 <Col md={3}>
//                   <p>
//                     <strong>Sub Category:</strong> {selectedRow.sub_category}
//                   </p>
//                 </Col>
//                 <Col md={3}>
//                   <p>
//                     <strong>Design Name:</strong> {selectedRow.design_master}
//                   </p>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col md={3}>
//                   <p>
//                     <strong>Barcode:</strong> {selectedRow.PCode_BarCode}
//                   </p>
//                 </Col>
//                 <Col md={3}>
//                   <p>
//                     <strong>Gross Wt:</strong> {selectedRow.Gross_Weight}
//                   </p>
//                 </Col>
//                 <Col md={3}>
//                   <p>
//                     <strong>Net Wt:</strong> {selectedRow.TotalWeight_AW}
//                   </p>
//                 </Col>
//                 <Col md={3}>
//                   <p>
//                     <strong>MC:</strong> {selectedRow.Making_Charges}
//                   </p>
//                 </Col>
//               </Row>
//             </>
//           ) : (
//             <p>No data available.</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseViewModal}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default SalesTagEntry;