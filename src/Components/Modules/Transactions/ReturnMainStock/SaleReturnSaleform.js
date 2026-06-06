import React, { useState, useEffect } from 'react';
import { Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import InvoiceDetails from './SalereturnInvoice';
import ProductTable from './SalesProductTable';
import PaymentDetails from './Salespaymentdetails';
import useProductHandlers from '../SalesReturn/hooks/useProductHandlers';
import useCalculations from '../SalesReturn/hooks/useCalculations';
import './../Sales/SalesForm.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFLayout from '../SalesReturn/PDFLayout';

const SalesForm = ({ invoiceDetails, filteredInvoices, uniqueInvoice, handleInvoiceChange, setReturnData, returnData,

  handleCheckboxChange,
  handleSelectAllChange,
  salesTaxableAmount,
  salesTaxAmount,
  salesNetAmount,
  selectedRows,
  setSelectedRows,
  isAllSelected,
  setIsAllSelected,
  resetSaleReturnForm,
  handleCheckout
}) => {
  const navigate = useNavigate();
  const [showPDFDownload, setShowPDFDownload] = useState(false);
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
  } = useProductHandlers();

  // Apply calculations
  useCalculations(formData, setFormData);
 
  useEffect(() => {
    localStorage.setItem('repairDetails', JSON.stringify(repairDetails));
  }, [repairDetails]);

  useEffect(() => {
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
  }, [paymentDetails]);

 
  const [editIndex, setEditIndex] = useState(null);



  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(repairDetails[index]); // Populate form with selected item
  };

  const handleDelete = (indexToDelete) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setRepairDetails(repairDetails.filter((_, index) => index !== indexToDelete));
      alert("Product deleted successfully");
    }
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


  return (
    <div style={{ paddingTop: '0px' }}>
      <Container >
        <Form>
          <div className="sales-form">
            <div className="sales-form-right">
              <InvoiceDetails
                formData={formData}
                setFormData={setFormData}
                uniqueInvoice={uniqueInvoice}
                filteredInvoices={filteredInvoices}
                invoiceDetails={invoiceDetails}
                handleInvoiceChange={handleInvoiceChange}
                returnData={returnData}
                setReturnData={setReturnData}
              />
            </div>
          </div>
          <div >
            <ProductTable
              repairDetails={repairDetails}
              invoiceDetails={invoiceDetails}
              uniqueInvoice={uniqueInvoice}
              filteredInvoices={filteredInvoices}
              isAllSelected={isAllSelected}
              selectedRows={selectedRows}
              handleSelectAllChange={handleSelectAllChange}
              handleCheckboxChange={handleCheckboxChange}
              onEdit={handleEdit}
              onDelete={handleDelete} />
          </div>
          <div>
            <PaymentDetails
              paymentDetails={paymentDetails}
              setPaymentDetails={setPaymentDetails}
              handleBack={handleBack}
              totalPrice={totalPrice}
              repairDetails={repairDetails}
              invoiceDetails={invoiceDetails}
              uniqueInvoice={uniqueInvoice}
              filteredInvoices={filteredInvoices}
              selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                isAllSelected={isAllSelected}
                setIsAllSelected={setIsAllSelected}
              handleSelectAllChange={handleSelectAllChange}
              handleCheckboxChange={handleCheckboxChange}
              resetSaleReturnForm={resetSaleReturnForm}
              salesTaxableAmount={salesTaxableAmount}
              salesTaxAmount={salesTaxAmount}
              salesNetAmount={salesNetAmount}
              handleCheckout={handleCheckout}
            />
          </div>
          <div className="sales-form2">
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
