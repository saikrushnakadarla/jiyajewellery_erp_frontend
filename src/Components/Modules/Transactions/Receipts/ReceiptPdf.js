import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo1 from '../../../../Components/Pages/Images/newfriends_logo.jpg';
import QRCode from "qrcode";
import { toWords } from "number-to-words";
import baseURL from '../../../../Url/NodeBaseURL';

const styles = StyleSheet.create({
  page: {
    padding: 5,
    fontSize: 8,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  image1: {
    width: '90%',
    height: 100,
    marginTop: 0,
  },
  image2: {
    marginTop: 0,
  },
  divider: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: -10,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: 'black',
    width: '100%',
  },
  leftColumn: {
    marginLeft: 100,
    fontSize: 7,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 7,
  },
  flatNo: {
    marginBottom: 2,
  },
  cin: {
    marginBottom: 2,
  },
  branch: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  branchContent: {
    marginBottom: 2,
  },
  divider1: {
    width: 1,
    height: '100%',
    backgroundColor: 'black',
  },
  horizontalLine1: {
    width: '100%',
    height: 1,
    alignSelf: 'center',
    marginBottom: 2,
  },
  horizontalLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
    alignSelf: 'center',
    marginBottom: 2,
  },
  boxContainer: {
    width: '100%',
    height: '100%',
    border: '1px solid black',
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCell: {
    padding: 5,
    textAlign: 'center',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Times-Roman'
  },
  tableCellHeader: {
    width: '10%',
    textAlign: 'center',
    marginTop: '-4'
  },
  tableCellDescription: {
    width: '30%',
    textAlign: 'center',
    marginTop: '-4'
  },
  tableCellTotalAmt: {
    width: '20%',
    textAlign: 'right',
    marginTop: '-4'
  },
  tableCellBalanceAmt: {
    width: '20%',
    textAlign: 'right',
    marginTop: '-4'
  },
  tableCellPaidAmt: {
    width: '20%',
    textAlign: 'right',
    marginTop: '-4'
  },
  lastheight: {
    height: 28,
  },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  qrCode: {
    width: 100,
    height: 100,
  },
  amountInWords: {
    textAlign: 'left',
    paddingLeft: 10,
    marginTop: 5,
    fontStyle: 'italic',
  },
  // New styles for the updated layout
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  companyAddress: {
    textAlign: 'center',
    fontSize: 8,
    marginBottom: 10,
    fontFamily: 'Times-Bold',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContainer: {
    width: '2%',
    paddingRight: 10,
    fontFamily: 'Times-Bold',
  },
  customerDetails: {
    width: '56%',
    paddingRight: 10,
    fontFamily: 'Times-Bold',
  },
  receiptDetails: {
    width: '30%',
    paddingLeft: 10,
    fontFamily: 'Times-Bold',
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    textAlign: "right",
    flex: 1,
  },
  // New styles for summary section
  summaryContainer: {
    marginTop: 10,
    width: '100%',
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: 'Times-Bold',
  },
  summaryLeft: {
    width: '50%',
    paddingLeft: 10,
  },
  summaryRight: {
    width: '50%',
    paddingRight: 10,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  // Items container
  itemsContainer: {
    minHeight: 200,
    flexDirection: 'column',
  },
  // Filler rows
  fillerRow: {
    display: 'flex',
    flexDirection: 'row',
    height: 22,
  },
  fillerCellHeader: {
    width: '10%',
  },
  fillerCellDescription: {
    width: '30%',
  },
  fillerCellTotalAmt: {
    width: '20%',
  },
  fillerCellBalanceAmt: {
    width: '20%',
  },
  fillerCellPaidAmt: {
    width: '20%',
  },
});

const PDFContent = ({ formData, company }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(formData?.receipt_no || "", {
          width: 100,
          margin: 2,
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };

    generateQRCode();
  }, [formData]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Convert amount to words
  const amountInWords = toWords(parseFloat(formData.discount_amt || 0)).replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  // Format company address in one line
  const companyAddress = `${company?.address || ""}, ${company?.address2 || ""}, ${company?.city || ""}, ${company?.state || ""} - ${company?.pincode || ""}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo covering full width at the top */}
        <View style={styles.logoContainer}>
          <Image style={styles.image1} src={logo1} />
        </View>

        {/* Company address in one line below logo */}
        <View style={styles.companyAddress}>
          <Text>{companyAddress}</Text>
        </View>

        {/* Customer Details (Left) and Receipt Details (Right) side by side */}
        <View style={styles.detailsContainer}>
          {/* Left Column - Customer Details */}
          <View style={styles.leftContainer}></View>
          <View style={styles.customerDetails}>
            <Text style={[styles.boldText, { marginBottom: 5 }]}>CUSTOMER DETAILS:</Text>
            <Text style={{ marginBottom: 4 }}>{formData.account_name || "N/A"},</Text>
            <Text style={{ marginBottom: 4 }}>MOBILE: {formData.mobile || "N/A"}</Text>
          </View>

          {/* Right Column - Receipt Details */}
          <View style={styles.receiptDetails}>
            <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 10, textAlign: 'center' }}>RECEIPT</Text>

            {/* RECEIPT NO */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>RECEIPT NO:</Text>
              <Text style={styles.detailValue}>{formData.receipt_no || "N/A"}</Text>
            </View>

            {/* DATE */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>DATE:</Text>
              <Text style={styles.detailValue}>{formatDate(formData.date)}</Text>
            </View>

            {/* TIME */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TIME:</Text>
              <Text style={styles.detailValue}>{currentTime}</Text>
            </View>

            {/* GSTIN */}
            {company && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GSTIN:</Text>
                <Text style={styles.detailValue}>
                  {company?.gst_no || "N/A"}
                </Text>
              </View>
            )}

            {/* Contact Info */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>MOBILE:</Text>
              <Text style={styles.detailValue}>{company?.mobile || ""}</Text>
            </View>
          </View>
          <View style={styles.leftContainer}></View>
        </View>

        {/* Rest of the content */}
        <View style={styles.container}>
          <View style={styles.boxContainer}>
            {/* Table Header */}
            <View style={[styles.tableRow, { fontFamily: 'Times-Bold', borderBottomWidth: 1, borderBottomColor: '#000' }]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>S.No.</Text>
              <View style={styles.divider1} />
              <Text style={[styles.tableCell, styles.tableCellDescription]}>Invoice ID</Text>
              <View style={styles.divider1} />
              <Text style={[styles.tableCell, styles.tableCellTotalAmt]}>Total Amt</Text>
              <View style={styles.divider1} />
              <Text style={[styles.tableCell, styles.tableCellBalanceAmt]}>Paid Amt</Text>
              <View style={styles.divider1} />
              <Text style={[styles.tableCell, styles.tableCellPaidAmt]}>Bal Amt</Text>
            </View>
            <View style={styles.horizontalLine} />

            {/* Items container with actual items */}
            <View style={styles.itemsContainer}>
              {/* Table Row */}
              <View style={[styles.tableRow, { fontFamily: 'Times-Roman', borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>1</Text>
                <View style={[styles.divider1, { marginTop: -2 }]} />
                <Text style={[styles.tableCell, styles.tableCellDescription]}>{formData.invoice_number || "N/A"}</Text>
                <View style={[styles.divider1, { marginTop: -2 }]} />
                <Text style={[styles.tableCell, styles.tableCellTotalAmt]}>{formData.total_amt || "0.00"}</Text>
                <View style={[styles.divider1, { marginTop: -2 }]} />
                <Text style={[styles.tableCell, styles.tableCellBalanceAmt]}>{formData.discount_amt || "0.00"}</Text>
                <View style={[styles.divider1, { marginTop: -2 }]} />
                <Text style={[styles.tableCell, styles.tableCellPaidAmt]}>{formData.cash_amt || "0.00"}</Text>
              </View>

              {/* Filler rows to maintain table structure */}
              {Array.from({ length: 9 }).map((_, index) => (
                <View style={[styles.fillerRow, { fontFamily: 'Times-Roman' }]} key={`filler-${index}`}>
                  <Text style={[styles.fillerCellHeader]}></Text>
                  <View style={[styles.divider1, { marginTop: -2 }]} />
                  <Text style={[styles.fillerCellDescription]}></Text>
                  <View style={[styles.divider1, { marginTop: -2 }]} />
                  <Text style={[styles.fillerCellTotalAmt]}></Text>
                  <View style={[styles.divider1, { marginTop: -2 }]} />
                  <Text style={[styles.fillerCellBalanceAmt]}></Text>
                  <View style={[styles.divider1, { marginTop: -2 }]} />
                  <Text style={[styles.fillerCellPaidAmt]}></Text>
                </View>
              ))}
            </View>

            <View style={[styles.horizontalLine, { marginTop: -2 }]} />

            {/* Footer Row */}
            <View style={[styles.tableRow, { fontFamily: 'Times-Bold' }]}>
              <Text style={[styles.tableCell, styles.tableCellHeader, styles.lastheight]}></Text>
              <View style={[styles.divider1, { marginTop: -2 }]} />
              <Text style={[styles.tableCell, styles.tableCellDescription, styles.lastheight]}>Total</Text>
              <View style={[styles.divider1, { marginTop: -2 }]} />
              <Text style={[styles.tableCell, styles.tableCellTotalAmt, styles.lastheight]}>{formData.total_amt || "0.00"}</Text>
              <View style={[styles.divider1, { marginTop: -2 }]} />
              <Text style={[styles.tableCell, styles.tableCellBalanceAmt, styles.lastheight]}>{formData.discount_amt || "0.00"}</Text>
              <View style={[styles.divider1, { marginTop: -2 }]} />
              <Text style={[styles.tableCell, styles.tableCellPaidAmt, styles.lastheight]}>{formData.cash_amt || "0.00"}</Text>
            </View>

            <View style={[styles.horizontalLine, { marginTop: -2 }]} />

            {/* Amount in words */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View style={styles.summaryItem}>
                    <Text>Amount in Words:</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text>Rupees {amountInWords} Only</Text>
                  </View>
                </View>
                <View style={styles.summaryRight}>
                  {/* Empty for alignment */}
                </View>
              </View>
            </View>

            <View style={{ alignItems: "center", fontFamily: 'Times-Bold', marginTop: 10 }}>
              {/* QR Code centered */}
            </View>

            <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between", marginBottom: 3, fontFamily: 'Times-Bold' }}>
              {/* Left Side */}
              <View style={{ alignItems: "flex-start", paddingLeft: 10 }}>
                <Text>For Customer</Text>
              </View>

              {/* Right Side */}
              <View style={{ alignItems: "flex-end", paddingRight: 10 }}>
                <Text>For {company?.company_name?.toUpperCase() || "NEW FRIEND'S JEWELLERY"}</Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {qrCodeUrl && (
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrCode}
                />
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFContent;