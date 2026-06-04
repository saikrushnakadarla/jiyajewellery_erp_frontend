import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import InputField from './InputfieldSales';

const InvoiceDetails = ({ setReturnData, returnData, invoiceDetails, filteredInvoices, setFilteredInvoices, uniqueInvoice, handleInvoiceChange, formData, setFormData }) => {
  
  // Format the invoice date to match the formData.date format (YYYY-MM-DD)
  const formatInvoiceDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Filter invoices based on selected date
  const getFilteredInvoices = () => {
    if (!formData.date) return filteredInvoices;
    
    return filteredInvoices.filter(invoice => {
      const invoiceFormattedDate = formatInvoiceDate(invoice.date);
      return invoiceFormattedDate === formData.date;
    });
  };

  return (
    <Col style={{ width: '454%' }}>
      <Row>
        <Col xs={12} md={6}>
          <InputField
            label="Invoice Number"
            name="invoice_number"
            type="select"
            value={returnData.invoice_number || ""}
            onChange={handleInvoiceChange}
            options={getFilteredInvoices().map((invoice) => {
              const date = new Date(invoice.date);
              const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
              return {
                value: invoice.invoice_number,
                label: `${invoice.invoice_number} - ${formattedDate}`,
              };
            })}
          />
        </Col>

        <Col xs={12} md={6}>
          <InputField
            label="Date:"
            name="date"
            value={formData.date}
            type="date"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            max={new Date().toISOString().split("T")[0]}
          />
        </Col>
      </Row>
    </Col>
  );
};

export default InvoiceDetails;