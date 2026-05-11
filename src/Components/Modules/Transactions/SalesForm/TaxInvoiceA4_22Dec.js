import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
// import logo1 from '../../../../Navbar/sadashri.png'
import logo1 from '../../../../Components/Pages/Images/newfriends_logo.jpg'
import { toWords } from "number-to-words";
import QRCode from "qrcode";
import baseURL from '../../../../Url/NodeBaseURL';
import axios from "axios";

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
                height: 80,
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
                alignItems: 'center',  // Centers the content horizontally
                padding: 20,
                marginTop: -45,
        },
        heading: {
                fontWeight: 'bold',
                fontSize: 10,
                textAlign: 'center',
                marginBottom: 5,
        },
        contentContainer: {
                flexDirection: 'row',  // Side by side layout
                alignItems: 'center',
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
                height: '100%',
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
                alignItems: "center",
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
        repairDetails,
        cash_amount,
        discountAmt,
        festivalDiscountAmt,
        card_amt,
        chq_amt,
        online_amt,
        taxableAmount,
        taxAmount,
        oldItemsAmount,
        schemeAmount,
        salesNetAmount,
        salesTaxableAmount,
        netAmount,
        netPayableAmount,
        product,
        company
}) => {
        const [qrCodeUrl, setQrCodeUrl] = useState("");
    
        useEffect(() => {
                const generateQRCode = async () => {
                        try {
                                const qrCodeDataUrl = await QRCode.toDataURL(repairDetails[0]?.invoice_number || "", {
                                        width: 100,
                                        margin: 2,
                                });
                                setQrCodeUrl(qrCodeDataUrl);
                        } catch (err) {
                                console.error("Error generating QR code:", err);
                        }
                };

                generateQRCode();
        }, [repairDetails]);

        // Calculate total values
        const totalValues = repairDetails.reduce(
                (totals, item) => {
                        return {
                                qty: totals.qty + Number(item.qty || 0),
                                grossWeight: totals.grossWeight + Number(item.gross_weight || 0),
                                stoneWeight: totals.stoneWeight + Number(item.stone_weight || 0),
                                netWeight: totals.netWeight + Number(item.total_weight_av || 0),
                                rate: totals.rate + Number(item.rate || 0),
                                makingCharges: totals.makingCharges + Number(item.making_charges || 0),
                                stonePrice: totals.stonePrice + Number(item.stone_price || 0),
                                rateAmount: totals.rateAmount + Number(item.rate_amt || 0),
                        };
                },
                {
                        qty: 0,
                        grossWeight: 0,
                        stoneWeight: 0,
                        netWeight: 0,
                        rate: 0,
                        makingCharges: 0,
                        stonePrice: 0,
                        rateAmount: 0,
                }
        );

        // Convert the value into words
        const netBillValueInWords = toWords(netPayableAmount).replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()); // Capitalize words
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
                                        <View style={[styles.column, { marginTop: 5, width: "25%", marginLeft: 20, fontFamily: "Times-Bold" }]}>
                                                <Text style={[styles.boldText, { marginBottom: 5 }]}>CUSTOMER DETAILS:</Text>
                                                <Text style={{ marginBottom: 4 }}>{formData.account_name || ""},</Text>
                                                <Text style={{ marginBottom: 4 }}>MOBILE: {formData.mobile}</Text>
                                                <Text style={{ marginBottom: 4 }}>GSTIN: {formData.gst_in}</Text>
                                                <Text style={{ marginBottom: 4 }}>PAN NO: {formData.pan_card}</Text>
                                                <Text style={{ marginBottom: 4 }}>Aadhar: {formData.aadhar_card}</Text>
                                                <Text style={{ marginBottom: 4 }}>Address: {formData.address1}, {formData.address2}, {formData.city}, {formData.state} - {formData.pincode}</Text>
                                        </View>
                                        {/* <View style={[styles.column, { width: "5%" }]}></View> */}

                                        <View style={[styles.column, { width: "40%" }]}>
                                                <Image style={styles.image1} src={logo1} />
                                        </View>

                                        {/* <View style={[styles.column, { width: "5%" }]}></View> */}

                                        <View style={[styles.column, { marginTop: 0, width: "25%", marginLeft: 20, fontFamily: "Times-Bold" }]}>
                                                <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 10, marginLeft: 20 }}>TAX INVOICE</Text>

                                                {/* BILL NO */}
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>BILL NO:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>{formData.invoice_number}</Text>
                                                </View>

                                                {/* DATE */}
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>DATE:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>{formatDate(formData.date)}</Text>
                                                </View>


                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>TIME:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>
                                                                {currentTime}
                                                        </Text>
                                                </View>


                                                {/* STAFF */}

                                                {/* GSTIN */}
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <Text>GSTIN:</Text>
                                                        <Text style={{ textAlign: "right", flex: 1 }}>
                                                                {company?.gst_no?.trim() ? company.gst_no : ""}
                                                        </Text>
                                                </View>




                                        </View>
                                </View>


                                <View style={styles.container}>
                                        {/* Centered Heading */}
                                        <Text style={[styles.heading, { fontFamily: 'Times-Bold' }]}>
                                                {company?.company_name?.toUpperCase() || ""}
                                        </Text>



                                        {/* Flat No. and Branch section */}
                                        <View style={styles.contentContainer}>

                                                {/* Flat No. Section */}
                                                <View style={{marginBottom:6}}>
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
                                        </View>

                                        {/* Horizontal Divider under both sections */}
                                        <View style={styles.horizontalLine1} />

                                        <View>
                                                <Text>
                                                        Mob : {company?.mobile?.toUpperCase() || ""}
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
                                                        {repairDetails.map((item, index) => {
                                                                const matchedProduct = product.find(product => product.product_name === item.category);

                                                                return (
                                                                        <View style={[styles.tableRow, { fontFamily: 'Times-Roman' }]} key={index}>
                                                                                <Text style={[styles.tableCell, styles.tableCellHeader]}>{index + 1}</Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellDescription]}>
                                                                                        {item.metal_type || "N/A"}-{item.product_name || "N/A"}
                                                                                </Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellHSN]}>{matchedProduct?.hsn_code || "7113"}</Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellQty]}>
                                                                                        {item.qty || "0"}
                                                                                </Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellPurity]}>
                                                                                        {(() => {
                                                                                                const category = item.metal_type?.toLowerCase();
                                                                                                if (category === "gold") return "22C";
                                                                                                if (category === "silver") return "22C";
                                                                                                if (category === "diamond") return "22C";
                                                                                                return "";
                                                                                        })()}
                                                                                </Text>
                                                                                {/* <Text style={[styles.tableCell, styles.tableCellPurity]}>
                                                                                        {(() => {
                                                                                                if (item.pricing === "By fixed") {
                                                                                                        return item.printing_purity || "";
                                                                                                }

                                                                                                const category = item.category?.toLowerCase();
                                                                                                if (category === "gold jewellery") return "91.6 HM";
                                                                                                if (category === "silver articles") return "92.5 Sterling";
                                                                                                if (category === "silver jewellery") return "80 HM";
                                                                                                if (category === "diamond jewellery") return "91.6 HM";
                                                                                                return "";
                                                                                        })()}
                                                                                </Text> */}
                                                                                {/* <Text style={[styles.tableCell, styles.tableCellPurity]}>
                                                                                        {item.printing_purity || "0.00"}
                                                                                </Text> */}

                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellGrossWt]}>
                                                                                        {item.gross_weight || "0.000"}
                                                                                </Text>

                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellStoneWt]}>
                                                                                        {item.stone_weight || "0.000"}
                                                                                </Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellNetWt]}>
                                                                                        {item.total_weight_av || "0.000"}
                                                                                </Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellRate]}>
                                                                                        {/* {item.rate || "0.00"} */}
                                                                                        {item.pieace_cost ? item.pieace_cost : item.rate}
                                                                                </Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellMC]}>
                                                                                        {item.mc_per_gram != null && item.mc_per_gram !== ""
                                                                                                ? (['gold', 'diamond', 'others'].includes(item.metal_type?.toLowerCase())
                                                                                                        ? `${parseFloat(item.mc_per_gram).toFixed(2)} %`
                                                                                                        : parseFloat(item.mc_per_gram).toFixed(2))
                                                                                                : ''}
                                                                                </Text>



                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellStAmt]}>
                                                                                        {item.stone_price || "0.00"}
                                                                                </Text>
                                                                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                                                                <Text style={[styles.tableCell, styles.tableCellTotal]}>
                                                                                        {(parseFloat(item.rate_amt || 0) + parseFloat(item.stone_price || 0) + parseFloat(item.making_charges || 0)).toFixed(2) || "0.00"}
                                                                                </Text>
                                                                        </View>
                                                                );
                                                        })}


                                                </View>

                                                <View style={[styles.horizontalLine, { marginTop: -2 }]} />

                                                <View style={[styles.tableRow, { fontFamily: 'Times-Bold' }]}>
                                                        <Text style={[styles.tableCell, styles.tableCellHeader, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellDescription, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellHSN, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellQty, styles.lastheight]}>
                                                                {Math.round(totalValues.qty)}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellPurity, styles.lastheight]}></Text>
                                                        <Text style={[styles.tableCell, styles.tableCellGrossWt, styles.lastheight]}>
                                                                {totalValues.grossWeight.toFixed(3)}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellStoneWt, styles.lastheight]}>
                                                                {/* {totalValues.stoneWeight.toFixed(2)} */}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellNetWt, styles.lastheight]}>
                                                                {totalValues.netWeight.toFixed(3)}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellRate, styles.lastheight]}>
                                                                {/* {totalValues.rate.toFixed(2)} */}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellMC, styles.lastheight]}>
                                                                {/* {totalValues.makingCharges.toFixed(2)} */}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.tableCellStAmt, styles.lastheight]}>
                                                                {/* {totalValues.stonePrice.toFixed(2)} */}
                                                        </Text>
                                                        {/* <Text style={[styles.tableCell, styles.tableCellTotal, styles.lastheight]}>
                                                                {totalValues.rateAmount.toFixed(2)}
                                                        </Text> */}
                                                        <Text style={[styles.tableCell, styles.tableCellTotal, styles.lastheight]}>
                                                                {(totalValues.rateAmount + totalValues.makingCharges + totalValues.stonePrice).toFixed(2)}
                                                        </Text>
                                                </View>


                                                <View style={[styles.horizontalLine, { marginTop: -2 }]} />


                                                <View style={{ flexDirection: "row", justifyContent: "space-between", fontFamily: 'Times-Bold' }}>
                                                        {/* Left Side Content */}

                                                        <View style={{ paddingLeft: 10, marginTop: 20 }}>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Cash Recd: {Number(cash_amount || 0).toFixed(2)}
                                                                </Text>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Card Recd: {Number(card_amt || 0).toFixed(2)}
                                                                </Text>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Cheque Recd: {Number(chq_amt || 0).toFixed(2)}
                                                                </Text>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        NEFT Recd: {Number(online_amt || 0).toFixed(2)} #: Bank:
                                                                </Text>

                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Balance Amount:{" "}
                                                                        {(
                                                                                Math.round(Number(netPayableAmount || 0)) -
                                                                                (Number(cash_amount || 0) +
                                                                                        Number(chq_amt || 0) +
                                                                                        Number(card_amt || 0) +
                                                                                        Number(online_amt || 0))
                                                                        ).toFixed(2)}
                                                                </Text>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Bank A/C No : {company?.bank_account_no || ""}
                                                                </Text>
                                                                <Text style={[styles.bold, { marginBottom: 3 }]}>
                                                                        Bank A/C Name : {company?.bank_name || ""}
                                                                </Text>

                                                                <Text style={{ fontWeight: 'bold', fontSize: '15px', color: 'green', marginLeft: '190px', marginTop: '15px' }}>
                                                                        Fest Discount: {festivalDiscountAmt.toFixed(2)}
                                                                </Text>
                                                        </View>
                                                        {/* {repairDetails.map((item, index) => ( */}
                                                        <View style={{ paddingRight: 10, marginTop: 5 }}>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) Discount:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{discountAmt.toFixed(2)}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) Fest Discount:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{festivalDiscountAmt.toFixed(2)}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>GST Value:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {taxableAmount.toFixed(2)}
                                                                        </Text>
                                                                </View>

                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>CGST @1.50%:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {(taxAmount / 2).toFixed(2)}
                                                                        </Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>SGST @1.50%:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {(taxAmount / 2).toFixed(2)}
                                                                        </Text>
                                                                </View>

                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }} >Net Bill Value: </Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {/* {(totalValues.rateAmount + totalValues.makingCharges + totalValues.stonePrice + taxAmount).toFixed(2)} */}
                                                                                {netAmount.toFixed(2)}
                                                                        </Text>

                                                                </View>

                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) OLD:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{oldItemsAmount.toFixed(2)}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) SCHEME:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{schemeAmount.toFixed(2)}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>(-) SALE RETURN:</Text>
                                                                        <Text style={{ textAlign: "right" }}>{salesNetAmount.toFixed(2)}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                                                                        <Text style={{ marginRight: "10px" }}>Net Amount:</Text>
                                                                        <Text style={{ textAlign: "right" }}>
                                                                                {Math.round(netPayableAmount).toFixed(2)}
                                                                        </Text>
                                                                </View>


                                                        </View>


                                                </View>
                                                <View style={{ alignItems: "center", fontFamily: 'Times-Bold', marginTop: 10 }}>
                                                        <Text>
                                                                (Rupees {netBillValueInWords} Only)
                                                        </Text>
                                                </View>

                                                <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between", marginBottom: 3, fontFamily: 'Times-Bold' }}>
                                                        {/* Left Side */}
                                                        <View style={{ alignItems: "flex-start", paddingLeft: 10 }}>
                                                                <Text style={[styles.bold]}>For Customer</Text>
                                                        </View>

                                                        {/* Right Side */}
                                                        <View style={{ alignItems: "flex-end", paddingRight: 10 }}>
                                                                <Text style={[styles.bold]}>For {company?.company_name?.toUpperCase() || ""}</Text>
                                                        </View>

                                                </View>

                                                <View
                                                        style={{
                                                                flexDirection: "row",
                                                                justifyContent: "center", // horizontal center
                                                                alignItems: "center",     // vertical center
                                                        }}
                                                >
                                                        {qrCodeUrl && (
                                                                <Image
                                                                        source={{ uri: qrCodeUrl }}   // ✅ React Native uses source, not src
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

export default TaxINVoiceReceipt;
