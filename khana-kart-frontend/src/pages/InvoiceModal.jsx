import React, { useRef } from "react";
import { FaPrint, FaDownload } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { useInvoice } from '../context/InvoiceContext'

const invoiceStyles = `
  body {
  /* Make overlay cover the entire screen */
.modal-overlay {
  position: fixed;          /* Fixed position to cover viewport */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5); /* Semi-transparent black */
  display: flex;
  justify-content: center;  /* Center horizontally */
  align-items: center;      /* Center vertically */
  z-index: 1000;            /* On top of everything */
}

/* Style the modal content box */
.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px 30px;
  max-width: 800px;
  max-height: 90vh;        /* Prevent it from exceeding screen height */
  overflow-y: auto;        /* Scroll if content is too tall */
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  position: relative;
}

    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #fff;
    color: #333;
  }

  .invoice-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    background-color: #fff;
    border: 1px solid #eee;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
  }

  .invoice-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #6d4e39;
    padding-bottom: 10px;
  }

  .invoice-header h2 {
    margin: 0;
    font-size: 32px;
    color: #ae836d;
  }

  .invoice-header p {
    font-size: 14px;
    color: #666;
  }

  .invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }

  .invoice-table th,
  .invoice-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
    font-size: 14px;
  }

  .invoice-table th {
    background-color: #f1f1f1;
    color: #333;
  }

  .invoice-summary {
    margin-top: 30px;
    font-size: 16px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .summary-row span {
    min-width: 120px;
  }

  .summary-row.total {
    font-weight: bold;
    font-size: 18px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 2px solid #ae836d;
    color: #6d4e39;
  }

  .thank-you {
    margin-top: 40px;
    text-align: center;
    font-size: 16px;
    color: #555;
  }

  @media print {
    body {
      padding: 0;
    }

    .invoice-container {
      box-shadow: none;
      border: none;
      padding: 0;
    }

    .no-print {
      display: none;
    }

  }
`;

function generateInvoiceHTML(order, includeStyles = true) {
  return `
    ${includeStyles ? `<style>${invoiceStyles}</style>` : ""}
    <div class="invoice-container">
      <div class="invoice-header">
        <h2>KhanaKart</h2>
        <p>Invoice : ${order.invoice_number}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>Rs.${Number(item.price).toFixed(2)}</td>
              <td>Rs.${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="invoice-summary">
        <div class="summary-row">
          <span>Subtotal:</span><span>Rs.${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Discount:</span><span>Rs.${order.discount_amount.toFixed(2)} (${order.discount_percent}%)</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span><span>Rs.${order.total.toFixed(2)}</span>
        </div>
      </div>
      <div class="thank-you">
        <p>Thank you for dining with us!</p>
        <p>Visit again.</p>
      </div>
    </div>
  `;
}

export default function InvoiceModal({ showInvoice, setShowInvoice, invoiceOrder, setInvoiceOrder }) {
  const invoiceRef = useRef();
const { addInvoice } = useInvoice()

const closeInvoice = () => {
  if (invoiceOrder) {
    addInvoice(invoiceOrder) // Save before closing
  }
  setShowInvoice(false)
  setInvoiceOrder(null)
}


  const printInvoice = () => {
    if (!invoiceOrder) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceOrder.invoice_number}</title>
        <meta charset="UTF-8" />
        <style>${invoiceStyles}</style>
      </head>
      <body>
        ${generateInvoiceHTML(invoiceOrder, false)}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const saveInvoiceAsPdf = async () => {
    if (!invoiceOrder) return;

    const opt = {
      margin: 0.5,
      filename: `invoice-${invoiceOrder.invoice_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateInvoiceHTML(invoiceOrder, true);
      document.body.appendChild(tempDiv);

      await html2pdf().set(opt).from(tempDiv).save();

      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (!showInvoice || !invoiceOrder) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
      <div ref={invoiceRef} className="modal-content invoice-modal">
        <style>{invoiceStyles}</style>
        <div dangerouslySetInnerHTML={{ __html: generateInvoiceHTML(invoiceOrder, false) }} />

        <div className="invoice-actions no-print" style={{ marginTop: 20 }}>
          <button onClick={printInvoice} className="btn btn-primary" aria-label="Print Invoice">
            <FaPrint /> Print
          </button>
          <button onClick={saveInvoiceAsPdf} className="btn btn-success" aria-label="Download Invoice PDF">
            <FaDownload /> Save PDF
          </button>
          <button onClick={closeInvoice} className="btn btn-secondary" aria-label="Close Invoice Modal">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
