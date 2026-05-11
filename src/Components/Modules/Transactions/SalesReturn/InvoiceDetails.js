import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import InputField from './../../Transactions/SalesForm/InputfieldSales';

const InvoiceDetails = ({ formData, setFormData, filteredInvoices }) => {
  useEffect(() => {
    // Set the default date value to the current date in dd-mm-yyyy format if not already set
    if (!formData.date) {
      const currentDate = new Date();
      setFormData({
        ...formData,
        date: formatDate(currentDate),
      });
    }
  }, [formData, setFormData]);

  // Utility function to format date as dd-mm-yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handle invoice number change
  const handleInvoiceChange = (e) => {
    const selectedInvoiceNumber = e.target.value;
    const selectedInvoice = filteredInvoices.find(
      (invoice) => invoice.invoice_number === selectedInvoiceNumber
    );

    if (selectedInvoice) {
      setFormData({
        ...formData,
        invoice_number: selectedInvoiceNumber,
        date: selectedInvoice.date ? formatDate(selectedInvoice.date) : "", // Format date
        terms: selectedInvoice.terms || "", // Set the terms from the selected invoice
      });
    } else {
      setFormData({
        ...formData,
        invoice_number: selectedInvoiceNumber,
        date: "",
        terms: "",
      });
    }
  };

  return (
    <Col className="sales-form-section">
      <Row>
        <InputField
          label="Invoice Number"
          name="invoice_number"
          type="select"
          value={formData.invoice_number || ""}
          onChange={handleInvoiceChange}
          options={filteredInvoices.map((invoice) => ({
            value: invoice.invoice_number,
            label: invoice.invoice_number,
          }))}
        />
      </Row>
      <Row>
        {/* <Col xs={12} md={6}>
          <InputField
            label="Terms"
            name="terms"
            value={formData.terms || ""}
            readOnly={true}
          />
        </Col> */}
        <Col xs={12} md={12}>
          <InputField
            label="Date"
            name="date"
            value={formData.date || ""}
            readOnly={true}
          />
        </Col>
      </Row>
    </Col>
  );
};

export default InvoiceDetails;
