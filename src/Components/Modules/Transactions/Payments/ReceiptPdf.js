import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.2,
    backgroundColor: "#fff",
    width: 226, // Approx. 80mm in points
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  leftText: {
    fontSize: 10,
  },
  rightText: {
    fontSize: 10,
    textAlign: "right",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 3,
    paddingBottom: 3,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingBottom: 2,
  },
  tableCell: {
    fontSize: 10,
  },
  sno: {
    width: "10%",
    fontWeight: "bold",
    textAlign: "center",
  },
  inv: {
    width: "30%",
    textAlign: "center",
  },
  totalAmt: {
    width: "20%",
    textAlign: "right",
  },
  balanceAmt: {
    width: "20%",
    textAlign: "right",
  },
  paidAmt: {
    width: "20%",
    textAlign: "right",
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingTop: 3,
    paddingBottom: 3,

  },
});

const PDFContent = ({ formData }) => {
  const currentTime = new Date().toLocaleTimeString();

  // Safely handle formData properties
  const invoiceNumbers = Array.isArray(formData.invoice_number) ? formData.invoice_number : [];
  const totalAmounts = Array.isArray(formData.total_amt) ? formData.total_amt : [];
  const discountAmounts = Array.isArray(formData.discount_amt) ? formData.discount_amt : [];
  const balanceAmounts = Array.isArray(formData.balanceAmt) ? formData.balanceAmt : [];

  return (
    <Document>
      <Page size={[250, 500]} style={styles.page}>
        {/* Heading */}
        <Text style={styles.heading}>Payment</Text>

        {/* Details */}
        <View>
          <View style={styles.row}>
            <Text style={styles.leftText}>Receipt No: {formData.receipt_no || "N/A"}</Text>
            <Text style={styles.rightText}>Account Name: {formData.account_name || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.leftText}>Date: {formData.date || "N/A"}</Text>
            <Text style={styles.rightText}>Time: {currentTime}</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.sno]}>S.No.</Text>
          <Text style={[styles.tableCell, styles.inv]}>Invoice ID</Text>
          <Text style={[styles.tableCell, styles.totalAmt]}>Total Amt</Text>
          <Text style={[styles.tableCell, styles.balanceAmt]}>Paid Amt</Text>
          <Text style={[styles.tableCell, styles.paidAmt]}>Bal Amt</Text>
        </View>

         {/* Table Rows */}
      {[1].map((item, index) => (
        <View style={styles.tableRow} key={index}>
          <Text style={[styles.tableCell, styles.sno]}>{item}</Text>
          <Text style={[styles.tableCell, styles.inv]}>{formData.invoice_number}</Text>
          <Text style={[styles.tableCell, styles.totalAmt]}>{formData.total_amt}</Text>
          <Text style={[styles.tableCell, styles.balanceAmt]}>{formData.discount_amt}</Text>
          <Text style={[styles.tableCell, styles.paidAmt]}>{formData.cash_amt}</Text>
        </View>
      ))}

      {/* Footer Row */}
      <View style={styles.footerRow}>
        <Text style={[styles.tableCell, styles.sno]}></Text>
        <Text style={[styles.tableCell, styles.inv]}>Total</Text>
        <Text style={[styles.tableCell, styles.totalAmt]}>{formData.total_amt}</Text>
        <Text style={[styles.tableCell, styles.balanceAmt]}>{formData.discount_amt}</Text>
        <Text style={[styles.tableCell, styles.paidAmt]}>{formData.cash_amt}</Text>
      </View>
      </Page>
    </Document>
  );
};



export default PDFContent;
