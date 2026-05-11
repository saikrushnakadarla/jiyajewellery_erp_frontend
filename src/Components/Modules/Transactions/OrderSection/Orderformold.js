import React, { useState, useEffect } from 'react';
import { Container, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import CustomerDetails from './CustomerDetails';
import InvoiceDetails from './InvoiceDetails';
import ProductDetails from './ProductDetails';
import ProductTable from './ProductTable';
import PaymentDetails from './PaymentDetails';
import useProductHandlers from './hooks/useProductHandlers';
import useCalculations from './hooks/useCalculations';
import './../Sales/SalesForm.css';
import baseURL from './../../../../Url/NodeBaseURL';
import SalesFormSection from "./SalesForm3Section";
import { pdf } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFLayout from './TaxInvoiceA4';

const SalesForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPDFDownload, setShowPDFDownload] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [metal, setMetal] = useState("");
  const [selectedMobile, setSelectedMobile] = useState("");

  const [oldSalesData, setOldSalesData] = useState(
    JSON.parse(localStorage.getItem('oldSalesData')) || []
  );

  const [schemeSalesData, setSchemeSalesData] = useState(
    JSON.parse(localStorage.getItem('schemeSalesData')) || []
  );

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('oldSalesData', JSON.stringify(oldSalesData));
  }, [oldSalesData]);

  useEffect(() => {
    localStorage.setItem('schemeSalesData', JSON.stringify(schemeSalesData));
  }, [schemeSalesData]);


  const [orderDetails, setOrderDetails] = useState(
    JSON.parse(localStorage.getItem('orderDetails')) || []
  );
  const [paymentDetails, setPaymentDetails] = useState(
    JSON.parse(localStorage.getItem('paymentDetails')) || {
      cash_amount: 0,
      card_amt: 0,
      chq: "",
      chq_amt: 0,
      online: "",
      online_amt: 0,
    }
  );

  const {
    formData,
    setFormData,
    products,
    data,
    isQtyEditable,
    handleChange,
    handleBarcodeChange,
    handleProductChange,
    handleProductNameChange,
    handleMetalTypeChange,
    handleDesignNameChange,
    filteredDesignOptions,
    filteredPurityOptions,
    filteredMetalTypes,
    uniqueProducts,
    metaltypeOptions,
    purityOptions,
    subcategoryOptions,
    isBarcodeSelected,
  } = useProductHandlers();

  // Apply calculations
  useCalculations(formData, setFormData);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const result = await response.json();
        const filteredCustomers = result.filter(item => item.account_group === 'CUSTOMERS');
        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch last invoice number
  useEffect(() => {
    const fetchLastInvoiceNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastInvoiceNumber`);
        setFormData(prev => ({ ...prev, order_number: response.data.lastInvoiceNumber }));
      } catch (error) {
        console.error("Error fetching invoice number:", error);
      }
    };

    fetchLastInvoiceNumber();
  }, []);

  // Save data to localStorage whenever orderDetails or paymentDetails change
  useEffect(() => {
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
  }, [orderDetails]);

  useEffect(() => {
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
  }, [paymentDetails]);


  // Handle customer change
  const handleCustomerChange = (customerId) => {
    const customer = customers.find((cust) => String(cust.account_id) === String(customerId));

    if (customer) {
      setFormData((prevData) => ({
        ...prevData,
        customer_id: customerId, // Update selected customer ID
        account_name: customer.account_name || "", // Update customer name
        mobile: customer.mobile || "", // Update mobile
        email: customer.email || "",
        address1: customer.address1 || "",
        address2: customer.address2 || "",
        city: customer.city || "",
        pincode: customer.pincode || "",
        state: customer.state || "",
        state_code: customer.state_code || "",
        aadhar_card: customer.aadhar_card || "",
        gst_in: customer.gst_in || "",
        pan_card: customer.pan_card || "",
      }));
    } else {
      // Reset the form if no customer matches
      setFormData((prevData) => ({
        ...prevData,
        customer_id: "",
        account_name: "",
        mobile: "",
        email: "",
        address1: "",
        address2: "",
        city: "",
        pincode: "",
        state: "",
        state_code: "",
        aadhar_card: "",
        gst_in: "",
        pan_card: "",
      }));
    }
  };
  const [editIndex, setEditIndex] = useState(null);

  const handleImageUpload = (file) => {
    setFormData(prev => ({
      ...prev,
      product_image: file, // Store the uploaded image in formData
    }));
  };

  // Add product to repair details
 const handleAdd = () => {
  setOrderDetails((prevDetails) => {
    const updatedDetails = [
      ...prevDetails,
      { 
        ...formData, 
        product_image: formData.product_image ? URL.createObjectURL(formData.product_image) : "" 
      },
    ];
    console.log("Updated repair details:", updatedDetails);
    return updatedDetails;
  });

  resetProductFields();
  alert("Product added successfully");
};


  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(orderDetails[index]); // Populate form with selected item
  };

  const handleUpdate = () => {
    const updatedDetails = orderDetails.map((item, index) =>
      index === editIndex ? { ...formData } : item
    );
    setOrderDetails(updatedDetails);
    setEditIndex(null);
    resetProductFields();
  };

  const handleDelete = (indexToDelete) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setOrderDetails(orderDetails.filter((_, index) => index !== indexToDelete));
      alert("Product deleted successfully");
    }
  };

  // Handle product delete
const resetProductFields = () => {
    setFormData(prev => ({
      ...prev,
      code: "",
      product_id: "",
      metal: "",
      product_name: "",
      metal_type: "",
      design_name: "",
      purity: "",
      category: "",
      sub_category: "",
      gross_weight: "",
      stone_weight: "",
      weight_bw: "",
      stone_price: "",
      va_on: "Gross Weight",
      va_percent: "",
      wastage_weight: "",
      total_weight_av: "",
      mc_on: "MC %",
      mc_per_gram: "",
      making_charges: "",
      rate: "",
      rate_amt: "",
      tax_percent: "",
      tax_amt: "",
      total_price: "",
      qty: "",
    }));
  };

  // Calculate totalPrice (sum of total_price from all orderDetails)
  const totalPrice = orderDetails.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);

  const [oldTableData, setOldTableData] = useState(() => {
    const savedData = localStorage.getItem('oldTableData');
    return savedData ? JSON.parse(savedData) : [];
  });

  const [schemeTableData, setSchemeTableData] = useState(() => {
    const savedData = localStorage.getItem('schemeTableData');
    return savedData ? JSON.parse(savedData) : [];
  });

  const resetForm = () => {
    setFormData({
      customer_id: "",
      mobile: "",
      account_name: "",
      email: "",
      address1: "",
      address2: "",
      city: "",
      pincode: "",
      state: "",
      state_code: "",
      aadhar_card: "",
      gst_in: "",
      pan_card: "",
      date: "",
      order_number: "",
    });
    setPaymentDetails({
      cash_amount: 0,
      card_amt: 0,
      chq: "",
      chq_amt: 0,
      online: "",
      online_amt: 0,
    });
  };

  const handleBack = () => {
    navigate("/salestable");
  };

  const handleAddCustomer = () => {
    navigate("/customermaster", { state: { from: "/sales" } });
  };

  const taxableAmount = orderDetails.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    const discountAmt = parseFloat(item.disscount) || 0;
    return sum + stonePrice + makingCharges + rateAmt-discountAmt;
  }, 0);
  console.log("Total Price=", taxableAmount)

  const taxAmount = orderDetails.reduce((sum, item) => sum + parseFloat(item.tax_amt || 0), 0);
  const netAmount = taxableAmount + taxAmount;
  console.log("Net Amount=", netAmount)

  const totalAmount = orderDetails.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    return sum + stonePrice + makingCharges + rateAmt;
  }, 0);
  console.log("Total Price=", totalAmount)

  const discountAmt = orderDetails.reduce((sum, item) => {
    const discountAmt = parseFloat(item.disscount) || 0;
    return sum + discountAmt;
  }, 0);
  console.log("Total Price=", discountAmt)
  const oldItemsAmount = location.state?.old_exchange_amt
    ? parseFloat(location.state.old_exchange_amt)
    : oldSalesData.reduce(
      (sum, item) => sum + parseFloat(item.total_amount || 0),
      0
    );

  const schemeAmount = location.state?.scheme_amt
    ? parseFloat(location.state.scheme_amt)
    : schemeSalesData.reduce(
      (sum, item) => sum + parseFloat(item.paid_amount || 0),
      0
    );

  // Calculate Net Payable Amount
  const netPayableAmount = netAmount - (schemeAmount + oldItemsAmount);


  const clearData = () => {
    setOldSalesData([]);
    setSchemeSalesData([]);
    setOrderDetails([]);
    setPaymentDetails({
      cash_amount: 0,
      card_amt: 0,
      chq: "",
      chq_amt: 0,
      online: "",
      online_amt: 0,
    });
    setOldTableData([]); // Clear the oldTableData state
    setSchemeTableData([])
    localStorage.removeItem('oldSalesData');
    localStorage.removeItem('schemeSalesData');
    localStorage.removeItem('orderDetails');
    localStorage.removeItem('paymentDetails');
    localStorage.removeItem('oldTableData'); // Explicitly remove oldTableData from local storage
    localStorage.removeItem('schemeTableData'); // Explicitly remove oldTableData from local storage

    console.log("Data cleared successfully");
  };

  const handleSave = async () => {
    console.log("Preparing to save data...");
    const formData = new FormData();

    // First, append all the repair details as JSON string
    const repairDetailsWithPayment = orderDetails.map(item => ({
      ...item,
      cash_amount: paymentDetails.cash_amount || 0,
      card_amount: paymentDetails.card || 0,
      card_amt: paymentDetails.card_amt || 0,
      chq: paymentDetails.chq || "",
      chq_amt: paymentDetails.chq_amt || 0,
      online: paymentDetails.online || "",
      online_amt: paymentDetails.online_amt || 0,
    }));

    // Append the JSON data as strings
    formData.append('orderDetails', JSON.stringify(repairDetailsWithPayment));
    formData.append('oldItems', JSON.stringify(oldSalesData));
    formData.append('memberSchemes', JSON.stringify(schemeSalesData));

    // Append each product image
     // Append images correctly with unique keys for each product image
  orderDetails.forEach((item, index) => {
    if (item.product_image instanceof File) {
      formData.append(`product_image_${index}`, item.product_image);
    }
  });

    try {
      console.log("Sending data to API...");
      const response = await axios.post(`${baseURL}/save-order-details`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log("Data saved successfully.");
      alert("Data saved successfully");

      // Generate PDF Blob
      console.log("Generating PDF document...");
      const pdfDoc = (
        <PDFLayout
          formData={formData}
          orderDetails={orderDetails}
          cash_amount={paymentDetails.cash_amount || 0}
          card_amt={paymentDetails.card_amt || 0}
          chq_amt={paymentDetails.chq_amt || 0}
          online_amt={paymentDetails.online_amt || 0}
          taxAmount={taxAmount}
          oldItemsAmount={oldItemsAmount}
          schemeAmount={schemeAmount}
          netPayableAmount={netPayableAmount}
        />
      );

      const pdfBlob = await pdf(pdfDoc).toBlob();
      console.log("PDF blob created:", pdfBlob);

      // Create a download link and trigger it
      console.log("Triggering download for PDF...");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `invoice-${formData.order_number}.pdf`;
      link.click();

      // Clean up
      console.log("Cleaning up after download...");
      URL.revokeObjectURL(link.href);

      // Clear all data after saving
      console.log("Clearing data...");
      clearData();

      // Reset the form and reload the page if necessary
      console.log("Resetting form and reloading page...");
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data");
    }
  };


  return (
    <div className="main-container">
      <Container className="sales-form-container">
        <Form>
          <h3 style={{ marginTop: '-45px', marginBottom: '10px', textAlign: 'left', color: '#a36e29' }}>
            Orders
          </h3>
          <div className="sales-form">
            <div className="sales-form-left">
              <CustomerDetails
                formData={formData}
                handleCustomerChange={handleCustomerChange}
                handleAddCustomer={handleAddCustomer}
                customers={customers}
                setSelectedMobile={setSelectedMobile}
              />
            </div>
            <div className="sales-form-right">
              <InvoiceDetails
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          </div>

          <div className="sales-form-section">
            <ProductDetails
              formData={formData}
              handleChange={handleChange}
              handleBarcodeChange={handleBarcodeChange}
              handleProductChange={handleProductChange}
              handleProductNameChange={handleProductNameChange}
              handleMetalTypeChange={handleMetalTypeChange}
              handleDesignNameChange={handleDesignNameChange}
              handleAdd={handleAdd}
              products={products}
              data={data}
              uniqueProducts={uniqueProducts}
              subcategoryOptions={subcategoryOptions}
              purityOptions={purityOptions}
              metaltypeOptions={metaltypeOptions}
              filteredMetalTypes={filteredMetalTypes}
              filteredPurityOptions={filteredPurityOptions}
              filteredDesignOptions={filteredDesignOptions}
              isBarcodeSelected={isBarcodeSelected}
              isQtyEditable={isQtyEditable}
              handleUpdate={handleUpdate}
              isEditing={editIndex !== null}
              handleImageUpload={handleImageUpload}
            />
          </div>

          <div className="sales-form-section">
            <ProductTable orderDetails={orderDetails} onEdit={handleEdit} onDelete={handleDelete} />
          </div>

          <div className="sales-form2">
            <div className="sales-form-third">
              <SalesFormSection metal={metal}
                setMetal={setMetal}
                setOldSalesData={setOldSalesData}
                oldTableData={oldTableData}
                setOldTableData={setOldTableData}
                setSchemeSalesData={setSchemeSalesData}
                schemeTableData={schemeTableData}
                setSchemeTableData={setSchemeTableData}
              />
            </div>

            <div className="sales-form-fourth">
              <PaymentDetails
                paymentDetails={paymentDetails}
                setPaymentDetails={setPaymentDetails}
                handleSave={handleSave}
                handleBack={handleBack}
                totalPrice={totalPrice}
                orderDetails={orderDetails}
                taxableAmount={taxableAmount}
                discountAmt={discountAmt}
                totalAmount={totalAmount}
                taxAmount={taxAmount}
                netAmount={netAmount}
                oldItemsAmount={oldItemsAmount}
                schemeAmount={schemeAmount}
                netPayableAmount={netPayableAmount}
                oldSalesData={oldSalesData} schemeSalesData={schemeSalesData}
              />
            </div>
          </div>
          {showPDFDownload && (
            <PDFDownloadLink
              document={
                <PDFLayout
                  formData={formData}
                  orderDetails={orderDetails}
                  paymentDetails={paymentDetails}
                />
              }
              fileName={`invoice-${formData.order_number}.pdf`}
            >
              {({ blob, url, loading, error }) =>
                loading ? "Generating PDF..." : "Download Invoice PDF"
              }
            </PDFDownloadLink>
          )}
        </Form>
      </Container>
    </div>
  );
};

export default SalesForm;
