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

  useCalculations(formData, setFormData);

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

  useEffect(() => {
    const fetchLastInvoiceNumber = async () => {
      try {
        const response = await axios.get(`${baseURL}/lastOrderNumber`);
        setFormData(prev => ({ ...prev, order_number: response.data.lastOrderNumber }));
      } catch (error) {
        console.error("Error fetching order number:", error);
      }
    };

    fetchLastInvoiceNumber();
  }, []);

  useEffect(() => {
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
  }, [orderDetails]);

  useEffect(() => {
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
  }, [paymentDetails]);

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

  const handleAdd = () => {
    setOrderDetails((prevDetails) => {
      const updatedDetails = [
        ...prevDetails,
        {
          ...formData,
          product_image: formData.product_image ? URL.createObjectURL(formData.product_image) : ""
        },
      ];
      return updatedDetails;
    });
    resetProductFields();
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...orderDetails[index], // Merge repair details into formData
    }));
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
    navigate("/orderstable");
  };

  const handleAddCustomer = () => {
    navigate("/customermaster", { state: { from: "/sales" } });
  };

  const taxableAmount = orderDetails.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    const discountAmt = parseFloat(item.disscount) || 0;
    return sum + stonePrice + makingCharges + rateAmt - discountAmt;
  }, 0);

  const taxAmount = orderDetails.reduce((sum, item) => sum + parseFloat(item.tax_amt || 0), 0);
  const netAmount = taxableAmount + taxAmount;

  const totalAmount = orderDetails.reduce((sum, item) => {
    const stonePrice = parseFloat(item.stone_price) || 0;
    const makingCharges = parseFloat(item.making_charges) || 0;
    const rateAmt = parseFloat(item.rate_amt) || 0;
    return sum + stonePrice + makingCharges + rateAmt;
  }, 0);

  const discountAmt = orderDetails.reduce((sum, item) => {
    const discountAmt = parseFloat(item.disscount) || 0;
    return sum + discountAmt;
  }, 0);

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
    setOldTableData([]);
    setSchemeTableData([]);
    localStorage.removeItem('oldSalesData');
    localStorage.removeItem('schemeSalesData');
    localStorage.removeItem('orderDetails');
    localStorage.removeItem('paymentDetails');
    localStorage.removeItem('oldTableData');
    localStorage.removeItem('schemeTableData');
  };

  const handleSave = async () => {
    if (!formData.customer_id || !formData.account_name || !formData.mobile || !formData.email) {
      alert("Please fill in all required customer details before saving.");
      return;
    }

    const dataToSave = {
      orderDetails: orderDetails.map(item => ({
        ...item,
        customer_id: formData.customer_id,
        mobile: formData.mobile,
        account_name: formData.account_name,
        email: formData.email,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        pincode: formData.pincode,
        state: formData.state,
        state_code: formData.state_code,
        aadhar_card: formData.aadhar_card,
        gst_in: formData.gst_in,
        pan_card: formData.pan_card,
        terms: formData.terms,
        cash_amount: paymentDetails.cash_amount || 0,
        card_amount: paymentDetails.card || 0,
        card_amt: paymentDetails.card_amt || 0,
        chq: paymentDetails.chq || "",
        chq_amt: paymentDetails.chq_amt || 0,
        online: paymentDetails.online || "",
        online_amt: paymentDetails.online_amt || 0,
      })),
      oldItems: oldSalesData,
      memberSchemes: schemeSalesData,
      oldItemsAmount: oldItemsAmount || 0,
      schemeAmount: schemeAmount || 0,
    };

    console.log("Payload to be sent:", JSON.stringify(dataToSave, null, 2));
    try { 
        navigate("/orderstable");
      clearData();  // Ensure data is cleared before reloading
      resetForm();
      window.location.reload();
      alert("Order added successfully");
      await axios.post(`${baseURL}/save-order-details`, dataToSave);
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
              fileName={`order-${formData.order_number}.pdf`}
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