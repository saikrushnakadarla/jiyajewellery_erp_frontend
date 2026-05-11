import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo1 from '../../../../Navbar/Company_logo.png'
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
        marginTop: 0,

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
        alignformDatas: 'center',  // Centers the content horizontally
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
        flexDirection: 'row',  // Side by side layout
        alignformDatas: 'center',
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
        width: '18%',
        textAlign: 'left',
        marginTop: '-4'
    },
    tableCellHSN: {
        width: '14%',
        textAlign: 'center',
        marginTop: '-4'
    },
    tableCellQty: {
        width: '5%',
        textAlign: 'center',
        marginTop: '-4'
    },
    tableCellPurity: {
        width: '12%',
        textAlign: 'left',
        marginTop: '-4'
    },
    tableCellGrossWt: {
        width: '14%',
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
        marginTop: '-4',
        marginLeft:50
    },

    lastheight: {
        height: 28,
        // marginTop:'10'
    },
    qrCodeContainer: {
        alignformDatas: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    qrCode: {
        width: 100,
        height: 100,
    },
});

const TaxINVoiceReceipt = ({
    formData,



}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState("");
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
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchProducts();
    // }, []);

    // useEffect(() => {
    //     const generateQRCode = async () => {
    //         try {
    //             const qrCodeDataUrl = await QRCode.toDataURL(repairDetails[0]?.invoice_number || "", {
    //                 width: 100,
    //                 margin: 2,
    //             });
    //             setQrCodeUrl(qrCodeDataUrl);
    //         } catch (err) {
    //             console.error("Error generating QR code:", err);
    //         }
    //     };

    //     generateQRCode();
    // }, [repairDetails]);

    // Calculate total values
    // const totalValues = repairDetails.reduce(
    //     (totals, formData) => {
    //         return {
    //             qty: totals.qty + Number(formData.qty || 0),
    //             grossWeight: totals.grossWeight + Number(formData.gross_weight || 0),
    //             stoneWeight: totals.stoneWeight + Number(formData.stone_weight || 0),
    //             netWeight: totals.netWeight + Number(formData.total_weight_av || 0),
    //             rate: totals.rate + Number(formData.rate || 0),
    //             makingCharges: totals.makingCharges + Number(formData.making_charges || 0),
    //             stonePrice: totals.stonePrice + Number(formData.stone_price || 0),
    //             rateAmount: totals.rateAmount + Number(formData.rate_amt || 0),
    //         };
    //     },
    //     {
    //         qty: 0,
    //         grossWeight: 0,
    //         stoneWeight: 0,
    //         netWeight: 0,
    //         rate: 0,
    //         makingCharges: 0,
    //         stonePrice: 0,
    //         rateAmount: 0,
    //     }
    // );

    // Convert the value into words
    // const netBillValueInWords = toWords(netPayableAmount).replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()); // Capitalize words
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };



    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* First Row */}
                <View style={styles.row}>
                    <View style={[styles.column, { marginTop: 20, width: "20%", marginLeft: 20, fontFamily: "Times-Bold" }]}>
                        <Text style={[styles.boldText, { marginBottom: 5 }]}>CUSTOMER DETAILS:</Text>
                        <Text style={{ marginBottom: 5 }}>{formData.account_name || ""},</Text>
                        <Text style={{ marginBottom: 5 }}>{formData.city}</Text>
                        <Text style={{ marginBottom: 5 }}>MOBILE: {formData.mobile}</Text>
                        {/* <Text style={{ marginBottom: 5 }}>PAN NO: {formData.pan_card}</Text> */}
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
                            <Text style={{ textAlign: "right", flex: 1 }}>{formData.repair_no}</Text>
                        </View>

                        {/* DATE */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                            <Text>DATE:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>{formatDate(formData.date)}</Text>
                        </View>
                        {/* <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                            <View style={{ flexDirection: "row" }}>
                                <Text>Delivery Date: </Text>
                                <Text style={{ marginLeft: '5px' }}>{formatDate(new Date())}</Text>
                               
                                <Text style={{ marginLeft: '5px' }}>{currentTime}</Text>
                            </View>
                        </View> */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                            <Text>DELIVERY DATE:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>{formatDate(new Date())}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                            <Text>TIME:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>{currentTime}</Text>
                        </View>

                        {/* STAFF */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                            <Text>STAFF:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>Sadashri Jewels</Text>
                        </View>

                        {/* GSTIN */}
                        {/* <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                            <Text>GSTIN:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>29ABMCS9253K1ZG</Text>
                        </View> */}
                    </View>
                </View>


                <View style={styles.container}>
                    {/* Centered Heading */}
                    <Text style={[styles.heading, { fontFamily: 'Times-Bold' }]}>SADASHRI VENTURES PRIVATE LIMITED</Text>

                    {/* Flat No. and Branch section */}
                    <View style={styles.contentContainer}>

                        {/* Flat No. Section */}
                        <View style={styles.leftColumn}>
                            <Text style={styles.flatNo}>Flat No : 1323/1324, 16th B Cross Housing </Text>
                            <Text style={styles.cin}>Board Colony EWS 3rd Phase, Yelahanka New </Text>
                            <Text style={styles.cin}>Town, Bengaluru Urban, Karnataka - 560064.</Text>
                            <Text style={styles.cin}>CIN : U46498KA2024PTC185784</Text>

                        </View>

                        {/* Vertical Divider */}
                        <View style={styles.divider1} />

                        {/* Branch Section */}
                        <View style={styles.rightColumn}>
                            <Text style={[styles.branch, { fontFamily: 'Times-Bold' }]}>BRANCH:</Text>
                            <Text style={styles.branchContent}>Shop no. 1 No.2063, Dairy Circle, </Text>
                            <Text style={styles.branchContent}> Asha Arcade, 16th B Cross Rd,</Text>
                            <Text style={styles.branchContent}>Yalahanka New Town, Bangalore - 064</Text>
                        </View>
                    </View>

                    {/* Horizontal Divider under both sections */}
                    <View style={styles.horizontalLine1} />

                    <View style={{textAlign:'center'}}>
                        <Text>
                            Mob : 9964644424 EMAIL : sadashri.Yel@gmail.com
                        </Text>
                    </View>


                    <View style={styles.boxContainer}>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, { fontFamily: 'Times-Bold' }]}>
                                <Text style={[styles.tableCell, styles.tableCellHeader]}>SI</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellDescription]}>Category</Text>
                                <View style={styles.divider1} />


                                <Text style={[styles.tableCell, styles.tableCellDescription]}>Item</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellHSN]}>MetalType</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellPurity]}>Purity</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellGrossWt]}>Gross.Wt
                                    <Text style={{ fontFamily: 'Times-Roman', fontSize: 7 }}>  In Gms</Text>
                                </Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellTotal]}>Total</Text>
                            </View>
                            <View style={styles.horizontalLine} />

                            <View style={[styles.tableRow, { fontFamily: 'Times-Roman' }]} >
                                <Text style={[styles.tableCell, styles.tableCellHeader]}>1</Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellDescription]}>
                                    {formData.category || "N/A"}
                                </Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />


                                <Text style={[styles.tableCell, styles.tableCellDescription]}>
                                    {formData.item || "N/A"}
                                </Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellHSN]}>
                                    {formData.metal_type || "N/A"}
                                </Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellPurity]}>
                                    {formData.purity}
                                </Text>
                               
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellGrossWt]}>
                                    {formData.gross_weight || "0.000"}
                                </Text>

                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellTotal]}>
                                   {formData.total_amt}
                                </Text>
                            </View>
                       
                        </View>

                        <View style={[styles.horizontalLine, { marginTop: -2 }]} />




                        <View style={[styles.horizontalLine, { marginTop: -2 }]} />


                        <View style={{ flexDirection: "row", justifyContent: "space-between", fontFamily: 'Times-Bold' }}>
                            {/* Left Side Content */}

                            <View style={{ paddingLeft: 10, marginTop: 20 }}>
                              
                            </View>
                           
                            <View style={{ paddingRight: 10, marginTop: 5 }}>
                                

                    
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                    <Text style={{ marginRight: "10px" }}>Total Amount:</Text>
                                    <Text style={{ textAlign: "right" }}>
                                        {Math.round(formData.total_amt).toFixed(2)}
                                    </Text>
                                </View>


                            </View>


                        </View>
                        <View style={{ alignformDatas: "center", fontFamily: 'Times-Bold' }}>
                          
                        </View>

                        <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between", marginBottom: 3, fontFamily: 'Times-Bold' }}>
                            {/* Left Side */}
                            <View style={{ alignformDatas: "flex-start", paddingLeft: 10 }}>
                                <Text style={[styles.bold]}>For Customer</Text>
                            </View>

                            {/* Right Side */}
                            <View style={{ alignformDatas: "flex-end", paddingRight: 10 }}>
                                <Text style={[styles.bold]}>For SADASHRI VENTURES PRIVATE LIMITED</Text>
                            </View>

                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                            {qrCodeUrl && <Image style={styles.qrCode} src={qrCodeUrl} />}
                        </View>




                    </View>

                </View>


            </Page>
        </Document>
    );
};

export default TaxINVoiceReceipt;
