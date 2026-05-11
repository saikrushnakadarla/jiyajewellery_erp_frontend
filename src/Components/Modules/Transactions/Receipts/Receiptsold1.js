const PDFContent = ({formData}) => (
  <Document>
    <Page size={[250, 500]} style={styles.page}>
      {/* Heading */}
      <Text style={styles.heading}>Receipt</Text>

      {/* Details */}
      <View>
        <View style={styles.row}>
          <Text style={styles.leftText}>Receipt No:{formData.receipt_no} </Text>
          <Text style={styles.rightText}>Account Name:{formData.account_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.leftText}>Date:{formData.date}</Text>
          <Text style={styles.rightText}>Time:{currentTime}</Text>
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
        <Text style={[styles.tableCell, styles.inv]}>{formData.invoice_number}</Text>
        <Text style={[styles.tableCell, styles.totalAmt]}>{formData.total_amt}</Text>
        <Text style={[styles.tableCell, styles.balanceAmt]}>{formData.discount_amt}</Text>
        <Text style={[styles.tableCell, styles.paidAmt]}>{formData.cash_amt}</Text>
      </View>
    </Page>
  </Document>
);