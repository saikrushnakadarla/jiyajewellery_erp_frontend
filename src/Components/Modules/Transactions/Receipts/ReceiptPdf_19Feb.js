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
    fontFamily: "Helvetica",
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
    height: 50,
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
    marginTop: -60,
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
    height: 200,
    marginTop: 5,
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
  },
  tableCellDescription: {
    width: '30%',
    textAlign: 'center',
  },
  tableCellTotalAmt: {
    width: '20%',
    textAlign: 'right',
  },
  tableCellBalanceAmt: {
    width: '20%',
    textAlign: 'right',
  },
  tableCellPaidAmt: {
    width: '20%',
    textAlign: 'right',
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
});

const PDFContent = ({ formData, company }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading
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
        {/* First Row */}
        <View style={styles.row}>
          <View style={[styles.column, { marginTop: 20, width: "20%", marginLeft: 20, fontFamily: "Times-Bold" }]}>
            <Text style={[styles.boldText, { marginBottom: 5 }]}>CUSTOMER DETAILS:</Text>
            <Text style={{ marginBottom: 5 }}>{formData.account_name || "N/A"},</Text>
            <Text style={{ marginBottom: 5 }}>MOBILE: {formData.mobile || "N/A"}</Text>
          </View>

          <View style={[styles.column, { width: "40%" }]}>
            <Image style={styles.image1} src={logo1} />
          </View>

          <View style={[styles.column, { width: "10%" }]}></View>

          <View style={[styles.column, { marginTop: 0, width: "20%", marginLeft: 20, fontFamily: "Times-Bold" }]}>
            <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 10, marginLeft: 20 }}>RECEIPT</Text>

            {/* RECEIPT NO */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <Text>RECEIPT NO:</Text>
              <Text style={{ textAlign: "right", flex: 1 }}>{formData.receipt_no || "N/A"}</Text>
            </View>

            {/* DATE */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <Text>DATE:</Text>
              <Text style={{ textAlign: "right", flex: 1 }}>{formatDate(formData.date)}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <Text>TIME:</Text>
              <Text style={{ textAlign: "right", flex: 1 }}>{currentTime}</Text>
            </View>

            {/* STAFF */}
            {/* <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <Text>STAFF:</Text>
              <Text style={{ textAlign: "right", flex: 1 }}>New Friend's Jewellery</Text>
            </View> */}

            {/* GSTIN */}
            {company && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                <Text>GSTIN:</Text>
                <Text style={{ textAlign: "right", flex: 1 }}>
                  {company?.gst_no || "N/A"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.container}>
          {/* Centered Heading */}
          <Text style={[styles.heading, { fontFamily: 'Times-Bold' }]}>
            {company?.company_name?.toUpperCase() || ""}
          </Text>

          <View style={styles.contentContainer}>

            <View style={styles.leftColumn}>
              <Text style={styles.flatNo}>
                Flat No : {company?.address || ""}
              </Text>

              <Text style={styles.cin}>
                Road/Street: {company?.address2 || ""}
              </Text>

              <Text style={styles.cin}>
                {company?.city || ""}, {company?.state || ""} - {company?.pincode || ""}
              </Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.divider1} />

            {/* Branch Section */}
            <View style={styles.rightColumn}>
              <Text style={[styles.branch, { fontFamily: 'Times-Bold' }]}>BRANCH:</Text>

              <Text style={styles.branchContent}>
                {company?.address || ""},
              </Text>

              <Text style={styles.branchContent}>
                {company?.address2 || ""},
              </Text>

              <Text style={styles.branchContent}>
                {company?.city || ""}, {company?.state || ""} - {company?.pincode || ""}
              </Text>
            </View>
          </View>

          {/* Horizontal Divider under both sections */}
          <View style={styles.horizontalLine1} />

          <View>
            <Text>
              Mob : {company?.mobile?.toUpperCase() || ""}
            </Text>
          </View>

          <View style={styles.boxContainer}>
            {/* Table Header */}
            <View style={[styles.tableRow, { fontFamily: 'Times-Bold', borderBottomWidth: 1, borderBottomColor: '#000' }]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>S.No.</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellDescription]}>Invoice ID</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellTotalAmt]}>Total Amt</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellBalanceAmt]}>Paid Amt</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellPaidAmt]}>Bal Amt</Text>
            </View>

            {/* Table Row */}
            <View style={[styles.tableRow, { fontFamily: 'Times-Roman', borderBottomWidth: 1, borderBottomColor: '#000' }]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>1</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellDescription]}>{formData.invoice_number || "N/A"}</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellTotalAmt]}>{formData.total_amt || "0.00"}</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellBalanceAmt]}>{formData.discount_amt || "0.00"}</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellPaidAmt]}>{formData.cash_amt || "0.00"}</Text>
            </View>

            {/* Footer Row */}
            <View style={[styles.tableRow, { fontFamily: 'Times-Bold', borderBottomWidth: 1, borderBottomColor: '#000' }]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}></Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellDescription]}>Total</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellTotalAmt]}>{formData.total_amt || "0.00"}</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellBalanceAmt]}>{formData.discount_amt || "0.00"}</Text>
              <View style={[styles.divider1, { height: '100%' }]} />
              <Text style={[styles.tableCell, styles.tableCellPaidAmt]}>{formData.cash_amt || "0.00"}</Text>
            </View>
            <View style={styles.horizontalLine} />

            {/* Amount in words */}
            <Text style={styles.amountInWords}>
              Rupees {amountInWords} Only
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
              {qrCodeUrl && <Image style={styles.qrCode} src={qrCodeUrl} />}
            </View>

            <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between", marginBottom: 3, fontFamily: 'Times-Bold' }}>
              {/* Left Side */}
              <View style={{ alignItems: "flex-start", paddingLeft: 10 }}>
                <Text style={[styles.boldText]}>For Customer</Text>
              </View>

              {/* Right Side */}
              <View style={{ alignItems: "flex-end", paddingRight: 10 }}>
                <Text style={[styles.boldText]}>For NEW FRIEND'S JEWELLERY</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFContent;