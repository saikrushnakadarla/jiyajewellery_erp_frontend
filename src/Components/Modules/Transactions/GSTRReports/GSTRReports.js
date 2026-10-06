import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button, Row, Col, Form } from "react-bootstrap";
import { FaFileExcel, FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DataTable from "../../../Pages/InputField/DataTable";
import baseURL from "../../../../Url/NodeBaseURL";
import "./GSTRReports.css";

// Same endpoint for both Sales and Purchase.
// The report type is sent as a query param: ?type=sales | purchase
const REPORT_URL = `${baseURL}/gstr-report`;

/* ---------------- Helpers ---------------- */
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

const toISODate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const fmt = (v) =>
  Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * The API returns taxable_value = 0 for every row, so derive it from the tax:
 *   taxable = total_tax * 100 / tax_rate
 * (verified: INV001 -> 3359.64 * 100 / 3 = 111,988.00)
 * If the API ever sends a real taxable_value, that is used as-is.
 */
const getTaxable = (r) => {
  const given = Number(r.taxable_value || 0);
  if (given > 0) return given;
  const rate = Number(r.tax_rate || 0);
  const tax =
    Number(r.total_tax || 0) ||
    Number(r.cgst || 0) + Number(r.sgst || 0) + Number(r.igst || 0);
  return rate > 0 ? round2((tax * 100) / rate) : 0;
};

// Normalise a row so Sales and Purchase share one shape
const normalize = (r) => ({
  ...r,
  invoice_number: r.invoice_number ?? r.invoice ?? "",
  line_total: r.line_total ?? r.net_amt ?? 0,
  invoice_value: r.invoice_value ?? r.line_total ?? r.net_amt ?? 0,
  product_name: r.product_name ?? r.hsn_code ?? "",
  qty: r.qty ?? r.pcs ?? 0,
  taxable_value: getTaxable(r),
});

const amountCell = ({ value }) => <div className="text-right-num">{fmt(value)}</div>;

const supplyCell = ({ value }) => (
  <span className={`gstr-badge ${value === "Inter-State" ? "inter" : "intra"}`}>
    {value}
  </span>
);

/* Totals are rebuilt from rows because API totals.taxable is 0 */
const buildTotals = (rows) => {
  const t = { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, invoiceValue: 0 };
  const seenInvoices = new Set();

  rows.forEach((r) => {
    t.taxable += r.taxable_value;
    t.cgst += Number(r.cgst || 0);
    t.sgst += Number(r.sgst || 0);
    t.igst += Number(r.igst || 0);
    t.tax += Number(r.total_tax || 0);

    // invoice_value repeats on every line of a multi-line invoice (e.g. INV008),
    // so count it once per invoice number.
    if (!seenInvoices.has(r.invoice_number)) {
      seenInvoices.add(r.invoice_number);
      t.invoiceValue += Number(r.invoice_value || 0);
    }
  });

  Object.keys(t).forEach((k) => (t[k] = round2(t[k])));
  return { totals: t, invoiceCount: seenInvoices.size };
};

const buildRateSummary = (rows) => {
  const map = {};
  rows.forEach((r) => {
    const key = Number(r.tax_rate || 0);
    if (!map[key]) map[key] = { tax_rate: key, taxable_value: 0, cgst: 0, sgst: 0, igst: 0 };
    map[key].taxable_value += r.taxable_value;
    map[key].cgst += Number(r.cgst || 0);
    map[key].sgst += Number(r.sgst || 0);
    map[key].igst += Number(r.igst || 0);
  });
  return Object.values(map)
    .map((s) => ({
      ...s,
      taxable_value: round2(s.taxable_value),
      cgst: round2(s.cgst),
      sgst: round2(s.sgst),
      igst: round2(s.igst),
    }))
    .sort((a, b) => b.tax_rate - a.tax_rate);
};

const GSTR1Report = () => {
  const now = new Date();
  const [fromDate, setFromDate] = useState(
    toISODate(new Date(now.getFullYear(), now.getMonth() - 6, 1))
  );
  const [toDate, setToDate] = useState(toISODate(now));
  const [type, setType] = useState("sales"); // sales | purchase
  const [activeTab, setActiveTab] = useState("b2b");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSales = type === "sales";

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(REPORT_URL, {
        params: { from_date: fromDate, to_date: toDate, type },
      });
      setData(response.data);
    } catch (err) {
      console.error("Error fetching GSTR report:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch report");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab("b2b");
    fetchReport();
    // eslint-disable-next-line
  }, [type]);

  /* ---------------- Normalised data ---------------- */
  const b2bRows = useMemo(() => (data?.b2b || []).map(normalize), [data]);
  // Sales -> b2c, Purchase -> b2c (same API). Falls back to "unregistered" if backend uses that key.
  const b2cRows = useMemo(
    () => (data?.b2c || data?.unregistered || []).map(normalize),
    [data]
  );
  const summaryRows = useMemo(
    () => buildRateSummary([...b2bRows, ...b2cRows]),
    [b2bRows, b2cRows]
  );
  const { totals, invoiceCount } = useMemo(
    () => buildTotals([...b2bRows, ...b2cRows]),
    [b2bRows, b2cRows]
  );

  /* ---------------- Columns ---------------- */
  const columns = useMemo(
    () => [
      { Header: "Sr. No.", Cell: ({ row }) => row.index + 1 },
      { Header: "Invoice No.", accessor: "invoice_number" },
      { Header: "Date", accessor: "date", Cell: ({ value }) => formatDate(value) },
      { Header: isSales ? "Account Name" : "Supplier", accessor: "account_name" },
      { Header: "GSTIN", accessor: "gst_in", Cell: ({ value }) => value || "-" },
      { Header: isSales ? "Product" : "Product / HSN", accessor: "product_name" },
      { Header: "Qty", accessor: "qty" },
      { Header: "Taxable Value", accessor: "taxable_value", Cell: amountCell },
      { Header: "Rate %", accessor: "tax_rate" },
      { Header: "CGST", accessor: "cgst", Cell: amountCell },
      { Header: "SGST", accessor: "sgst", Cell: amountCell },
      { Header: "IGST", accessor: "igst", Cell: amountCell },
      { Header: "Total Tax", accessor: "total_tax", Cell: amountCell },
      { Header: "Line Total", accessor: "line_total", Cell: amountCell },
      { Header: "Invoice Value", accessor: "invoice_value", Cell: amountCell },
      { Header: "Supply Type", accessor: "supply_type", Cell: supplyCell },
    ],
    [isSales]
  );

  const summaryColumns = useMemo(
    () => [
      { Header: "Sr. No.", Cell: ({ row }) => row.index + 1 },
      { Header: "Tax Rate %", accessor: "tax_rate" },
      { Header: "Taxable Value", accessor: "taxable_value", Cell: amountCell },
      { Header: "CGST", accessor: "cgst", Cell: amountCell },
      { Header: "SGST", accessor: "sgst", Cell: amountCell },
      { Header: "IGST", accessor: "igst", Cell: amountCell },
    ],
    []
  );

  /* ---------------- Tabs ---------------- */
  const tabs = [
    {
      key: "b2b",
      label: `${isSales ? "B2B (With GSTIN)" : "Registered Suppliers"} (${b2bRows.length})`,
    },
    {
      key: "b2c",
      label: `${isSales ? "B2C (Without GSTIN)" : "Unregistered Suppliers"} (${b2cRows.length})`,
    },
    { key: "summary", label: `Rate-wise Summary (${summaryRows.length})` },
  ];

  const tableProps = {
    b2b: { columns, rows: b2bRows },
    b2c: { columns, rows: b2cRows },
    summary: { columns: summaryColumns, rows: summaryRows },
  }[activeTab];

  const cards = [
    { label: "Taxable Value", value: totals.taxable },
    { label: "CGST", value: totals.cgst },
    { label: "SGST", value: totals.sgst },
    { label: "IGST", value: totals.igst },
    { label: "Total Tax", value: totals.tax },
    { label: "Invoice Value", value: totals.invoiceValue },
  ];

  /* ---------------- Excel ---------------- */
  const handleDownloadExcel = () => {
    if (!data) return;

    const mapRows = (rows) =>
      rows.map((r, i) => ({
        "Sr No": i + 1,
        "Invoice No": r.invoice_number,
        Date: formatDate(r.date),
        [isSales ? "Account Name" : "Supplier"]: r.account_name,
        GSTIN: r.gst_in || "",
        "Place of Supply": r.place_of_supply || "",
        Product: r.product_name,
        Qty: r.qty,
        "Taxable Value": r.taxable_value,
        "Rate %": r.tax_rate,
        CGST: r.cgst,
        SGST: r.sgst,
        IGST: r.igst,
        "Total Tax": r.total_tax,
        "Line Total": r.line_total,
        "Invoice Value": r.invoice_value,
        "Supply Type": r.supply_type,
      }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(mapRows(b2bRows)),
      isSales ? "B2B" : "Registered"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(mapRows(b2cRows)),
      isSales ? "B2C" : "Unregistered"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        summaryRows.map((s, i) => ({
          "Sr No": i + 1,
          "Tax Rate %": s.tax_rate,
          "Taxable Value": s.taxable_value,
          CGST: s.cgst,
          SGST: s.sgst,
          IGST: s.igst,
        }))
      ),
      "Rate Summary"
    );

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${isSales ? "GSTR1_Sales" : "GSTR_Purchase"}_${toISODate(new Date())}.xlsx`);
  };

  return (
    <div className="main-container">
      <div className="sales-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>{isSales ? "GSTR-1 Report (Sales)" : "GSTR Report (Purchases)"}</h3>

            <Button
              variant="success"
              onClick={handleDownloadExcel}
              disabled={!data}
              className="d-flex align-items-center gap-2"
            >
              <FaFileExcel />
              Download Excel
            </Button>
          </Col>
        </Row>

        {/* Filters */}
        <div className="gstr-filters">
          <div className="form-group">
            <label>Report Type</label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="sales">GSTR-1 (Sales)</option>
              <option value="purchase">Purchases (Inward)</option>
            </Form.Select>
          </div>
          <div className="form-group">
            <label>From Date</label>
            <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <Button
            variant="primary"
            onClick={fetchReport}
            disabled={loading}
            className="d-flex align-items-center gap-2"
          >
            <FaSearch />
            {loading ? "Loading..." : "Get Report"}
          </Button>
        </div>

        {error && <div className="gstr-error">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          data && (
            <>
              {/* Summary cards */}
              <div className="gstr-summary">
                {cards.map((c) => (
                  <div className="gstr-card" key={c.label}>
                    <div className="gstr-card-label">{c.label}</div>
                    {/* Fixed: removed the stray backticks that were printing literally */}
                    <div className="gstr-card-value">₹ {fmt(c.value)}</div>
                  </div>
                ))}
                <div className="gstr-card">
                  <div className="gstr-card-label">Invoices</div>
                  <div className="gstr-card-value">{invoiceCount}</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="gstr-tabs">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`gstr-tab-btn ${activeTab === t.key ? "active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="gstr-table-wrapper">
                <DataTable
                  key={`${type}-${activeTab}`}
                  columns={tableProps.columns}
                  data={tableProps.rows}
                />
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default GSTR1Report;