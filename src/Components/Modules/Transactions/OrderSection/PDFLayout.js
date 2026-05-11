import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { ArrowUpRight } from 'lucide-react';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#4338ca',
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 5,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#4338ca',
    color: 'white',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    flex: 1,
  },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
    paddingTop: 10,
  },
  paymentDetails: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
    paddingTop: 10,
  },
});

const PDFLayout = ({ formData, orderDetails, paymentDetails }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Sales Bill</Text>
        <ArrowUpRight color="white" size={24} />
      </View>

      {/* Business & Customer Details */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Business Name</Text>
          <Text style={styles.value}>{formData.business_name}</Text>
          
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{formData.address1}</Text>
          
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{formData.mobile}</Text>
        </View>
        
        <View style={styles.column}>
          <Text style={styles.label}>GSTIN No</Text>
          <Text style={styles.value}>{formData.gst_in}</Text>
          
          <Text style={styles.label}>Invoice No</Text>
          <Text style={styles.value}>{formData.invoice_number}</Text>
          
          <Text style={styles.label}>State</Text>
          <Text style={styles.value}>{formData.state}</Text>
        </View>
      </View>

      {/* Products Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>S.No</Text>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>HSN</Text>
          <Text style={styles.tableCell}>QTY</Text>
          <Text style={styles.tableCell}>Rate</Text>
          <Text style={styles.tableCell}>Amount</Text>
        </View>
        
        {orderDetails.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{index + 1}</Text>
            <Text style={styles.tableCell}>{item.product_name}</Text>
            <Text style={styles.tableCell}>{item.hsn_code || '-'}</Text>
            <Text style={styles.tableCell}>{item.qty}</Text>
            <Text style={styles.tableCell}>{item.rate}</Text>
            <Text style={styles.tableCell}>{item.total_price}</Text>
          </View>
        ))}
      </View>

      {/* Payment Details */}
      <View style={styles.paymentDetails}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>
              {paymentDetails.cash_amount > 0 ? 'Cash' : ''}
              {paymentDetails.card_amt > 0 ? ' Card' : ''}
              {paymentDetails.chq_amt > 0 ? ' Cheque' : ''}
              {paymentDetails.online_amt > 0 ? ' Online' : ''}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.value}>
              ₹{orderDetails.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ marginTop: 30, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
        <Text style={{ fontSize: 8, color: '#666', textAlign: 'center' }}>
          This is a computer generated invoice
        </Text>
      </View>
    </Page>
  </Document>
);

export default PDFLayout;