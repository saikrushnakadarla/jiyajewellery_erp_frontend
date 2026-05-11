import React, { useState, useEffect } from 'react';
import { Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
import PDFLayout from './PDFLayout';

const SalesForm = () => {
  const navigate = useNavigate();
  const [showPDFDownload, setShowPDFDownload] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [metal, setMetal] = useState("");
  const [repairDetails, setRepairDetails] = useState(
    JSON.parse(localStorage.getItem('repairDetails')) || []
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
    isBarcodeSelected,
  } = useProductHandlers();

  // Apply calculations
  useCalculations(formData, setFormData);
  const [uniqueInvoice, setUniqueInvoice] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${baseURL}/get/account-details`);
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const result = await response.json();
        const filteredCustomers = result.filter(item => item.account_group === 'CUSTOMERS' || item.account_group === 'SUPPLIERS');
        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
  
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-unique-repair-details`);
        const filteredData = response.data.filter(item => item.transaction_status === 'Sales');
        setUniqueInvoice(filteredData);
        setFilteredInvoices(filteredData); // Initially, show all invoices
      } catch (error) {
        console.error('Error fetching repair details:', error);
      }
    };
  
    fetchRepairs();
  }, []);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!formData.invoice_number) {
        setInvoiceDetails(null); // Clear details if no invoice is selected
        return;
      }
  
      try {
        const response = await axios.get(`${baseURL}/getsales/${formData.invoice_number}`);
        
        // Filter the results to exclude those with status 'Sale Returned'
        const filteredData = response.data.filter((invoice) => invoice.status !== 'Sale Returned');
        
        setInvoiceDetails(filteredData); // Update state with filtered details
        console.log("Fetched Invoice Details:", filteredData);
      } catch (error) {
        console.error(`Error fetching details for invoice ${formData.invoice_number}:`, error);
      }
    };
  
    fetchInvoiceDetails();
  }, [formData.invoice_number]);
  
  
  

  useEffect(() => {
    localStorage.setItem('repairDetails', JSON.stringify(repairDetails));
  }, [repairDetails]);

  useEffect(() => {
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
  }, [paymentDetails]);

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((cust) => String(cust.account_id) === String(customerId));
    
    if (customer) {
      // Update customer details in formData
      setFormData({
        ...formData,
        customer_id: customerId,
        account_name: customer.account_name,
        mobile: customer.mobile || "",
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
      });
  
      // Filter invoices by customer account_name or mobile
      const filtered = uniqueInvoice.filter(
        (invoice) =>
          invoice.customer_name === customer.account_name || invoice.mobile === customer.mobile
      );
      setFilteredInvoices(filtered);
    } else {
      // Reset formData and invoices if no customer is selected
      setFormData({
        ...formData,
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
      });
      setFilteredInvoices(uniqueInvoice);
    }
  };
  

  const [editIndex, setEditIndex] = useState(null);

  const handleAdd = () => {
    setRepairDetails([...repairDetails, { ...formData }]);
    resetProductFields();
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(repairDetails[index]); // Populate form with selected item
  };

  const handleUpdate = () => {
    const updatedDetails = repairDetails.map((item, index) =>
      index === editIndex ? { ...formData } : item
    );
    setRepairDetails(updatedDetails);
    setEditIndex(null);
    resetProductFields();
  };
  const handleDelete = (indexToDelete) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setRepairDetails(repairDetails.filter((_, index) => index !== indexToDelete));
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
      gross_weight: "",
      stone_weight: "",
      weight_bw: "",
      stone_price: "",
      va_on: "",
      va_percent: "",
      wastage_weight: "",
      total_weight_av: "",
      mc_on: "",
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
  const totalPrice = repairDetails.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
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
      invoice_number: "",
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

  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false); // State to track "Check All" checkbox
  
  const handleCheckboxChange = (event, index) => {
    const isChecked = event.target.checked;
    let updatedSelectedRows;
  
    if (isChecked) {
      updatedSelectedRows = [...selectedRows, index]; // Add index to selectedRows
    } else {
      updatedSelectedRows = selectedRows.filter((i) => i !== index); // Remove index from selectedRows
    }
  
    setSelectedRows(updatedSelectedRows);
  
    // Update "Select All" checkbox state
    setIsAllSelected(updatedSelectedRows.length === invoiceDetails.length);
  };
  
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      // Select all rows
      setSelectedRows(invoiceDetails.map((_, index) => index));
    } else {
      // Deselect all rows
      setSelectedRows([]);
    }
    setIsAllSelected(isChecked); // Update "Check All" checkbox state
  };

  return (
    <div style={{paddingTop:'75px'}}>
      <Container className="sales-form-container">
        <Form>
          <h3 style={{ marginTop: '-45px', marginBottom: '10px', textAlign: 'left', color: '#a36e29' }}>
            Sales Return
          </h3>
          <div className="sales-form">
            <div className="sales-form-left">
              <CustomerDetails 
                formData={formData}
                handleCustomerChange={handleCustomerChange}
                handleAddCustomer={handleAddCustomer}
                customers={customers}
              />
            </div>
            <div className="sales-form-right">
              <InvoiceDetails 
                formData={formData}
                setFormData={setFormData}
                uniqueInvoice={uniqueInvoice}
                filteredInvoices={filteredInvoices}
                invoiceDetails={invoiceDetails}
              />
            </div>
          </div>

          {/* <div className="sales-form-section">
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
              filteredMetalTypes={filteredMetalTypes}
              filteredPurityOptions={filteredPurityOptions}
              filteredDesignOptions={filteredDesignOptions}
              isBarcodeSelected={isBarcodeSelected}
              isQtyEditable={isQtyEditable}  
              handleUpdate={handleUpdate}
              isEditing={editIndex !== null}           
            />
          </div> */}

          <div className="sales-form-section">
            <ProductTable 
              repairDetails={repairDetails} 
              invoiceDetails={invoiceDetails}
              isAllSelected={isAllSelected}
              selectedRows={selectedRows}
              handleSelectAllChange={handleSelectAllChange}
              handleCheckboxChange={handleCheckboxChange}
              onEdit={handleEdit} 
              onDelete={handleDelete}/>
          </div>
          <div className="sales-form-section">
          <PaymentDetails 
                paymentDetails={paymentDetails}
                setPaymentDetails={setPaymentDetails}
                handleBack={handleBack}
                totalPrice={totalPrice} 
                repairDetails={repairDetails} 
                invoiceDetails={invoiceDetails}
                isAllSelected={isAllSelected}
                selectedRows={selectedRows}
                handleSelectAllChange={handleSelectAllChange}
                handleCheckboxChange={handleCheckboxChange}
                resetForm={resetForm}
              />
          </div>


          <div className="sales-form2">
            {/* <div className="sales-form-third">
              
            </div> */}

            {/* <div className="sales-form-fourth">
              <PaymentDetails 
                paymentDetails={paymentDetails}
                setPaymentDetails={setPaymentDetails}
                handleBack={handleBack}
                totalPrice={totalPrice} 
                repairDetails={repairDetails} 
                invoiceDetails={invoiceDetails}
                isAllSelected={isAllSelected}
                selectedRows={selectedRows}
                handleSelectAllChange={handleSelectAllChange}
                handleCheckboxChange={handleCheckboxChange}
                resetForm={resetForm}
              />
            </div> */}
          </div>
          {showPDFDownload && (
        <PDFDownloadLink
          document={
            <PDFLayout
              formData={formData}
              repairDetails={repairDetails}
              paymentDetails={paymentDetails}
            />
          }
          fileName={`invoice-${formData.invoice_number}.pdf`}
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
