import React from "react";
import Salesform from "./SaleReturnSaleform";

const SaleReturnForm = ({
  invoiceDetails,
  filteredInvoices,
  setFilteredInvoices,
  uniqueInvoice,
  handleInvoiceChange,
  setReturnData,
  returnData,
  selectedRows,
  setSelectedRows,
  isAllSelected,
  setIsAllSelected,
  handleCheckboxChange,
  handleSelectAllChange,
  salesTaxableAmount,
  salesTaxAmount,
  salesNetAmount,
  resetSaleReturnForm,
  handleCheckout,
}) => {
  console.log("FilteredInvoices=", filteredInvoices);
  return (
    <div>
      {/* <h4>SaleReturn Form</h4> */}
      <Salesform
        filteredInvoices={filteredInvoices}
        invoiceDetails={invoiceDetails}
        uniqueInvoice={uniqueInvoice}
        handleInvoiceChange={handleInvoiceChange}
        returnData={returnData}
        setReturnData={setReturnData}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isAllSelected={isAllSelected}
        setIsAllSelected={setIsAllSelected}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAllChange={handleSelectAllChange}
        salesTaxableAmount={salesTaxableAmount}
        salesTaxAmount={salesTaxAmount}
        salesNetAmount={salesNetAmount}
        resetSaleReturnForm={resetSaleReturnForm}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default SaleReturnForm;
