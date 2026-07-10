import React, { useState, useEffect, useMemo, useCallback } from "react";

// ============================================================================
// DAY BOOK — Stock Ledger for Warehouse Inward / Outward movements
// Plain JavaScript, no TypeScript types anywhere.
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

const DETAIL_ITEMS_KEY = {
  "inward-main": "transfer_items",
  "inward-salesman": "transfer_items",
  "outward-main": "return_items",
  "outward-salesman": "transfer_items",
};

const TYPE_META = {
  "inward-main": { label: "Inward from Main", group: "inward", short: "IN · Main" },
  "inward-salesman": { label: "Inward from Salesman", group: "inward", short: "IN · Salesman" },
  "outward-main": { label: "Outward to Main", group: "outward", short: "OUT · Main" },
  "outward-salesman": { label: "Outward to Salesman", group: "outward", short: "OUT · Salesman" },
};

function toNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// Renders a UTC ISO timestamp into an IST calendar-day key (YYYY-MM-DD)
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

  // Get current user's stock room label from localStorage (used for
  // name-based filters on stockTransfers / receivedTransfers / assignedTransfers)
  const currentUserStockRoom = useMemo(() => {
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      // If userId is 2, user is in 2ND STOCK ROOM
      // For other users, adjust this logic based on your mapping
      if (userId === '2') {
        return '2ND STOCK ROOM';
      }
      // Add more mappings as needed
      return userName || '';
    } catch (e) {
      return '';
    }
  }, []);

  // Get the raw current user id (used for id-based filters, e.g. return
  // transfers, where the API only carries from_user_id/to_user_id and NOT
  // a stock-point name that matches currentUserStockRoom).
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

  // ------------------------------------------------------------------
  // Normalize all four sources into one flat ledger of records
  // Filter based on current user's stock room / user id
  // ------------------------------------------------------------------
  const records = useMemo(() => {
    const list = [];

    raw.stockTransfers.forEach((t) => {
      // Only include if the transfer involves current user's stock room
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
        dateKey: toDateKey(t.transfer_date),
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
      // Only include if the transfer involves current user's stock room
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

    // -----------------------------------------------------------------
    // RETURN-TO-MAIN-STOCK
    // FIX: this endpoint's "to_stock_point_name" is always null (a return
    // always goes to Main Stock, which has no stock_point row), and
    // "from_stock_point_name" is the physical room name (e.g.
    // "MAIN STOCK ROOM"), which will NEVER equal a synthetic room label
    // like "2ND STOCK ROOM". Filtering by stock-point name therefore
    // dropped every return transfer for every user. The record actually
    // identifies its owner via from_user_id / to_user_id, so filter on
    // that instead.
    // -----------------------------------------------------------------
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
      // Only include if the transfer involves current user's stock room
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

    return list;
  }, [raw, currentUserStockRoom, currentUserId]);

  // ------------------------------------------------------------------
  // Group by day
  // ------------------------------------------------------------------
  const byDate = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!r.dateKey) return;
      if (!map[r.dateKey]) {
        map[r.dateKey] = {
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

  // ------------------------------------------------------------------
  // Calendar grid for viewMonth
  // ------------------------------------------------------------------
  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const startWeekday = firstOfMonth.getUTCDay(); // 0 = Sunday
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
        <TotalCard label="Total Inward (Qty)" value={fmtNum(grandTotals.inwardQty, 0)} sub={`${fmtNum(grandTotals.inwardGross)} g gross`} tone="forest" />
        <TotalCard label="Total Outward (Qty)" value={fmtNum(grandTotals.outwardQty, 0)} sub={`${fmtNum(grandTotals.outwardGross)} g gross`} tone="rust" />
        <TotalCard label="Net Stock Balance (Qty)" value={fmtNum(grandTotals.balanceQty, 0)} sub={`${fmtNum(grandTotals.balanceNet)} g net wt`} tone="brass" emphasis />
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

        {/* SELECTED DAY LEDGER */}
        <section style={styles.ledgerCard}>
          <div style={styles.ledgerHeaderRow}>
            <div>
              <div style={styles.eyebrow}>Entry for</div>
              <h2 style={styles.ledgerDate}>{formatDateKeyLong(selectedKey)}</h2>
            </div>
            <div style={styles.dayTotalsInline}>
              <span style={{ color: "#2F4A3C" }}>In: {fmtNum(selectedBucket.inwardQty, 0)} pcs / {fmtNum(selectedBucket.inwardNet)} g</span>
              <span style={{ color: "#6E3B28" }}>Out: {fmtNum(selectedBucket.outwardQty, 0)} pcs / {fmtNum(selectedBucket.outwardNet)} g</span>
            </div>
          </div>

          {loading && <div style={styles.emptyNote}>Loading ledger entries…</div>}

          {!loading && selectedBucket.inward.length === 0 && selectedBucket.outward.length === 0 && (
            <div style={styles.emptyNote}>No stock movement recorded for this day.</div>
          )}

          {!loading && (selectedBucket.inward.length > 0 || selectedBucket.outward.length > 0) && (
            <>
              {/* ADDED: Total Stock Inward and Outward Cards */}
              <div style={styles.dayTotalsCards}>
                <TotalCard 
                  label="Total Stock Inward" 
                  value={`${fmtNum(selectedBucket.inwardQty, 0)} pcs`} 
                  sub={`${fmtNum(selectedBucket.inwardGross)} g gross · ${fmtNum(selectedBucket.inwardNet)} g net`} 
                  tone="forest" 
                />
                <TotalCard 
                  label="Total Stock Outward" 
                  value={`${fmtNum(selectedBucket.outwardQty, 0)} pcs`} 
                  sub={`${fmtNum(selectedBucket.outwardGross)} g gross · ${fmtNum(selectedBucket.outwardNet)} g net`} 
                  tone="rust" 
                />
              </div>

              <div style={styles.ledgerTable}>
                {/* INWARD COLUMN */}
                <div style={styles.ledgerColumn}>
                  <div style={{ ...styles.columnHeader, color: "#2F4A3C", borderColor: "#2F4A3C" }}>
                    Inward (Dr) — {selectedBucket.inward.length} entr{selectedBucket.inward.length === 1 ? "y" : "ies"}
                  </div>
                  {selectedBucket.inward.length === 0 && <div style={styles.emptyNote}>No inward entries.</div>}
                  {selectedBucket.inward.map((r) => (
                    <LedgerRow
                      key={r.key}
                      record={r}
                      expanded={expandedTxn === r.key}
                      onToggle={() => toggleExpand(r)}
                      detailItems={detailCache[r.key]}
                      isDetailLoading={detailLoading === r.key}
                      detailError={expandedTxn === r.key ? detailError : null}
                      tone="#2F4A3C"
                    />
                  ))}
                </div>

                {/* OUTWARD COLUMN */}
                <div style={styles.ledgerColumn}>
                  <div style={{ ...styles.columnHeader, color: "#6E3B28", borderColor: "#6E3B28" }}>
                    Outward (Cr) — {selectedBucket.outward.length} entr{selectedBucket.outward.length === 1 ? "y" : "ies"}
                  </div>
                  {selectedBucket.outward.length === 0 && <div style={styles.emptyNote}>No outward entries.</div>}
                  {selectedBucket.outward.map((r) => (
                    <LedgerRow
                      key={r.key}
                      record={r}
                      expanded={expandedTxn === r.key}
                      onToggle={() => toggleExpand(r)}
                      detailItems={detailCache[r.key]}
                      isDetailLoading={detailLoading === r.key}
                      detailError={expandedTxn === r.key ? detailError : null}
                      tone="#6E3B28"
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
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

function LedgerRow({ record, expanded, onToggle, detailItems, isDetailLoading, detailError, tone }) {
  const meta = TYPE_META[record.type];
  return (
    <div style={styles.ledgerRowWrap}>
      <button className="db-row" style={styles.ledgerRow} onClick={onToggle}>
        <div style={styles.ledgerRowTop}>
          <span style={{ ...styles.typeTag, borderColor: tone, color: tone }}>{meta.short}</span>
          <span style={styles.ledgerNumber}>{record.number}</span>
          <span style={styles.expandIcon}>{expanded ? "−" : "+"}</span>
        </div>
        <div style={styles.ledgerRowBottom}>
          <span>{record.from || "—"} → {record.to || "—"}</span>
          <span style={styles.ledgerFigures}>
            {fmtNum(record.qty, 0)} pcs · {fmtNum(record.gross)} g gross · {fmtNum(record.net)} g net
          </span>
        </div>
        {record.remarks && <div style={styles.remarksText}>{record.remarks}</div>}
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
    marginTop:"70px"
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
  totalValue: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "26px", fontWeight: 600, color: "#232019" },
  totalSub: { fontSize: "12px", color: "#8A806B", marginTop: "4px", fontFamily: "'IBM Plex Mono', monospace" },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
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
    gap: "16px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    fontWeight: 600,
  },
  // ADDED: Day totals cards container
  dayTotalsCards: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  emptyNote: { color: "#8A806B", fontSize: "13px", fontStyle: "italic", padding: "10px 0" },
  ledgerTable: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0",
    borderLeft: "1px solid #E4DCC7",
  },
  ledgerColumn: { padding: "0 16px", borderRight: "1px solid #E4DCC7" },
  columnHeader: {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid",
    paddingBottom: "8px",
    marginBottom: "12px",
  },
  ledgerRowWrap: { marginBottom: "10px" },
  ledgerRow: {
    width: "100%",
    textAlign: "left",
    background: "#FFFDF8",
    border: "1px solid #E4DCC7",
    borderRadius: "4px",
    padding: "10px 12px",
    cursor: "pointer",
    display: "block",
  },
  ledgerRowTop: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  typeTag: {
    fontSize: "10px",
    fontWeight: 700,
    border: "1px solid",
    borderRadius: "3px",
    padding: "2px 6px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  ledgerNumber: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", fontWeight: 600, flex: 1 },
  expandIcon: { fontSize: "16px", fontWeight: 700, color: "#8A806B" },
  ledgerRowBottom: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "6px",
    fontSize: "12px",
    color: "#5B5442",
  },
  ledgerFigures: { fontFamily: "'IBM Plex Mono', monospace" },
  remarksText: { fontSize: "11px", color: "#8A806B", marginTop: "6px", fontStyle: "italic" },
  detailPanel: {
    marginTop: "6px",
    padding: "10px 12px",
    background: "#F1ECE0",
    border: "1px dashed #C9BFA6",
    borderRadius: "4px",
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