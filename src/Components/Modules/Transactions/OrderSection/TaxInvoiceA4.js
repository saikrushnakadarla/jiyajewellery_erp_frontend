import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
// import logo1 from '../../../../Navbar/sadashri.png'
import logo1 from '../../../../Components/Pages/Images/newfriends_logo.jpg'
import { toWords } from "number-to-words";
import QRCode from "qrcode";
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
        // column: {
        //         width: '33%',
        // },
        boldText: {
                fontWeight: "bold",

        },
        image1: {
                // width: 100,F
                height: 50,
                marginTop: 10,

        },
        image2: {
                // width: 50,
                // height: 50,
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
                // justifyContent: 'center', 
                alignrepairDetailss: 'center',  // Centers the content horizontally
                padding: 20,
                marginTop: -60,
        },
        heading: {
                fontWeight: 'bold',
                fontSize: 10,
                textAlign: 'center',
                marginTop: -25,
                marginBottom: 5,
        },
        contentContainer: {
                flexDirection: 'row',  // Side by side layout
                alignrepairDetailss: 'center',
                justifyContent: 'center',
                borderBottomWidth: 1,  // Horizontal line under both sections
                borderColor: 'black',
                // paddingBottom: 20,
                width: '100%',  // Ensure it spans the entire width
        },
        leftColumn: {
                // flex: 1,
                // paddingLeft: 100,
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
                width: '100%',  // Set width to 70%
                height: 1,
                // backgroundColor: 'black',
                alignSelf: 'center',  // Centers the line horizontally within its container
                marginBottom: 2,
        },

        horizontalLine: {
                width: '100%',  // Set width to 70%
                height: 1,
                backgroundColor: 'black',
                alignSelf: 'center',  // Centers the line horizontally within its container
                marginBottom: 2,
        },
        boxContainer: {
                width: '100%',
                height: 330,
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
                // border: '1px solid #000',
                padding: 5,
                textAlign: 'center',
        },
        tableRow: {
                display: 'flex',
                flexDirection: 'row',
                fontFamily: 'Times-Roman'
        },
        tableCellHeader: {
                width: '4%',
                textAlign: 'right',
                marginTop: '-4'
        },
        tableCellDescription: {
                width: '24%',
                textAlign: 'left',
                marginTop: '-4'
        },
        tableCellHSN: {
                width: '8%',
                textAlign: 'center',
                marginTop: '-4'
        },
        tableCellQty: {
                width: '5%',
                textAlign: 'center',
                marginTop: '-4'
        },
        tableCellPurity: {
                width: '10%',
                textAlign: 'left',
                marginTop: '-4'
        },
        tableCellGrossWt: {
                width: '10%',
                textAlign: 'right',
                marginTop: '-4'
        },
        tableCellStoneWt: {
                width: '10%',
                textAlign: 'right',
                marginTop: '-4'
        },
        tableCellNetWt: {
                width: '10%',
                textAlign: 'right',
                marginTop: '-4'
        },
        tableCellRate: {
                width: '10%',
                textAlign: 'right',
                marginTop: '-4'
        },
        tableCellMC: {
                width: '10%',
                textAlign: 'right',
                marginTop: '-4'
        },
        tableCellStAmt: {
                width: '9%',
                textAlign: 'right',
                marginTop: '-4'
        },
        tableCellTotal: {
                width: '10%',
                textAlign: 'right',
                marginTop: '-4'
        },

        lastheight: {
                height: 28,
                // marginTop:'10'
        },
        qrCodeContainer: {
                alignrepairDetailss: "center",
                marginTop: 10,
                marginBottom: 10,
        },
        qrCode: {
                width: 100,
                height: 100,
        },
});

const TaxINVoiceReceipt = ({ repairDetails, }) => {
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formatDate = (dateString) => {
                if (!dateString) return "";
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
        };
        const netBillValueInWords = toWords(repairDetails?.net_bill_amount ?? 0).replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        const [loading, setLoading] = useState(true); // State for loading
        const [error, setError] = useState(null); // State for error handling
        const [data, setData] = useState([]); // State to store table data
        const fetchProducts = async () => {
                try {
                        const response = await fetch(`${baseURL}/get/products`);
                        if (!response.ok) {
                                throw new Error('Failed to fetch products');
                        }
                        const result = await response.json();
                        setData(result);
                        console.log("result=", result)
                } catch (error) {
                        setError(error.message);
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchProducts();
        }, []);

        // const matchedProduct = data.product_name === repairDetails.category;
        const matchedProduct = data.find(product => product.product_name === repairDetails.category);
        console.log("matchedProduct=", matchedProduct)


        return (
                <Document>
                        <Page size="A4" style={styles.page}>
                                {/* First Row */}
                                <View style={styles.row}>
                                        <View style={[styles.column, { marginTop: 20, width: "20%", marginLeft: 20, fontFamily: "Times-Bold" }]}>
                                                <Text style={[styles.boldText, { marginBottom: 5 }]}>CUSTOMER DETAILS:</Text>
                                                <Text style={{ marginBottom: 5 }}>{repairDetails.account_name || ""},</Text>
                                                <Text style={{ marginBottom: 5 }}>{repairDetails.city}</Text>
                                                <Text style={{ marginBottom: 5 }}>MOBILE: {repairDetails.mobile}</Text>
                                                <Text style={{ marginBottom: 5 }}>PAN NO: {repairDetails.pan_card}</Text>
                                                <Image
                                                        source={{ uri: `${baseURL}/uploads/${repairDetails.customerImage}` }}
                                                        style={{ width: 40, height: 40, marginBottom: 5 }} // Adjust size as needed
                                                        resizeMode="cover"
                                                />
                                        </View>

                                        <View style={[styles.column, { width: "40%" }]}>
                                                <Image style={styles.image1} src={logo1} />
                                        </View>

                                        <View style={[styles.column, { width: "10%" }]}></View>

                                        <View style={[styles.column, { marginTop: 0, width: "20%", marginLeft: 20, fontFamily: "Times-Bold" }]}>
                                                <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 10, marginLeft: 20 }}>TAX INVOICE</Text>

                                                {/* BILL NO */}
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>BILL NO:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>{repairDetails.invoice_number}</Text>
                                                </View>

                                                {/* DATE */}
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>DATE:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>{formatDate(repairDetails.date)}</Text>
                                                </View>


                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>TIME:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>
                                                                {currentTime}
                                                        </Text>
                                                </View>


                                                {/* STAFF */}
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>STAFF:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>iiiQbets</Text>
                                                </View>

                                                {/* GSTIN */}
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>GSTIN:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>38RQAPS4222R1ZT</Text>
                                                </View>
                                        </View>
                                </View>


                                <View style={styles.container}>
                                        {/* Centered Heading */}
                                        <Text style={[styles.heading, { fontFamily: 'Times-Bold' }]}>NEW FRIEND'S JEWELLERY</Text>

                                        {/* Flat No. and Branch section */}
                                        <View style={styles.contentContainer}>

                                                {/* Flat No. Section */}
                                                <View style={styles.leftColumn}>
                                                        <Text style={styles.flatNo}>Flat No : SHOP NO.F2, SKITCHAN NGODUP COMPLEX </Text>
                                                        <Text style={styles.cin}>Road/Street: NEAR OLD BUS STAND </Text>
                                                        <Text style={styles.cin}>LEH, Leh Ladakh, Leh Ladakh - 194101.</Text>
                                                        {/* <Text style={styles.cin}>CIN : U46498KA2024PTC185784</Text> */}
                                                </View>

                                                {/* Vertical Divider */}
                                                <View style={styles.divider1} />

                                                {/* Branch Section */}
                                                <View style={styles.rightColumn}>
                                                        <Text style={[styles.branch, { fontFamily: 'Times-Bold' }]}>BRANCH:</Text>
                                                        <Text style={styles.branchContent}>SHOP NO.F2, SKITCHAN NGODUP COMPLEX, </Text>
                                                        <Text style={styles.branchContent}> NEAR OLD BUS STAND,</Text>
                                                        <Text style={styles.branchContent}>Leh Ladakh, Leh Ladakh - 194101</Text>
                                                </View>
                                        </View>

                                        {/* Horizontal Divider under both sections */}
                                        <View style={styles.horizontalLine1} />

                                        <View style={{ textAlign: 'center' }}>
                                                <Text>
                                                        Mob : 9928541909
                                                </Text>
                                        </View>


                                        <View style={styles.boxContainer}>
                                                <View style={styles.table}>
                                                        <View style={[styles.tableRow, { fontFamily: 'Times-Bold' }]}>
                                                                <Text style={[styles.tableCell, styles.tableCellHeader]}>SI</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellDescription]}>Description</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellHSN]}>HSN</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellQty]}>Qty</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellPurity]}>Purity</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellGrossWt]}>Gross.Wt
                                                                        <Text style={{ fontFamily: 'Times-Roman', fontSize: 7 }}>  In Gms</Text>
                                                                </Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellStoneWt]}>Stone.Wt
                                                                        <Text style={{ fontFamily: 'Times-Roman', fontSize: 7 }}>   In Gms</Text>
                                                                </Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellNetWt]}>Net.Wt
                                                                        <Text style={{ fontFamily: 'Times-Roman', fontSize: 7 }}>             In Gms</Text>
                                                                </Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellRate]}>Rate</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellMC]}>MC</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellStAmt]}>St.Amt</Text>
                                                                <View style={styles.divider1} />

                                                                <Text style={[styles.tableCell, styles.tableCellTotal]}>Total</Text>
                                                        </View>
                                                        <View style={styles.horizontalLine} />

                                                        {/* Add rows of data below */}

                                                        <View style={[styles.tableRow, { fontFamily: 'Times-Roman' }]} >
                                                                <Text style={[styles.tableCell, styles.tableCellHeader]}>1</Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellDescription]}>
                                                                        {repairDetails.metal_type || "N/A"}-{repairDetails.product_name || "N/A"}
                                                                </Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellHSN]}>{matchedProduct?.hsn_code || "N/A"}</Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellQty]}>
                                                                        {repairDetails.qty || "0"}
                                                                </Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />
                                                                <Text style={[styles.tableCell, styles.tableCellPurity]}>
                                                                        {repairDetails.purity || "0.00"}
                                                                </Text>

                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellGrossWt]}>
                                                                        {repairDetails.gross_weight || "0.000"}
                                                                </Text>

                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellStoneWt]}>
                                                                        {repairDetails.stone_weight || "0.000"}
                                                                </Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellNetWt]}>
                                                                        {repairDetails.total_weight_av || "0.000"}
                                                                </Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellRate]}>
                                                                        {/* {repairDetails.rate || "0.00"} */}
                                                                        {repairDetails.pieace_cost ? repairDetails.pieace_cost : repairDetails.rate}
                                                                </Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellMC]}>
                                                                        {repairDetails.mc_per_gram != null && repairDetails.mc_per_gram !== ""
                                                                                ? (['gold', 'diamond', 'others'].includes(repairDetails.metal_type?.toLowerCase())
                                                                                        ? `${parseFloat(repairDetails.mc_per_gram)} %`
                                                                                        : parseFloat(repairDetails.mc_per_gram))
                                                                                : ''}
                                                                </Text>



                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellStAmt]}>
                                                                        {repairDetails.stone_price || "0.00"}
                                                                </Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                <Text style={[styles.tableCell, styles.tableCellTotal]}>
                                                                        {(parseFloat(repairDetails.rate_amt || 0) + parseFloat(repairDetails.stone_price || 0) + parseFloat(repairDetails.making_charges || 0)) || "0.00"}
                                                                </Text>
                                                        </View>



                                                </View>

                                                <View style={[styles.horizontalLine, { marginTop: -2 }]} />

                                                <View style={[styles.tableRow, { fontFamily: 'Times-Bold' }]}>
                                                        <Text style={[styles.tableCell, styles.tableCellHeader, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellDescription, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellHSN, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellQty, styles.lastheight]}>
                                                                {repairDetails.qty}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellPurity, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellGrossWt, styles.lastheight]}>
                                                                {repairDetails.gross_weight}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellStoneWt, styles.lastheight]}>
                                                                {/* {totalValues.stoneWeight} */}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellNetWt, styles.lastheight]}>
                                                                {repairDetails.total_weight_av}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellRate, styles.lastheight]}>
                                                                {/* {totalValues.rate} */}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellMC, styles.lastheight]}>
                                                                {/* {totalValues.makingCharges} */}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellStAmt, styles.lastheight]}>
                                                                {/* {totalValues.stonePrice} */}
                                                        </Text>
                                                        {/* <Text style={[styles.tableCell, styles.tableCellTotal, styles.lastheight]}>
                                                                {totalValues.rateAmount}
                                                        </Text> */}
                                                        <Text style={[styles.tableCell, styles.tableCellTotal, styles.lastheight]}>
                                                                {(parseFloat(repairDetails.rate_amt || 0) + parseFloat(repairDetails.stone_price || 0) + parseFloat(repairDetails.making_charges || 0)) || "0.00"}
                                                        </Text>
                                                </View>


                                                <View style={[styles.horizontalLine, { marginTop: -2 }]} />


                                                <View style={{ flexDirection: "row", justifyContent: "space-between", fontFamily: 'Times-Bold' }}>
                                                        {/* Left Side Content */}

                                                        <View style={{ paddingLeft: 10, marginTop: 20 }}>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Cash Recd: {Number(repairDetails.cash_amount || 0)}
                                                                </Text>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Card Recd: {Number(repairDetails.card_amt || 0)}
                                                                </Text>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Cheque Recd: {Number(repairDetails.chq_amt || 0)}
                                                                </Text>
                                                                <Text style={[styles.bold]}>
                                                                        NEFT Recd: {Number(repairDetails.online_amt || 0)} #: Bank:
                                                                </Text>
                                                                <Text style={[styles.bold]}>
                                                                        Balance Amount:{" "}
                                                                        {(
                                                                                Number(repairDetails.net_bill_amount || 0) -
                                                                                (
                                                                                        Number(repairDetails.cash_amount || 0) +
                                                                                        Number(repairDetails.chq_amt || 0) +
                                                                                        Number(repairDetails.card_amt || 0) +
                                                                                        Number(repairDetails.online_amt || 0)
                                                                                )
                                                                        ).toFixed(2)}
                                                                </Text>

                                                                {/* <Text style={{ fontWeight: 'bold', fontSize: '15px', color: 'green', marginLeft: '190px', marginTop: '15px' }}>
                                                                        Fest Discount: {festivalDiscountAmt}
                                                                </Text> */}
                                                        </View>
                                                        {/* {repairDetails.map((repairDetails, index) => ( */}
                                                        <View style={{ paddingRight: 10, marginTop: 5 }}>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) Discount:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{repairDetails?.discount ?? '0.00'}
                                                                        </Text>
                                                                </View>
                                                                {/* <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) Fest Discount:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{repairDetails.festivalDiscountAmt}</Text>
                                                                </View> */}
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>GST Value:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {repairDetails.taxable_amount}
                                                                        </Text>
                                                                </View>

                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>CGST @1.50%:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {(repairDetails.tax_amount / 2)}
                                                                        </Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>SGST @1.50%:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {(repairDetails.tax_amount / 2)}
                                                                        </Text>
                                                                </View>

                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }} >Net Bill Value: </Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {/* {(totalValues.rateAmount + totalValues.makingCharges + totalValues.stonePrice + taxAmount)} */}
                                                                                {repairDetails.net_amount}
                                                                        </Text>

                                                                </View>

                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) OLD:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{repairDetails.old_exchange_amt}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) SCHEME:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{repairDetails.scheme_amt}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) SALE RETURN:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{repairDetails.sale_return_amt}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>Net Amount:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {repairDetails.net_bill_amount}
                                                                        </Text>
                                                                </View>


                                                        </View>


                                                </View>
                                                <View style={{ textAlign: "center", fontFamily: 'Times-Bold' }}>
                                                        <Text>
                                                                (Rupees {netBillValueInWords} Only)
                                                        </Text>
                                                </View>

                                                <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between", marginBottom: 3, fontFamily: 'Times-Bold' }}>
                                                        {/* Left Side */}
                                                        <View style={{ alignrepairDetailss: "flex-start", paddingLeft: 10 }}>
                                                                <Text style={[styles.bold]}>For Customer</Text>
                                                        </View>

                                                        {/* Right Side */}
                                                        <View style={{ alignrepairDetailss: "flex-end", paddingRight: 10 }}>
                                                                <Text style={[styles.bold]}>For NEW FRIEND'S JEWELLERY</Text>
                                                        </View>

                                                </View>

                                                {/* <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                                        {qrCodeUrl && <Image style={styles.qrCode} src={qrCodeUrl} />}
                                                </View> */}




                                        </View>

                                </View>


                        </Page>
                </Document>
        );
};

export default TaxINVoiceReceipt;
