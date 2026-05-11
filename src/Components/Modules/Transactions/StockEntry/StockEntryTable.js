import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import DataTable from "../../../Pages/InputField/DataTable"; 
import DataTable from "./DataTable";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Button, Row, Col } from "react-bootstrap";
import InputField from "../../../Modules/Masters/ItemMaster/Inputfield"; // Assuming you have this reusable input field component
import "./StockEntryTable.css";
import StoneDetailsModal from "./StoneDetailsModal";
import baseURL from "../../../../Url/NodeBaseURL";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

const StockEntryTable = (selectedProduct) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to store fetched table data
  const [isEditMode, setIsEditMode] = useState(false); // State to toggle form visibility
  const [formData, setFormData] = useState({}); // State to store the form data
  const [subCategories, setSubCategories] = useState([]);
  const handleCloseModal = () => setShowModal(false);
  const [designOptions, setdesignOptions] = useState([]);
  const [purityOptions, setPurityOptions] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [rates, setRates] = useState({
    rate_24crt: "",
    rate_22crt: "",
    rate_18crt: "",
    rate_16crt: "",
  });

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

        // Update form data based on metal type
        const metalType = formData.metal_type?.toLowerCase();

        setFormData((prev) => ({
          ...prev,
          rate_24k:
            metalType === "silver" ? newRates.silver_rate : newRates.rate_24crt,
        }));
      } catch (error) {
        console.error("Error fetching current rates:", error);
      }
    };

    fetchCurrentRates();
  }, [formData.metal_type]);

  useEffect(() => {
    if (!formData.Purity) {
      setFormData((prev) => ({
        ...prev,
        rate: formData.rate,
      }));
      return;
    }

    const purityValue = parseFloat(formData.Purity);
    const baseRate = parseFloat(formData.rate_24k); // 24K base rate

    if (!isNaN(purityValue) && !isNaN(baseRate)) {
      const calculatedRate = ((purityValue / 100) * baseRate).toFixed(2);

      setFormData((prev) => ({
        ...prev,
        rate: calculatedRate,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        rate: formData.rate,
      }));
    }
  }, [formData.Purity, formData.rate_24k]);

  useEffect(() => {
    fetch(`${baseURL}/get/opening-tags-entry`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch stock entries");
        }
        return response.json();
      })
      .then((data) => {
        const availableData = data.result.filter(
          (item) => item.Status === "Available",
        );
        setData(availableData);
      })
      .catch((error) => {
        console.error("Error fetching stock entries:", error);
      });
  }, []);

  const handleView = (row) => {
    setSelectedRow(row);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRow(null);
  };

  const handleEdit = (rowData) => {
    setFormData(rowData); // Populate the form with the row data
    setIsEditMode(true); // Show the form
  };

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
  }, [
    formData.Wastage_On,
    formData.Wastage_Percentage,
    formData.Gross_Weight,
    formData.Weight_BW,
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

    /* ======================
       SELLING MAKING CHARGES
    ====================== */

    if (formData.Making_Charges_On === "MC / Gram") {
      const calculatedMakingCharges = totalWeight * mcPerGram;

      setFormData((prev) => ({
        ...prev,
        Making_Charges: calculatedMakingCharges.toFixed(2),
      }));
    } else if (formData.Making_Charges_On === "MC / Piece") {
      const calculatedMcPerGram = totalWeight ? makingCharges / totalWeight : 0;

      setFormData((prev) => ({
        ...prev,
        MC_Per_Gram: calculatedMcPerGram.toFixed(2),
      }));
    } else if (formData.Making_Charges_On === "MC %") {
      // rateAmount = rate × total weight
      const rateAmount = rate * totalWeight;

      const calculatedMakingCharges = (mcPerGram * rateAmount) / 100;

      setFormData((prev) => ({
        ...prev,
        Making_Charges: calculatedMakingCharges.toFixed(2),
      }));
    }

    /* ======================
       PURCHASE MAKING CHARGES
    ====================== */

    if (formData.pur_Making_Charges_On === "MC / Gram") {
      const calculatedMakingCharges = purTotalWeight * purMcPerGram;

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

      const calculatedMakingCharges = (purMcPerGram * rateAmount) / 100;

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

    // Step 1: Base amount
    const baseAmount = rate * weight + stonesPrice + makingCharges;

    // Step 2: Extract tax percentage from string like "03% GST"
    const taxPercent = parseFloat(formData.tax) || 0;

    // Step 3: Calculate tax amount
    const taxAmt = (baseAmount * taxPercent) / 100;

    // Step 4: Final total
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
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔹 Exclude rate_24k before sending
    const payload = { ...formData };
    delete payload.rate_24k; // Remove rate_24k

    fetch(`${baseURL}/update/opening-tags-entry/${formData.opentag_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // send payload without rate_24k
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update the record");
        }
        return response.json();
      })
      .then(() => {
        alert("Stock updated successfully");

        // 🔹 Generate & Download PDF AFTER update
        generateAndDownloadPDF(formData);

        setIsEditMode(false);

        // 🔹 Refresh table data
        setData((prevData) =>
          prevData.map((item) =>
            item.opentag_id === formData.opentag_id ? formData : item,
          ),
        );
      })
      .catch((error) => {
        console.error("Error updating record:", error);
      });
  };

  const generateAndDownloadPDF = async (data) => {
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
        { margin: 0 },
      );

      /* ---------- LEFT PRODUCT DETAILS ---------- */
      let startX = 2;
      let startY = 4;
      let lineGap = 3.2;
      let currentY = startY;

      doc.setFont("helvetica", "bold");

      // TAG
      doc.setFontSize(8.0);
      doc.text(`TAG: ${data.PCode_BarCode}`, startX, currentY);
      currentY += lineGap;

      if (isByWeight) {
        // TOPS
        doc.text(`${data.sub_category}`, startX, currentY);
        // doc.text(`${data.sub_category} ${data.printing_purity}`, startX, currentY);
        currentY += lineGap;

        // 🔽 NT WT (slightly smaller)
        doc.setFontSize(8.0);
        doc.text("NT WT:", startX, currentY);
        doc.text(`${data.TotalWeight_AW}`, startX + 12, currentY); // move value right
        currentY += lineGap;
      }

      // 🔥 MRP (bigger)
      doc.setFontSize(8.0);
      doc.text("MRP:", startX, currentY);
      doc.text(`${data.total_price}`, startX + 11, currentY); // move value right

      /* ---------- QR CODE (RIGHT TOP) ---------- */
      const qrX = 35;
      const qrY = 2;
      const qrSize = 7;

      // ➡️ Move everything to the right by this amount
      const moveRight = 6; // adjust: 4, 6, 8 etc.

      // QR Image
      doc.addImage(qrImageData, "PNG", qrX + moveRight, qrY, qrSize, qrSize);

      /* ---------- TEXT BELOW QR ---------- */
      doc.setFont("helvetica", "bold");

      // O/N text (keeps alignment with QR)
      doc.setFontSize(4.2);
      doc.text("O/N:", qrX + moveRight, qrY + qrSize + 2);

      // 🔼 Shop name – move left
      doc.setFontSize(6.0);
      doc.text(
        "NEW FRIENDS JEWELLERS",
        qrX - 2, // ⬅️ move left (adjust 2–6 if needed)
        qrY + qrSize + 4.5,
      );

      /* ---------- SAVE ---------- */
      const pdfBlob = doc.output("blob");
      await handleSavePDFToServer(pdfBlob, data.PCode_BarCode);
    } catch (error) {
      console.error("PDF Error:", error);
    }
  };

  const handleSavePDFToServer = async (pdfBlob, pcode) => {
    const formData = new FormData();
    formData.append("invoice", pdfBlob, `${pcode}.pdf`);

    try {
      const response = await fetch(`${baseURL}/upload-invoice`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload invoice");
      }

      console.log(`Tag PDF ${pcode} saved on server`);
    } catch (error) {
      console.error("Error uploading tag PDF:", error);
    }
  };

  const totalGrossWt = React.useMemo(() => {
  return data.reduce(
    (sum, row) => sum + Number(row.Gross_Weight || 0),
    0
  );
}, [data]);

const totalNetWt = React.useMemo(() => {
  return data.reduce(
    (sum, row) => sum + Number(row.TotalWeight_AW || 0),
    0
  );
}, [data]);


  const columns = React.useMemo(
    () => [
      {
        Header: "S No.",
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }) => {
          if (!value) return "";
          const date = new Date(value);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      { Header: "Category", accessor: "category" },
      { Header: "Sub Category", accessor: "sub_category" },
      { Header: "Product Design Name", accessor: "design_master" },
      { Header: "Barcode", accessor: "PCode_BarCode" },
      { Header: "Gross Wt", accessor: "Gross_Weight" },
      // { Header: 'Stones Wt', accessor: 'Stones_Weight' },
      // { Header: 'Wasatage%', accessor: 'Wastage_Percentage' },
      { Header: "Net Wt", accessor: "TotalWeight_AW" },
      { Header: "MC", accessor: "Making_Charges" },
      { Header: "Rate", accessor: "rate" },
      { Header: "Total Amt", accessor: "total_price" },
      { Header: "Status", accessor: "Status" },
      {
        Header: "Barcode",
        Cell: ({ row }) => (
          <a
            href={`${baseURL}/invoices/${row.original.PCode_BarCode}.pdf`} // Fetch from backend
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            📝 View
          </a>
        ),
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <FaEye
              style={{ cursor: "pointer", color: "green" }}
              onClick={() => handleView(row.original)}
            />
            <FaEdit
              style={{
                cursor: "pointer",
                marginLeft: "10px",
                color: "blue",
              }}
              onClick={() => handleEdit(row.original)}
            />
            <FaTrash
              style={{
                cursor: "pointer",
                marginLeft: "10px",
                color: "red",
              }}
              onClick={() => handleDelete(row.original.opentag_id)}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const handleDelete = async (id) => {
    console.log("Deleting ID:", id); // Confirming ID before sending request
    const url = `${baseURL}/delete/opening-tags-entry/${id}`;
    console.log("DELETE Request URL:", url);

    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await axios.delete(url);
        alert(response.data.message);
        window.location.reload();
      } catch (error) {
        console.error(
          "Error deleting record:",
          error.response?.data || error.message,
        );
        alert("Failed to delete record.");
      }
    }
  };

  const [productOptions, setProductOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  // Fetch product options for P ID dropdown (product_id)
  useEffect(() => {
    axios
      .get(`${baseURL}/get/products`)
      .then((response) => {
        const options = response.data.map((product) => ({
          value: product.product_id,
          label: `${product.product_id}`,
        }));
        setProductOptions(options);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const isGoldCategory =
    formData.category && formData.category.toLowerCase().includes("gold");
  const isSilverCategory =
    formData.category && formData.category.toLowerCase().includes("silver");

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
            field === "Stones_Weight" ? value : prevData.Stones_Weight,
          ) || 0;
        const stonePricePerCarat =
          parseFloat(
            field === "stone_price_per_carat"
              ? value
              : prevData.stone_price_per_carat,
          ) || 0;
        if (stoneWeight > 0 && stonePricePerCarat > 0) {
          const calculatedStonePrice = (stoneWeight / 0.2) * stonePricePerCarat;
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
        (category) => category.subcategory_id === parseInt(value),
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

  const handleUpdateStoneDetails = (totalWeight, totalPrice) => {
    setFormData({
      ...formData,
      Stones_Weight: totalWeight.toFixed(2),
      Stones_Price: totalPrice.toFixed(2),
    });
  };
  const [isFormVisible, setFormVisible] = useState(true);
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchDesignMaster = async () => {
      try {
        const response = await axios.get(`${baseURL}/designmaster`);
        const designMasters = response.data.map((item) => {
          console.log("Design ID:", item.design_id); // Log design_id
          return {
            value: item.design_name, // Assuming the column name is "design_name"
            label: item.design_name,
            id: item.design_id, // Assuming the column name is "design_id"
          };
        });
        setdesignOptions(designMasters);
      } catch (error) {
        console.error("Error fetching design masters:", error);
      }
    };

    fetchDesignMaster();
  }, []);

  useEffect(() => {
    const fetchPurity = async () => {
      try {
        const response = await axios.get(`${baseURL}/purity`);
        const filteredPurity = response.data.filter(
          (item) =>
            item.metal.toLowerCase() === formData.metal_type.toLowerCase(),
        );
        setPurityOptions(filteredPurity);

        console.log("Purity=", filteredPurity);

        // Set the default option based on metal type
        if (formData.metal_type.toLowerCase() === "gold") {
          const defaultOption = filteredPurity.find((option) =>
            ["22k", "22 kt", "22"].some((match) =>
              option.name.toLowerCase().includes(match),
            ),
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
              option.name.toLowerCase().includes(match),
            ),
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

  const handleBack = () => {
    console.log("Navigating to /stockEntryTable");
    navigate("/stockEntryTable");
  };
  const handleCancel = () => {
    setFormVisible(false); // Hide the form when the cancel button is clicked
    // navigate("/stockEntryTable");
    window.location.reload();
  };

  return (
    <div className="main-container">
      {!isEditMode ? (
        <div className="stockentry-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>Stock</h3>
              {/* <Button
                className="create_but"
                onClick={() => navigate('/stockEntry')}
                style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
              >
                + Create
              </Button> */}
            </Col>
          </Row>
          {/* DataTable component */}
          <DataTable columns={columns} data={[...data].reverse()} />
        </div>
      ) : (
        <div className="container mt-4">
          {isFormVisible && (
            <form
              className="p-4 border rounded form-container-stockentry"
              onSubmit={handleSubmit}
            >
              <h4>Stock Entry</h4>

              {/* Section 1 */}
              <div className="row g-3">
                <div className="col-md-2">
                  <InputField
                    label="Category:"
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleChange(e)}
                    readOnly
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Sub Category:"
                    name="sub_category"
                    value={formData.sub_category || ""}
                    onChange={(e) => handleChange(e)}
                    readOnly
                  />
                </div>
                {/* <div className="col-md-2">
                <InputField
                  label="Product Name:"
                  name="product_Name"
                  value={formData.product_Name}
                  onChange={handleChange}  
                />
              </div> */}
                <div className="col-md-2">
                  <InputField
                    label="Design Name"
                    name="design_master"
                    type="select"
                    value={formData.design_master || ""}
                    onChange={handleChange}
                    options={designOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                </div>

                {/* <div className="col-md-2">
                  <InputField
                    label="Pricing:"
                    name="Pricing"
                    type="select"
                    value={formData.Pricing || ''}
                    onChange={handleChange}
                    options={[
                      { value: "By Weight", label: "By Weight" },
                      { value: "By fixed", label: "By fixed" },
                    ]}
                  />
                </div> */}
                <div className="col-md-2">
                  <InputField
                    label="Pricing:"
                    name="Pricing"
                    value={formData.Pricing || ""}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="PCode/BarCode"
                    name="PCode_BarCode"
                    type="text"
                    value={formData.PCode_BarCode}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                {/* <div className="col-md-2">
                  <InputField
                    label="Purity"
                    name="Purity"
                    type="select"
                    value={formData.Purity || ''}
                    onChange={handleChange}
                    options={purityOptions.map((option) => ({
                      value: `${option.name} | ${option.purity}`, // Combined name and purity
                      label: `${option.name} | ${option.purity}`,
                    }))}
                  />
                </div> */}
                <div className="col-md-2">
                  <InputField
                    label="Printing Purity"
                    name="printing_purity"
                    value={formData.printing_purity || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Selling Purity"
                    name="Purity"
                    value={formData.Purity || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Gross Wt"
                    name="Gross_Weight"
                    value={formData.Gross_Weight || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Stones Wt"
                    name="Stones_Weight"
                    value={formData.Stones_Weight || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Stones Price:"
                    name="Stones_Price"
                    value={formData.Stones_Price || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Weight BW:"
                    name="Weight_BW"
                    value={formData.Weight_BW || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Wastage On"
                    name="Wastage_On"
                    type="select"
                    value={formData.Wastage_On || ""}
                    onChange={handleChange}
                    options={[
                      { value: "Gross Weight", label: "Gross Weight" },
                      { value: "Weight BW", label: "Weight BW" },
                    ]}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Wastage %"
                    name="Wastage_Percentage"
                    value={formData.Wastage_Percentage || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="W.Wt"
                    name="WastageWeight"
                    value={formData.WastageWeight || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Total Weight"
                    name="TotalWeight_AW"
                    value={formData.TotalWeight_AW || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Rate"
                    name="rate"
                    value={formData.rate || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
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
                </div>
                <div className="col-md-2">
                  <InputField
                    label={formData.MC_Per_Gram_Label}
                    name="MC_Per_Gram"
                    value={formData.MC_Per_Gram}
                    onChange={handleChange}
                  />
                </div>
                {/* {(formData.Making_Charges_On === "MC / Gram" || formData.Making_Charges_On === "MC / Piece") && ( */}
                <div className="col-md-2">
                  <InputField
                    label="MC"
                    name="Making_Charges"
                    value={formData.Making_Charges}
                    onChange={handleChange}
                  />
                </div>
                {/* )} */}
                <div className="col-md-2">
                  <InputField
                    label="Tax%"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Total Amt"
                    name="total_price"
                    value={formData.total_price}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="HUID No"
                    name="HUID_No"
                    value={formData.HUID_No || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Stock Point"
                    name="Stock_Point"
                    type="select"
                    value={formData.Stock_Point || ""}
                    onChange={handleChange}
                    options={[
                      { value: "Display Floor1", label: "Display Floor1" },
                      { value: "Display Floor2", label: "Display Floor2" },
                      { value: "Strong room", label: "Strong room" },
                    ]}
                  />
                </div>
              </div>

              <Button
                type="button"
                className="cus-back-btn"
                onClick={handleCancel}
                style={{ backgroundColor: "gray", marginRight: "10px" }}
              >
                Cancel
              </Button>
              <Button
                className="create_but"
                type=""
                variant="success"
                style={{ backgroundColor: "#a36e29", borderColor: "#a36e29" }}
              >
                Update
              </Button>
            </form>
          )}
        </div>
      )}
      <StoneDetailsModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleUpdateStoneDetails={handleUpdateStoneDetails}
      />
      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>View Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px" }}>
          {selectedRow ? (
            <>
              {/* <div className='small'> */}
              <Row>
                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                  <p>
                    <strong>Supplier:</strong> {selectedRow.account_name}
                  </p>
                </Col>
                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                  <p>
                    <strong>Category:</strong> {selectedRow.category}
                  </p>
                </Col>
                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                  <p>
                    <strong>Sub Category:</strong> {selectedRow.sub_category}
                  </p>
                </Col>
                <Col md={3} style={{ whiteSpace: "nowrap" }}>
                  <p>
                    <strong>Design Name:</strong> {selectedRow.design_master}
                  </p>
                </Col>
              </Row>

              {/* Second Row: Pricing, Barcode, HUID No, Stock Point */}
              <Row>
                <Col md={3}>
                  <p>
                    <strong>Pricing:</strong> {selectedRow.Pricing}
                  </p>
                </Col>
                <Col md={3}>
                  <p>
                    <strong>Barcode:</strong> {selectedRow.PCode_BarCode}
                  </p>
                </Col>
                <Col md={3}>
                  <p>
                    <strong>HUID No:</strong> {selectedRow.HUID_No}
                  </p>
                </Col>
                <Col md={3}>
                  <p>
                    <strong>Stock Point:</strong> {selectedRow.Stock_Point}
                  </p>
                </Col>
              </Row>

              <Row>
                <Col md={3}>
                  <p>
                    <strong>Gross Weight:</strong> {selectedRow.Gross_Weight}
                  </p>
                  <p>
                    <strong>Stone Weight:</strong> {selectedRow.Stones_Weight}
                  </p>
                  <p>
                    <strong>Wastage %:</strong> {selectedRow.Wastage_Percentage}
                  </p>
                  <p>
                    <strong>Total Weight:</strong> {selectedRow.TotalWeight_AW}
                  </p>
                  <p>
                    <strong>Making Charges:</strong>{" "}
                    {selectedRow.Making_Charges}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedRow.Status}
                  </p>
                  <p>
                    <strong>Purity:</strong> {selectedRow.Purity}
                  </p>
                  <p>
                    <strong>Metal Type:</strong> {selectedRow.metal_type}
                  </p>
                </Col>

                <Col md={3}>
                  {/* <p><strong>Prefix:</strong> {selectedRow.Prefix}</p> */}
                  <p>
                    <strong>Wastage On:</strong> {selectedRow.Wastage_On}
                  </p>
                  <p>
                    <strong>Wastage Weight:</strong> {selectedRow.WastageWeight}
                  </p>
                  <p>
                    <strong>MC Per Gram:</strong> {selectedRow.MC_Per_Gram}
                  </p>
                  <p>
                    <strong>Making Charges On:</strong>{" "}
                    {selectedRow.Making_Charges_On}
                  </p>
                  {/* <p><strong>Source:</strong> {selectedRow.Source}</p> */}
                  {/* <p><strong>QR Status:</strong> {selectedRow.qr_status}</p> */}
                  {/* <p><strong>Added At:</strong> {new Date(selectedRow.added_at).toLocaleString()}</p> */}
                  <p>
                    <strong>Deduct Stone Wt:</strong> {selectedRow.deduct_st_Wt}
                  </p>
                  <p>
                    <strong>Size:</strong> {selectedRow.size}
                  </p>
                  <p>
                    <strong>Tag ID:</strong> {selectedRow.tag_id}
                  </p>
                  <p>
                    <strong>Tag Weight:</strong> {selectedRow.tag_weight}
                  </p>
                </Col>

                <Col md={3}>
                  <p>
                    <strong>Pur. Gross Weight:</strong>{" "}
                    {selectedRow.pur_Gross_Weight}
                  </p>
                  <p>
                    <strong>Pur. Stone Weight:</strong>{" "}
                    {selectedRow.pur_Stones_Weight}
                  </p>
                  <p>
                    <strong>Pur. Deduct Stone Wt:</strong>{" "}
                    {selectedRow.pur_deduct_st_Wt}
                  </p>
                  <p>
                    <strong>Pur. Stones Price:</strong>{" "}
                    {selectedRow.pur_Stones_Price}
                  </p>
                  <p>
                    <strong>Pur. Weight BW:</strong> {selectedRow.pur_Weight_BW}
                  </p>
                  <p>
                    <strong>Pur. Wastage On:</strong>{" "}
                    {selectedRow.pur_Wastage_On}
                  </p>
                  <p>
                    <strong>Pur. Wastage %:</strong>{" "}
                    {selectedRow.pur_Wastage_Percentage}
                  </p>
                  <p>
                    <strong>Pur. Wastage Weight:</strong>{" "}
                    {selectedRow.pur_WastageWeight}
                  </p>
                  <p>
                    <strong>Pur. Total Weight:</strong>{" "}
                    {selectedRow.pur_TotalWeight_AW}
                  </p>
                </Col>

                <Col md={3}>
                  <p>
                    <strong>Pur. MC / Gram:</strong>{" "}
                    {selectedRow.pur_MC_Per_Gram}
                  </p>
                  <p>
                    <strong>Pur. MC Charges:</strong>{" "}
                    {selectedRow.pur_Making_Charges}
                  </p>
                  {/* <p><strong>Invoice:</strong> {selectedRow.invoice}</p> */}
                  <p>
                    <strong>Stone Price / Carat:</strong>{" "}
                    {selectedRow.stone_price_per_carat}
                  </p>
                  {/* <p><strong>Product ID:</strong> {selectedRow.product_id}</p>
              <p><strong>Subcategory ID:</strong> {selectedRow.subcategory_id}</p> */}
                  <p>
                    <strong>Pcs:</strong> {selectedRow.pcs}
                  </p>
                  <p>
                    <strong>Piece Cost:</strong> {selectedRow.pieace_cost}
                  </p>
                  <p>
                    <strong>Selling Price:</strong> {selectedRow.selling_price}
                  </p>
                  <p>
                    <strong>Tax %:</strong> {selectedRow.tax_percent}
                  </p>
                  <p>
                    <strong>MRP Price:</strong> {selectedRow.mrp_price}
                  </p>
                  <p>
                    <strong>Total Pcs Cost:</strong>{" "}
                    {selectedRow.total_pcs_cost}
                  </p>
                </Col>
              </Row>
              {/* </div> */}
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

export default StockEntryTable;
