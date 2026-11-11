// WarehouseNotificationModal.js  (popup style matching the "Warehouse Visit Assignment" card)
import React from 'react';
import { Modal, Badge } from 'react-bootstrap';

// "Label: value" lines -> fields, "- item" lines -> items, other lines -> intro text
export const parseNotificationMessage = (message = '') => {
  const fields = [];
  const items = [];
  const intro = [];
  let itemsLabel = 'Products';

  String(message)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .forEach(line => {
      if (line.startsWith('- ')) {
        items.push(line.slice(2));
        return;
      }
      const idx = line.indexOf(':');
      if (idx > 0 && idx < 30) {
        const label = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (!value) {
          itemsLabel = label.replace(/\s*\(\d+\)\s*$/, '');
          return;
        }
        fields.push({ label, value });
      } else {
        intro.push(line);
      }
    });

  return { intro, fields, items, itemsLabel };
};

// "GC009 - GOLD CHAIN (GOLD JEWELLERY)" -> { barcode, product, category }
const parseItem = (text) => {
  const m = text.match(/^(\S+)(?:\s-\s(.*?))?(?:\s\((.*)\))?$/);
  if (!m) return { barcode: text, product: '', category: '' };
  return { barcode: m[1], product: m[2] || '', category: m[3] || '' };
};

// "Saikrishna (CUST-005)" -> { name, id }
export const splitCustomer = (value = '') => {
  const m = value.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1], id: m[2] } : { name: value, id: '' };
};

const getTone = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('cancel'))
    return { symbol: '!', color: '#dc2626', note: 'This visit has been cancelled. No action is needed at the warehouse.', noteBg: '#fef2f2', noteBorder: '#dc2626', noteColor: '#991b1b' };
  if (t.includes('complete') || t.includes('available'))
    return { symbol: '✓', color: '#16a34a', note: 'This visit is confirmed. Please keep the items ready.', noteBg: '#f0fdf4', noteBorder: '#16a34a', noteColor: '#166534' };
  if (t.includes('update') || t.includes('reschedule') || t.includes('not available'))
    return { symbol: '!', color: '#d97706', note: 'The visit details were changed. Please check the new date and time.', noteBg: '#fffbeb', noteBorder: '#d97706', noteColor: '#92400e' };
  return { symbol: 'i', color: '#38bdf8', note: 'Please keep the items ready for the customer visit at the scheduled time.', noteBg: '#eff6ff', noteBorder: '#3b82f6', noteColor: '#1e40af' };
};

const Row2 = ({ icon, label, children }) => (
  <div style={{ marginBottom: '10px', fontSize: '16px', color: '#475569', lineHeight: 1.5 }}>
    <span style={{ marginRight: '8px' }}>{icon}</span>
    <strong style={{ color: '#475569' }}>{label}:</strong> {children}
  </div>
);

const WarehouseNotificationModal = ({ show, onHide, notification, warehouseName }) => {
  const { intro, fields, items, itemsLabel } = parseNotificationMessage(notification?.message);
  const tone = getTone(notification?.title);

  const find = (...labels) => fields.find(f => labels.includes(f.label.toLowerCase()));
  const customerField = find('customer');
  const dateField = find('date', 'original date', 'scheduled date');
  const timeField = find('time');
  const salesField = find('salesperson', 'salesman');
  const used = ['customer', 'date', 'original date', 'scheduled date', 'time', 'salesperson', 'salesman'];
  const otherFields = fields.filter(f => !used.includes(f.label.toLowerCase()));

  const customer = customerField ? splitCustomer(customerField.value) : null;
  const salesAssigned = salesField && salesField.value !== 'Not assigned yet';
  const dateTime = dateField ? `${dateField.value}${timeField ? ' at ' + timeField.value : ''}` : '';

  // strip emoji from title so we can show it large on its own
  const title = notification?.title || 'Notification';

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="border-0" style={{ borderRadius: 16 }}>
      <Modal.Body style={{ padding: '32px 32px 28px', textAlign: 'center' }}>
        {/* icon circle */}
        <div style={{
          width: 84, height: 84, borderRadius: '50%', margin: '0 auto 18px',
          border: `4px solid ${tone.color}`, color: tone.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, fontWeight: 300, lineHeight: 1
        }}>
          {tone.symbol}
        </div>

        <h3 style={{ fontWeight: 700, color: '#595959', marginBottom: 20 }}>{title}</h3>

        {/* details card */}
        <div style={{
          textAlign: 'left', background: '#f8fafc', borderRadius: 12,
          padding: '18px 20px', marginBottom: 16
        }}>
          {intro.map((t, i) => (
            <div key={i} style={{ marginBottom: 10, color: '#64748b' }}>{t}</div>
          ))}

          {salesField && (
            <Row2 icon="🧑‍💼" label="Salesperson">
              {salesAssigned ? <strong>{salesField.value}</strong> : <Badge bg="secondary">Not Assigned</Badge>}
            </Row2>
          )}
          {customer && customer.id && <Row2 icon="🆔" label="Customer Code">{customer.id}</Row2>}
          {warehouseName && <Row2 icon="🏪" label="Warehouse">{warehouseName}</Row2>}
          {dateTime && <Row2 icon="📅" label="Date & Time">{dateTime}</Row2>}
          {otherFields.map((f, i) => (
            <Row2 key={i} icon="🔹" label={f.label}>{f.value}</Row2>
          ))}

          {items.length > 0 && (
            <>
              <Row2 icon="📦" label={`${itemsLabel} (${items.length})`}>&nbsp;</Row2>
              <div>
                {items.map((it, i) => {
                  const p = parseItem(it);
                  return (
                    <div key={i} style={{
                      background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #a36e29',
                      borderRadius: 10, padding: '10px 14px', marginBottom: 8
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge bg="dark">{p.barcode}</Badge>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>#{i + 1}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 14, color: '#334155', fontWeight: 600 }}>
                        {p.product || '—'}
                      </div>
                      {p.category && (
                        <div style={{ fontSize: 13, color: '#64748b' }}>{p.category}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* note box */}
        <div style={{
          textAlign: 'left', background: tone.noteBg, borderLeft: `4px solid ${tone.noteBorder}`,
          borderRadius: 10, padding: '12px 16px', color: tone.noteColor, fontSize: 15, marginBottom: 24
        }}>
          <span style={{ marginRight: 6 }}>💡</span>
          <strong>Note:</strong> {tone.note}
        </div>

        <button
          onClick={onHide}
          style={{
            background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8,
            padding: '12px 28px', fontSize: 17, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 0 0 4px rgba(59,130,246,0.35)'
          }}
        >
          ✅ Got it
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default WarehouseNotificationModal;