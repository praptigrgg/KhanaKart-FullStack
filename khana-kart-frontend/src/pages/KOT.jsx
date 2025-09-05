import React from 'react';
import { useInvoice } from '../context/InvoiceContext';

// Normalize invoice data to a consistent shape matching InvoiceModal
const normalizeInvoice = (invoice, index) => ({
  id: invoice.id ?? invoice.invoice_number ?? `generated-id-${index}`,
  items: Array.isArray(invoice.items)
    ? invoice.items.map((item) => ({
        name: item.name,
        qty: item.qty ?? item.quantity ?? 1,
        price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
        subtotal:
          typeof item.subtotal === 'number'
            ? item.subtotal
            : ((item.qty ?? item.quantity ?? 1) * (item.price ?? 0)),
      }))
    : [],
  subtotal:
    typeof invoice.subtotal === 'number'
      ? invoice.subtotal
      : Number(invoice.subtotal) || 0,
  discount:
    typeof invoice.discount === 'number'
      ? invoice.discount
      : Number(invoice.discount_amount) || 0,
  discountPercent:
    typeof invoice.discountPercent === 'number'
      ? invoice.discountPercent
      : Number(invoice.discount_percent) || 0,
  total:
    typeof invoice.total === 'number'
      ? invoice.total
      : Number(invoice.total) || 0,
});

// Generate invoice HTML similar to InvoiceModal style
const generateInvoiceHTML = (invoice) => `
  <div class="invoice-container" style="
    max-width: 800px; margin: 0 auto; padding: 40px;
    background-color: #fff; border: 1px solid #eee;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  ">
    <div class="invoice-header" style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4a3060; padding-bottom: 10px;">
      <h2 style="margin: 0; font-size: 32px; color: #6b5c78ff;">KhanaKart</h2>
      <p style="font-size: 14px; color: #666;">Invoice #: ${invoice.id}</p>
      <p style="font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 12px; background-color: #f1f1f1;">Item</th>
          <th style="border: 1px solid #ddd; padding: 12px; background-color: #f1f1f1;">Qty</th>
          <th style="border: 1px solid #ddd; padding: 12px; background-color: #f1f1f1;">Price</th>
          <th style="border: 1px solid #ddd; padding: 12px; background-color: #f1f1f1;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items
          .map(
            (item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;">${item.name}</td>
            <td style="border: 1px solid #ddd; padding: 12px;">${item.qty}</td>
            <td style="border: 1px solid #ddd; padding: 12px;">Rs.${item.price.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 12px;">Rs.${item.subtotal.toFixed(2)}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
    <div class="invoice-summary" style="margin-top: 30px; font-size: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Subtotal:</span>
        <span>Rs.${invoice.subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Discount:</span>
        <span>Rs.${invoice.discount.toFixed(2)} (${invoice.discountPercent.toFixed(2)}%)</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 12px; padding-top: 12px; border-top: 2px solid #564170ff; color: #6451a1ff;">
        <span>Total:</span>
        <span>Rs.${invoice.total.toFixed(2)}</span>
      </div>
    </div>
  </div>
`;

export default function KOT({ onCloseInvoice, onCloseAll }) {
  const { invoices = [] } = useInvoice();

  // Handle print: open new window and print invoice HTML
  const handlePrint = (invoice) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              background-color: #fff;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f1f1f1;
            }
          </style>
        </head>
        <body>
          ${generateInvoiceHTML(invoice)}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Handle save invoice as JSON file
  const handleSave = (invoice) => {
    const dataStr = JSON.stringify(invoice, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoice.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f8f8f8',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#6b5c78ff',
          marginBottom: '20px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        Kitchen Order Tickets
      </h2>

      {invoices.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            fontSize: '16px',
            color: '#666',
            marginTop: '40px',
            width: '100%',
          }}
        >
          No invoices found.
        </div>
      ) : (
        invoices.map((invoice, idx) => {
          const inv = normalizeInvoice(invoice, idx);

          return (
            <div
              key={inv.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '20px',
                border: '1px solid #ddd',
                width: '48%',
                boxSizing: 'border-box',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: generateInvoiceHTML(inv) }} />

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '15px',
                }}
              >
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b5c78ff',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'background-color 0.3s',
                  }}
                  onClick={() => handlePrint(inv)}
                  title="Print this invoice"
                >
                  Print
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b5c78ff',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'background-color 0.3s',
                  }}
                  onClick={() => handleSave(inv)}
                  title="Save this invoice as JSON"
                >
                  Save
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b5c78ff',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'background-color 0.3s',
                  }}
                  onClick={() => onCloseInvoice(inv.id)}
                  title="Close this invoice"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
