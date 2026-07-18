import React, { useState, useEffect, useMemo, useCallback } from "react";

// ============================================================================
// DAY BOOK — Stock Ledger for Warehouse Inward / Outward movements
// Plain JavaScript, no TypeScript types anywhere.
//
// KEY FIX IN THIS VERSION:
// The API's "transfer_date" / "return_date" fields have NO time-of-day —
// they are always midnight IST (e.g. "2026-07-17T18:30:00.000Z" = midnight
// IST on 2026-07-18). Every transaction on the same calendar day shares the
// exact same transfer_date value. Using that field for sort order meant all
// same-day rows had an identical timestamp, so the sort fell back to the
// API's own array order — which is newest-first — and a fresh "From Admin"
// transfer always landed at the top.
//
// Fix: keep transfer_date/return_date for grouping into the correct calendar
// day (dateKey), but use created_at — which has the real time of creation —
// for ordering rows within that day (ts).
// ============================================================================

const API_BASE = "http://localhost:5001";

const ENDPOINTS = {
  stockTransfers: `${API_BASE}/api/stock-transfer/get-stock-transfers`,
  receivedTransfers: `${API_BASE}/api/received-salesman/get-received-transfers`,
  returnTransfers: `${API_BASE}/api/return-to-main-stock/get-return-transfers`,
  assignedTransfers: `${API_BASE}/api/assigned-salesman/get-assigned-transfers`,
};

const DETAIL_ENDPOINTS = {
  "inward-main": (id) => `${API_BASE}/api/stock-transfer/get-stock-transfer/${id}`,
  "inward-salesman": (id) => `${API_BASE}/api/received-salesman/get-received-transfer/${id}`,
  "outward-main": (id) => `${API_BASE}/api/return-to-main-stock/get-return-transfer/${id}`,
  "outward-salesman": (id) => `${API_BASE}/api/assigned-salesman/get-assigned-transfer/${id}`,
};

// Detail endpoints return { transfer_details / return_details, transfer_items / return_items }
// Keep both possible "items" keys per type so we never end up parsing the wrong shape.
const DETAIL_ITEMS_KEY = {
  "inward-main": "transfer_items",
  "inward-salesman": "transfer_items",
  "outward-main": "return_items",
  "outward-salesman": "transfer_items",
};

const TYPE_META = {
  "inward-main": {
    label: "Inward from Main",
    group: "inward",
    short: "IN · Main",
    code: "op",
    tone: "#2F4A3C",
    order: 0,
  },
  "outward-salesman": {
    label: "Outward to Salesman",
    group: "outward",
    short: "OUT · Salesman",
    code: "to sm",
    tone: "#6E3B28",
    order: 1,
  },
  "inward-salesman": {
    label: "Inward from Salesman",
    group: "inward",
    short: "IN · Salesman",
    code: "from sm",
    tone: "#2F4A3C",
    order: 2,
  },
  "outward-main": {
    label: "Outward to Main",
    group: "outward",
    short: "OUT · Main",
    code: "to admin",
    tone: "#6E3B28",
    order: 3,
  },
};

const GROUP_ORDER = ["inward-main", "outward-salesman", "inward-salesman", "outward-main"];

function toNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function toDateKey(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Unknown/missing/unparsable timestamps sort LAST (never first), so a record
// with no usable date never jumps to the top of a day's list.
function toTimestamp(isoStr) {
  if (!isoStr) return Number.MAX_SAFE_INTEGER;
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? Number.MAX_SAFE_INTEGER : d.getTime();
}

function formatDateKeyLong(key) {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}

function todayKeyIST() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function fmtNum(n, digits = 3) {
  return toNum(n).toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtMoney(n) {
  return toNum(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DayBook() {
  const [raw, setRaw] = useState({
    stockTransfers: [],
    receivedTransfers: [],
    returnTransfers: [],
    assignedTransfers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMonth, setViewMonth] = useState(() => {
    const t = todayKeyIST().split("-").map(Number);
    return { year: t[0], month: t[1] - 1 };
  });
  const [selectedKey, setSelectedKey] = useState(todayKeyIST());

  const [expandedTxn, setExpandedTxn] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);
  const [detailError, setDetailError] = useState(null);

  const currentUserStockRoom = useMemo(() => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId === '2') {
        return '2ND STOCK ROOM';
      }
      return localStorage.getItem('userName') || '';
    } catch (e) {
      return '';
    }
  }, []);

  const currentUserId = useMemo(() => {
    try {
      return localStorage.getItem('userId') || '';
    } catch (e) {
      return '';
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = Object.entries(ENDPOINTS);
      const results = await Promise.all(
        entries.map(async ([key, url]) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`${key} failed (${res.status})`);
          const data = await res.json();
          return [key, Array.isArray(data) ? data : []];
        })
      );
      const next = {};
      results.forEach(([key, arr]) => {
        next[key] = arr;
      });
      setRaw(next);
    } catch (err) {
      setError(err.message || "Failed to reach the warehouse API. Is the server running on port 5001?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Normalize all four sources into one flat ledger of records
  const records = useMemo(() => {
    const list = [];

    raw.stockTransfers.forEach((t) => {
      if (currentUserStockRoom &&
          t.to_stock_point_name !== currentUserStockRoom &&
          t.from_stock_point_name !== currentUserStockRoom) {
        return;
      }
      list.push({
        key: `inward-main-${t.transfer_id}`,
        type: "inward-main",
        id: t.transfer_id,
        number: t.transfer_number,
        // dateKey: which calendar day this belongs to (business transfer date)
        dateKey: toDateKey(t.transfer_date),
        // ts: real creation time, used purely for ordering rows within a day
        ts: toTimestamp(t.created_at || t.transfer_date),
        qty: toNum(t.total_quantity),
        gross: toNum(t.total_gross_weight),
        net: toNum(t.total_net_weight),
        items: toNum(t.total_items),
        from: t.from_stock_point_name || t.from_warehouse_name,
        to: t.to_stock_point_name || t.to_warehouse_name,
        remarks: t.remarks,
        status: t.status,
        capture: t.capture_image,
      });
    });

    raw.receivedTransfers.forEach((t) => {
      if (currentUserStockRoom &&
          t.to_stock_point_name !== currentUserStockRoom &&
          t.from_salesman_name !== currentUserStockRoom) {
        return;
      }
      list.push({
        key: `inward-salesman-${t.received_id}`,
        type: "inward-salesman",
        id: t.received_id,
        number: t.received_number,
        dateKey: toDateKey(t.transfer_date),
        ts: toTimestamp(t.created_at || t.transfer_date),
        qty: toNum(t.total_quantity),
        gross: toNum(t.total_gross_weight),
        net: toNum(t.total_net_weight),
        items: toNum(t.total_items),
        from: t.from_salesman_name,
        to: t.to_stock_point_name,
        remarks: t.remarks,
        status: t.status,
        capture: t.capture_image,
      });
    });

    raw.returnTransfers.forEach((t) => {
      if (
        currentUserId &&
        String(t.from_user_id) !== String(currentUserId) &&
        String(t.to_user_id) !== String(currentUserId)
      ) {
        return;
      }
      list.push({
        key: `outward-main-${t.return_id}`,
        type: "outward-main",
        id: t.return_id,
        number: t.return_number,
        dateKey: toDateKey(t.return_date),
        ts: toTimestamp(t.created_at || t.return_date),
        qty: toNum(t.total_quantity),
        gross: toNum(t.total_gross_weight),
        net: toNum(t.total_net_weight),
        items: toNum(t.total_items),
        from: t.from_stock_point_name,
        to: t.to_stock_point_name || "Main Stock",
        remarks: t.remarks,
        status: t.status,
        capture: t.capture_image,
      });
    });

    raw.assignedTransfers.forEach((t) => {
      if (currentUserStockRoom &&
          t.from_stock_point_name !== currentUserStockRoom &&
          t.to_salesman_name !== currentUserStockRoom) {
        return;
      }
      list.push({
        key: `outward-salesman-${t.assigned_id}`,
        type: "outward-salesman",
        id: t.assigned_id,
        number: t.assigned_number,
        dateKey: toDateKey(t.transfer_date),
        ts: toTimestamp(t.created_at || t.transfer_date),
        qty: toNum(t.total_quantity),
        gross: toNum(t.total_gross_weight),
        net: toNum(t.total_net_weight),
        items: toNum(t.total_items),
        from: t.from_stock_point_name,
        to: t.to_salesman_name,
        remarks: t.remarks,
        status: t.status,
        capture: t.capture_image,
      });
    });

    // Sort records chronologically by real creation time. Tiebreak by id so
    // that even if two records somehow share a timestamp, the one created
    // later (higher id, assigned in creation order) still sorts after.
    list.sort((a, b) => (a.ts || 0) - (b.ts || 0) || (a.id - b.id));
    return list;
  }, [raw, currentUserStockRoom, currentUserId]);

  // Group by day, and within each day, by transaction type
  const byDate = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!r.dateKey) return;
      if (!map[r.dateKey]) {
        map[r.dateKey] = {
          byType: {
            "inward-main": [],
            "outward-salesman": [],
            "inward-salesman": [],
            "outward-main": [],
          },
          inward: [],
          outward: [],
          inwardQty: 0,
          outwardQty: 0,
          inwardNet: 0,
          outwardNet: 0,
          inwardGross: 0,
          outwardGross: 0,
        };
      }
      const bucket = map[r.dateKey];
      bucket.byType[r.type].push(r);
      const group = TYPE_META[r.type].group;
      if (group === "inward") {
        bucket.inward.push(r);
        bucket.inwardQty += r.qty;
        bucket.inwardNet += r.net;
        bucket.inwardGross += r.gross;
      } else {
        bucket.outward.push(r);
        bucket.outwardQty += r.qty;
        bucket.outwardNet += r.net;
        bucket.outwardGross += r.gross;
      }
    });
    // sort every list chronologically ascending (by real creation time)
    const byTs = (a, b) => (a.ts || 0) - (b.ts || 0) || (a.id - b.id);
    Object.values(map).forEach((bucket) => {
      bucket.inward.sort(byTs);
      bucket.outward.sort(byTs);
      GROUP_ORDER.forEach((t) => bucket.byType[t].sort(byTs));
    });
    return map;
  }, [records]);

  const grandTotals = useMemo(() => {
    let inwardQty = 0, outwardQty = 0, inwardNet = 0, outwardNet = 0, inwardGross = 0, outwardGross = 0;
    records.forEach((r) => {
      const group = TYPE_META[r.type].group;
      if (group === "inward") {
        inwardQty += r.qty;
        inwardNet += r.net;
        inwardGross += r.gross;
      } else {
        outwardQty += r.qty;
        outwardNet += r.net;
        outwardGross += r.gross;
      }
    });
    return {
      inwardQty, outwardQty, inwardNet, outwardNet, inwardGross, outwardGross,
      balanceQty: inwardQty - outwardQty,
      balanceNet: inwardNet - outwardNet,
    };
  }, [records]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const startWeekday = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push(key);
    }
    return cells;
  }, [viewMonth]);

  const monthLabel = useMemo(() => {
    const dt = new Date(Date.UTC(viewMonth.year, viewMonth.month, 1));
    return new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "long", year: "numeric" }).format(dt);
  }, [viewMonth]);

  const changeMonth = (delta) => {
    setViewMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { year: y, month: m };
    });
  };

  const selectedBucket = byDate[selectedKey] || {
    byType: {
      "inward-main": [],
      "outward-salesman": [],
      "inward-salesman": [],
      "outward-main": [],
    },
    inward: [],
    outward: [],
    inwardQty: 0,
    outwardQty: 0,
    inwardNet: 0,
    outwardNet: 0,
    inwardGross: 0,
    outwardGross: 0,
  };

  const toggleExpand = async (record) => {
    const key = record.key;
    if (expandedTxn === key) {
      setExpandedTxn(null);
      return;
    }
    setExpandedTxn(key);
    setDetailError(null);
    if (detailCache[key]) return;
    setDetailLoading(key);
    try {
      const url = DETAIL_ENDPOINTS[record.type](record.id);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Detail fetch failed (${res.status})`);
      const data = await res.json();
      const itemsKey = DETAIL_ITEMS_KEY[record.type];
      const items = Array.isArray(data[itemsKey]) ? data[itemsKey] : [];
      setDetailCache((prev) => ({ ...prev, [key]: items }));
    } catch (err) {
      setDetailError(err.message || "Could not load item detail.");
    } finally {
      setDetailLoading(null);
    }
  };

  const todayKey = todayKeyIST();

  // allEntries: opening balance row + every transaction for the selected day,
  // in TRUE chronological order (by real creation time, ts), never grouped
  // by fixed type order. This is what keeps a brand-new entry appended at
  // the bottom of the day instead of jumping to the top.
  const allEntries = useMemo(() => {
    const entries = [];

    // 1. Opening balance = sum of all inward/outward from days BEFORE selectedKey
    const prevRecords = records.filter(r => r.dateKey < selectedKey);
    const openingBalance = prevRecords.reduce((sum, r) => {
      const group = TYPE_META[r.type].group;
      return sum + (group === "inward" ? r.qty : -r.qty);
    }, 0);

    // 2. Add opening row (always show)
    entries.push({
      isOpening: true,
      type: 'opening',
      des: 'Op',
      opening: 'Op',
      gross: '—',
      inWard: openingBalance > 0 ? fmtNum(openingBalance, 0) : '—',
      outWard: openingBalance < 0 ? fmtNum(Math.abs(openingBalance), 0) : '—',
      balance: fmtNum(openingBalance, 0),
      key: 'opening-entry',
    });

    let cumulativeBalance = openingBalance;

    // 3. Process ALL of today's transactions in true chronological order
    //    (by real creation timestamp), regardless of type.
    const todaysRecordsChrono = records
      .filter((r) => r.dateKey === selectedKey)
      .sort((a, b) => (a.ts || 0) - (b.ts || 0) || (a.id - b.id));

    todaysRecordsChrono.forEach((r) => {
      const isInward = TYPE_META[r.type].group === "inward";
      const des = getDesValue(r.type);

      if (isInward) {
        cumulativeBalance += r.qty;
      } else {
        cumulativeBalance -= r.qty;
      }

      entries.push({
        isOpening: false,
        type: r.type,
        record: r,
        des: des,
        opening: '—',
        gross: fmtNum(r.gross),
        inWard: isInward ? fmtNum(r.qty, 0) : '—',
        outWard: !isInward ? fmtNum(r.qty, 0) : '—',
        balance: fmtNum(cumulativeBalance, 0),
        key: r.key,
      });
    });

    return entries;
  }, [selectedKey, records]);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .db-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .db-scrollbar::-webkit-scrollbar-thumb { background: #C9BFA6; border-radius: 4px; }
        .db-daybtn:hover:not(.db-daybtn-empty) { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(35,32,25,0.15); }
        .db-row:hover { background: #FBF8F0; }
        .db-navbtn:hover { background: #232019; color: #F1ECE0; }
        .db-opening-row { background: #F5F2EA; }
        .db-opening-row:hover { background: #F5F2EA; }
        .db-transfer-details { font-size: 11px; color: #5B5442; margin-top: 2px; padding-left: 4px; }
        .db-remarks { font-size: 11px; color: #8A806B; margin-top: 2px; font-style: italic; padding-left: 4px; }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.stampCircle}>DB</div>
          <div>
            <div style={styles.eyebrow}>Warehouse Ledger</div>
            <h1 style={styles.title}>Day Book</h1>
            {currentUserStockRoom && (
              <div style={styles.userRoomTag}>📍 {currentUserStockRoom}</div>
            )}
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.headerNote}>Stock movement, entered day by day</div>
          <button style={styles.refreshBtn} onClick={loadAll} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh Ledger"}
          </button>
        </div>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          Could not load the ledger — {error}
        </div>
      )}

      {/* TOTALS STRIP */}
      <section style={styles.totalsStrip}>
        <TotalCard label="Total Inward (Qty)" value={`${fmtNum(grandTotals.inwardQty, 0)} Pcs`} sub={`${fmtNum(grandTotals.inwardGross)} g gross`} tone="forest" />
        <TotalCard label="Total Outward (Qty)" value={`${fmtNum(grandTotals.outwardQty, 0)} Pcs`} sub={`${fmtNum(grandTotals.outwardGross)} g gross`} tone="rust" />
        <TotalCard label="Net Stock Balance (Qty)" value={`${fmtNum(grandTotals.balanceQty, 0)} Pcs`} sub={`${fmtNum(grandTotals.balanceNet)} g net wt`} tone="brass" emphasis />
        <TotalCard label="Net Weight Balance" value={`${fmtNum(grandTotals.balanceNet)} g`} sub={`In ${fmtNum(grandTotals.inwardNet)} g · Out ${fmtNum(grandTotals.outwardNet)} g`} tone="ink" />
      </section>

      <main style={styles.mainGrid}>
        {/* CALENDAR */}
        <section style={styles.calendarCard}>
          <div style={styles.calHeaderRow}>
            <button className="db-navbtn" style={styles.navBtn} onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
            <div style={styles.calMonthLabel}>{monthLabel}</div>
            <button className="db-navbtn" style={styles.navBtn} onClick={() => changeMonth(1)} aria-label="Next month">›</button>
          </div>
          <button
            style={styles.todayLink}
            onClick={() => {
              const t = todayKeyIST().split("-").map(Number);
              setViewMonth({ year: t[0], month: t[1] - 1 });
              setSelectedKey(todayKeyIST());
            }}
          >
            Jump to today
          </button>

          <div style={styles.weekRow}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={styles.weekLabel}>{d}</div>
            ))}
          </div>

          <div style={styles.calGrid}>
            {calendarDays.map((key, idx) => {
              if (!key) return <div key={`empty-${idx}`} />;
              const bucket = byDate[key];
              const hasData = !!bucket;
              const isSelected = key === selectedKey;
              const isToday = key === todayKey;
              const dayNum = parseInt(key.split("-")[2], 10);
              return (
                <button
                  key={key}
                  className={`db-daybtn ${!hasData ? "db-daybtn-empty" : ""}`}
                  onClick={() => setSelectedKey(key)}
                  style={{
                    ...styles.dayCell,
                    ...(isSelected ? styles.dayCellSelected : {}),
                    ...(isToday && !isSelected ? styles.dayCellToday : {}),
                  }}
                >
                  <span style={styles.dayNum}>{dayNum}</span>
                  {hasData && (
                    <span style={styles.dayDots}>
                      {bucket.inwardQty > 0 && <span style={{ ...styles.dot, background: "#2F4A3C" }} />}
                      {bucket.outwardQty > 0 && <span style={{ ...styles.dot, background: "#6E3B28" }} />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={styles.legendRow}>
            <span style={styles.legendItem}><span style={{ ...styles.dot, background: "#2F4A3C" }} /> Inward day</span>
            <span style={styles.legendItem}><span style={{ ...styles.dot, background: "#6E3B28" }} /> Outward day</span>
          </div>
        </section>

        {/* SELECTED DAY LEDGER - SINGLE UNIFIED TABLE */}
        <section style={styles.ledgerCard}>
          <div style={styles.ledgerHeaderRow}>
            <div>
              <div style={styles.eyebrow}>Entry for</div>
              <h2 style={styles.ledgerDate}>{formatDateKeyLong(selectedKey)}</h2>
            </div>
            <div style={styles.dayTotalsInline}>
              <span style={{ color: "#2F4A3C" }}>In: {fmtNum(selectedBucket.inwardQty, 0)} pcs / {fmtNum(selectedBucket.inwardNet)} g</span>
              <span style={{ color: "#6E3B28" }}>Out: {fmtNum(selectedBucket.outwardQty, 0)} pcs / {fmtNum(selectedBucket.outwardNet)} g</span>
              <span style={styles.balancePill}>Balance: {fmtNum(selectedBucket.inwardQty - selectedBucket.outwardQty, 0)} pcs</span>
            </div>
          </div>

          {loading && <div style={styles.emptyNote}>Loading ledger entries…</div>}

          {!loading && allEntries.length === 0 && (
            <div style={styles.emptyNote}>No stock movement recorded for this day.</div>
          )}

          {!loading && allEntries.length > 0 && (
            <>
              {/* Total Stock Inward / Outward / Balance cards */}
              <div style={styles.dayTotalsCards}>
                <TotalCard
                    label="Total Stock Inward"
                    value={`${fmtNum(selectedBucket.inwardQty, 0)} Pcs`}
                    sub={`${fmtNum(selectedBucket.inwardGross)} g gross · ${fmtNum(selectedBucket.inwardNet)} g net`}
                    tone="forest"
                  />
                  <TotalCard
                    label="Total Stock Outward"
                    value={`${fmtNum(selectedBucket.outwardQty, 0)} Pcs`}
                    sub={`${fmtNum(selectedBucket.outwardGross)} g gross · ${fmtNum(selectedBucket.outwardNet)} g net`}
                    tone="rust"
                  />
                  <TotalCard
                    label="Balance (as of this day)"
                    value={`${fmtNum(selectedBucket.inwardQty - selectedBucket.outwardQty, 0)} Pcs`}
                    sub="Running total across all entries"
                    tone="brass"
                    emphasis
                  />
              </div>

              {/* SINGLE UNIFIED TABLE */}
              <div style={styles.tableWrapper}>
                {/* Table Header */}
                <div style={styles.tableHeader}>
                  <div style={styles.tableHeaderRow}>
                    <span style={styles.tableHeaderCell}>Opening</span>
                    <span style={styles.tableHeaderCell}>Gross Wt</span>
                    <span style={styles.tableHeaderCell}>Des</span>
                    <span style={styles.tableHeaderCell}>In Ward</span>
                    <span style={styles.tableHeaderCell}>Out Ward</span>
                    <span style={styles.tableHeaderCell}>Bal</span>
                  </div>
                </div>

                {/* Table Body - All entries in one table */}
                {allEntries.map((entry) => {
                  if (entry.isOpening) {
                    return (
                      <div key={entry.key} style={{ ...styles.ledgerRow, ...styles.openingRow, cursor: 'default' }}>
                        <div style={styles.ledgerRowTable}>
                          <span style={styles.ledgerCellOpening}>{entry.opening}</span>
                          <span style={styles.ledgerCellGross}>{entry.gross}</span>
                          <span style={styles.ledgerCellDes}>{entry.des}</span>
                          <span style={styles.ledgerCellInward}>{entry.inWard}</span>
                          <span style={styles.ledgerCellOutward}>{entry.outWard}</span>
                          <span style={styles.ledgerCellBal}>{entry.balance}</span>
                        </div>
                      </div>
                    );
                  }

                  const record = entry.record;
                  const isInward = TYPE_META[record.type].group === "inward";

                  return (
                    <LedgerRow
                      key={entry.key}
                      record={record}
                      expanded={expandedTxn === entry.key}
                      onToggle={() => toggleExpand(record)}
                      detailItems={detailCache[entry.key]}
                      isDetailLoading={detailLoading === entry.key}
                      detailError={expandedTxn === entry.key ? detailError : null}
                      openingValue={entry.opening}
                      grossValue={entry.gross}
                      desValue={entry.des}
                      inWardValue={entry.inWard}
                      outWardValue={entry.outWard}
                      balanceValue={entry.balance}
                      isInward={isInward}
                    />
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

// Helper function to get the description value based on type
function getDesValue(typeKey) {
  if (typeKey === 'inward-main') return 'From Admin';
  if (typeKey === 'outward-salesman') return 'Warehouse to Salesman';
  if (typeKey === 'inward-salesman') return 'From Salesman';
  if (typeKey === 'outward-main') return 'Warehouse to Admin';
  return '';
}

function TotalCard({ label, value, sub, tone, emphasis }) {
  const toneColors = {
    forest: "#2F4A3C",
    rust: "#6E3B28",
    brass: "#A9822F",
    ink: "#232019",
  };
  return (
    <div style={{ ...styles.totalCard, ...(emphasis ? styles.totalCardEmphasis : {}) }}>
      <div style={{ ...styles.totalLabel, color: toneColors[tone] }}>{label}</div>
      <div style={styles.totalValue}>{value}</div>
      <div style={styles.totalSub}>{sub}</div>
    </div>
  );
}

function LedgerRow({
  record,
  expanded,
  onToggle,
  detailItems,
  isDetailLoading,
  detailError,
  openingValue,
  grossValue,
  desValue,
  inWardValue,
  outWardValue,
  balanceValue,
  isInward
}) {
  return (
    <div style={styles.ledgerRowWrap}>
      <button className="db-row" style={styles.ledgerRow} onClick={onToggle}>
        <div style={styles.ledgerRowTable}>
          <span style={styles.ledgerCellOpening}>{openingValue || '—'}</span>
          <span style={styles.ledgerCellGross}>{grossValue || fmtNum(record.gross)}</span>
          <span style={styles.ledgerCellDes}>{desValue}</span>
          <span style={{...styles.ledgerCellInward, ...(isInward ? styles.ledgerCellHighlight : {})}}>
            {inWardValue}
          </span>
          <span style={{...styles.ledgerCellOutward, ...(!isInward ? styles.ledgerCellHighlight : {})}}>
            {outWardValue}
          </span>
          <span style={styles.ledgerCellBal}>{balanceValue}</span>
        </div>
        {record.remarks && <div className="db-remarks">{record.remarks}</div>}
        {record.from && record.to && (
          <div className="db-transfer-details">
            {record.from} → {record.to}
          </div>
        )}
      </button>

      {expanded && (
        <div style={styles.detailPanel}>
          {isDetailLoading && <div style={styles.emptyNote}>Loading item detail…</div>}
          {detailError && <div style={styles.detailError}>{detailError}</div>}
          {!isDetailLoading && !detailError && detailItems && detailItems.length === 0 && (
            <div style={styles.emptyNote}>No item-level detail available.</div>
          )}
          {!isDetailLoading && detailItems && detailItems.length > 0 && (
            <div style={{ overflowX: "auto" }} className="db-scrollbar">
              <table style={styles.itemTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Design</th>
                    <th style={styles.th}>Purity</th>
                    <th style={styles.th}>Qty</th>
                    <th style={styles.th}>Gross</th>
                    <th style={styles.th}>Net</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detailItems.map((it) => (
                    <tr key={it.item_id}>
                      <td style={styles.td}>{it.PCode_BarCode}</td>
                      <td style={styles.td}>{it.design_name}</td>
                      <td style={styles.td}>{it.purity}</td>
                      <td style={styles.td}>{fmtNum(it.qty, 0)}</td>
                      <td style={styles.td}>{fmtNum(it.gross_weight)} g</td>
                      <td style={styles.td}>{fmtNum(it.net_weight)} g</td>
                      <td style={styles.td}>₹{fmtMoney(it.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: "#F1ECE0",
    color: "#232019",
    minHeight: "100%",
    padding: "28px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    borderBottom: "2px solid #232019",
    paddingBottom: "18px",
    marginBottom: "20px",
    marginTop: "70px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  stampCircle: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    border: "2px solid #A9822F",
    color: "#A9822F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: "18px",
    letterSpacing: "1px",
    flexShrink: 0,
  },
  userRoomTag: {
    fontSize: "12px",
    color: "#A9822F",
    fontWeight: 600,
    marginTop: "2px",
    letterSpacing: "0.5px",
  },
  eyebrow: {
    textTransform: "uppercase",
    fontSize: "11px",
    letterSpacing: "1.5px",
    color: "#8A806B",
    fontWeight: 600,
    marginBottom: "2px",
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: "34px",
    fontWeight: 600,
    margin: 0,
    letterSpacing: "0.2px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  headerNote: { fontSize: "13px", color: "#5B5442", fontStyle: "italic", fontFamily: "'Fraunces', serif" },
  refreshBtn: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    padding: "10px 18px",
    background: "#232019",
    color: "#F1ECE0",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  errorBanner: {
    background: "#F6E4DC",
    border: "1px solid #6E3B28",
    color: "#6E3B28",
    padding: "12px 16px",
    borderRadius: "4px",
    marginBottom: "18px",
    fontSize: "14px",
  },
  totalsStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    marginBottom: "24px",
  },
  totalCard: {
    background: "#FFFDF8",
    border: "1px solid #D9CFB4",
    borderRadius: "6px",
    padding: "16px 18px",
  },
  totalCardEmphasis: {
    borderColor: "#A9822F",
    borderWidth: "2px",
    boxShadow: "0 2px 10px rgba(169,130,47,0.15)",
  },
  totalLabel: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" },
  totalValue: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "24px", fontWeight: 600, color: "#232019" },
  totalSub: { fontSize: "13px", color: "#5B5442", marginTop: "6px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "20px",
    alignItems: "start",
  },
  calendarCard: {
    background: "#FFFDF8",
    border: "1px solid #D9CFB4",
    borderRadius: "6px",
    padding: "18px",
    position: "sticky",
    top: "18px",
  },
  calHeaderRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" },
  navBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "1px solid #232019",
    background: "transparent",
    color: "#232019",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: 1,
    transition: "background 0.15s, color 0.15s",
  },
  calMonthLabel: { fontFamily: "'Fraunces', serif", fontSize: "18px", fontWeight: 600 },
  todayLink: {
    background: "none",
    border: "none",
    color: "#A9822F",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "0 0 12px 0",
    textDecoration: "underline",
  },
  weekRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "6px" },
  weekLabel: { textAlign: "center", fontSize: "11px", color: "#8A806B", fontWeight: 700 },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" },
  dayCell: {
    aspectRatio: "1",
    border: "1px solid #E4DCC7",
    borderRadius: "4px",
    background: "#FBF8F0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    gap: "3px",
    transition: "transform 0.1s, box-shadow 0.1s",
  },
  dayCellSelected: { background: "#232019", color: "#F1ECE0", borderColor: "#232019" },
  dayCellToday: { borderColor: "#A9822F", borderWidth: "2px" },
  dayNum: {},
  dayDots: { display: "flex", gap: "2px" },
  dot: { width: "5px", height: "5px", borderRadius: "50%", display: "inline-block" },
  legendRow: { display: "flex", gap: "16px", marginTop: "12px" },
  legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#5B5442" },
  ledgerCard: {
    background: "#FFFDF8",
    border: "1px solid #D9CFB4",
    borderRadius: "6px",
    padding: "22px",
    minHeight: "300px",
  },
  ledgerHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "10px",
    borderBottom: "2px solid #232019",
    paddingBottom: "14px",
    marginBottom: "18px",
  },
  ledgerDate: { fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 600, margin: 0 },
  dayTotalsInline: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    fontWeight: 600,
    flexWrap: "wrap",
  },
  balancePill: {
    color: "#A9822F",
    border: "1px solid #A9822F",
    borderRadius: "3px",
    padding: "3px 8px",
  },
  dayTotalsCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "24px",
  },
  emptyNote: { color: "#8A806B", fontSize: "13px", fontStyle: "italic", padding: "10px 0" },
  tableWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    width: "100%",
  },
  ledgerRowWrap: {
    marginBottom: "0px",
  },
  ledgerRow: {
    width: "100%",
    textAlign: "left",
    background: "#FFFDF8",
    border: "1px solid #E4DCC7",
    borderRadius: "3px",
    padding: "4px 8px",
    cursor: "pointer",
    display: "block",
    transition: "background 0.15s",
  },
  openingRow: {
    background: "#F5F2EA",
    borderColor: "#D9CFB4",
    cursor: "default",
  },
  tableHeader: {
    marginBottom: "2px",
  },
  tableHeaderRow: {
    display: "grid",
    gridTemplateColumns: "60px 80px 1fr 80px 80px 80px",
    gap: "4px",
    padding: "4px 8px",
    borderBottom: "2px solid #232019",
    fontWeight: 700,
    fontSize: "12px",
    color: "#5B5442",
  },
  tableHeaderCell: {
    textAlign: "center",
    textTransform: "uppercase",
    fontSize: "11px",
    letterSpacing: "0.5px",
  },
  ledgerRowTable: {
    display: "grid",
    gridTemplateColumns: "60px 80px 1fr 80px 80px 80px",
    gap: "4px",
    alignItems: "center",
  },
  ledgerCellOpening: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#5B5442",
    textAlign: "center",
  },
  ledgerCellGross: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#5B5442",
    textAlign: "center",
  },
  ledgerCellDes: {
    fontSize: "12px",
    color: "#232019",
    textAlign: "center",
    fontWeight: 500,
  },
  ledgerCellInward: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#5B5442",
    textAlign: "center",
  },
  ledgerCellOutward: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#5B5442",
    textAlign: "center",
  },
  ledgerCellBal: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    fontWeight: 600,
    color: "#232019",
    textAlign: "center",
  },
  ledgerCellHighlight: {
    fontWeight: 700,
    color: "#232019",
  },
  detailPanel: {
    marginTop: "2px",
    padding: "8px 10px",
    background: "#F1ECE0",
    border: "1px dashed #C9BFA6",
    borderRadius: "3px",
  },
  detailError: { fontSize: "12px", color: "#6E3B28" },
  itemTable: { width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "520px" },
  th: {
    textAlign: "left",
    padding: "6px 8px",
    borderBottom: "1px solid #C9BFA6",
    color: "#5B5442",
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
  },
  td: {
    padding: "6px 8px",
    borderBottom: "1px solid #E4DCC7",
    fontFamily: "'IBM Plex Mono', monospace",
  },
};