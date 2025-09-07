import React, { useState, useMemo } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import styles from './KOT.module.css';

const normalizeInvoice = (invoice, index) => ({
  id: invoice.invoice_number ?? `generated-id-${index}`,
  table: invoice.table_number ?? 'N/A',
  date: invoice.created_at ? new Date(invoice.created_at) : new Date(),
  foodStatus: invoice.status ?? 'pending',
  isPaid: Boolean(invoice.is_paid),
  items: Array.isArray(invoice.items)
    ? invoice.items.map((item) => ({
        name: item.name,
        qty: item.quantity ?? 1,
        price: Number(item.price) || 0,
        subtotal: Number(item.subtotal) || 0,
      }))
    : [],
  subtotal: Number(invoice.subtotal) || 0,
  discount: Number(invoice.discount_amount) || 0,
  discountPercent: Number(invoice.discount_percent) || 0,
  total: Number(invoice.total) || 0,
});

const generateInvoiceHTML = (invoice) => `
  <table>
    <thead>
      <tr>
        <th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>Rs.${item.price.toFixed(2)}</td>
          <td>Rs.${item.subtotal.toFixed(2)}</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>
  <p><strong>Subtotal:</strong> Rs.${invoice.subtotal.toFixed(2)}</p>
  <p><strong>Discount:</strong> Rs.${invoice.discount.toFixed(2)} (${invoice.discountPercent.toFixed(2)}%)</p>
  <p><strong>Total:</strong> Rs.${invoice.total.toFixed(2)}</p>
`;

export default function KOT({ onCloseInvoice }) {
  const { invoices = [], loading } = useInvoice();

  const [filterFoodStatus, setFilterFoodStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6; // Increase perPage to better fill multiple cards per page

  const normalizedInvoices = useMemo(() => invoices.map(normalizeInvoice), [invoices]);

  const filteredInvoices = useMemo(() => {
    return normalizedInvoices.filter((inv) => {
      const foodStatusMatch = filterFoodStatus ? inv.foodStatus === filterFoodStatus : true;
      const paymentStatusMatch = filterPaymentStatus
        ? filterPaymentStatus === 'paid'
          ? inv.isPaid
          : !inv.isPaid
        : true;
      const dateMatch = filterDate ? inv.date.toISOString().split('T')[0] === filterDate : true;

      return foodStatusMatch && paymentStatusMatch && dateMatch;
    });
  }, [normalizedInvoices, filterFoodStatus, filterPaymentStatus, filterDate]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredInvoices.slice(start, start + perPage);
  }, [filteredInvoices, currentPage, perPage]);

  const totalPages = Math.ceil(filteredInvoices.length / perPage);

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Invoice</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          color: #3c3a4d;
          background-color: #fff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          color: #6d4e39;
        }
        th {
          background-color: #f7e8dbff;
        }
      </style>
      </head><body>
      <h2>KhanaKart</h2>
      <p>Invoice #: ${invoice.id}</p>
      <p>Table: ${invoice.table}</p>
      <p>Date: ${invoice.date.toLocaleDateString()}</p>
      ${generateInvoiceHTML(invoice)}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading invoices...</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>KOT - Kitchen Order Tickets</h2>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Food Status:</label>
          <select value={filterFoodStatus} onChange={(e) => setFilterFoodStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Payment Status:</label>
          <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)}>
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Date:</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
      </div>

      {paginatedInvoices.length === 0 ? (
        <p>No invoices found for selected filters.</p>
      ) : (
        paginatedInvoices.map((inv) => (
          <div key={inv.id} className={styles.invoiceCard}>
            <div className={styles.statuses}>
              <span className={styles.statusLabel} style={{backgroundColor: '#ae836d', color: '#ffffff'}}>Food: {inv.foodStatus}</span>
              <span className={styles.statusLabel}style={{backgroundColor: '#ae836d', color: '#ffffff'}}>Payment: {inv.isPaid ? 'Paid' : 'Unpaid'}</span>
            </div>

            <div
              className={styles.invoiceHTML}
              dangerouslySetInnerHTML={{ __html: generateInvoiceHTML(inv) }}
            />

            <div className={styles.buttonGroup}>
              <button
                onClick={() => handlePrint(inv)}
                className="printBtn"
                aria-label={`Print invoice ${inv.id}`}
                style={{ backgroundColor: '#ae836d', color: 'white' }}
              >
                Print
              </button>
              <button
                onClick={() => onCloseInvoice?.(inv.id)}
                className="closeBtn"
                aria-label={`Close invoice ${inv.id}`}
                style={{ backgroundColor: '#bbb', color: 'white' }}
              >
                Close
              </button>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
