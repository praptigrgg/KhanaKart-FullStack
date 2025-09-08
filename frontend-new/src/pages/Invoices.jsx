import React, { useState, useEffect } from 'react';
import { invoiceAPI } from '../services/api';
import { Eye, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const viewInvoice = async (invoiceId) => {
    try {
      const response = await invoiceAPI.getById(invoiceId);
      setSelectedInvoice(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch invoice details');
    }
  };

  const downloadInvoice = async (invoice) => {
    try {
      const invoiceElement = document.createElement('div');
      invoiceElement.innerHTML = generateInvoiceHTML(invoice);
      invoiceElement.style.position = 'absolute';
      invoiceElement.style.left = '-9999px';
      invoiceElement.style.background = 'white';
      invoiceElement.style.padding = '20px';
      invoiceElement.style.width = '800px';
      document.body.appendChild(invoiceElement);

      const canvas = await html2canvas(invoiceElement);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoice.invoice_number}.pdf`);
      document.body.removeChild(invoiceElement);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked. Please allow popups for this site.');
      return;
    }
    printWindow.document.write(generateInvoiceHTML(invoice));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generateInvoiceHTML = (invoice) => `
    <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 5px 0;
            font-size: 24px;
          }
          .header p {
            margin: 2px 0;
            font-size: 14px;
            color: #555;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
          }
          table th {
            background: #f9f9f9;
            font-weight: bold;
          }
          .totals {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 6px;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .grand-total {
            font-weight: bold;
            font-size: 18px;
            color: #e53935;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <h1>🍽️ KhanaKart (Restaurant)</h1>
            <p>Pokhara, Nepal</p>
            <p>Phone: +977 123456789</p>
          </div>

          <div class="invoice-details">
            <div>
              <p><strong>Invoice ID:</strong> #${invoice.invoice_number}</p>
              <p><strong>Table:</strong> ${invoice.table_number}</p>
            </div>
            <div>
              <p><strong>Date:</strong> ${format(new Date(), 'MMM dd, yyyy')}</p>
<p><strong>Time:</strong> ${format(new Date(), 'HH:mm')}</p>

            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>Rs.${Number(item.price).toFixed(2)}</td>
                  <td>Rs.${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>Rs.${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            ${invoice.discount_percent > 0 ? `
            <div style="color:#e53935;">
              <span>Discount (${invoice.discount_percent}%):</span>
              <span>-Rs.${Number(invoice.discount_amount).toFixed(2)}</span>
            </div>` : ''}
            <div class="grand-total">
              <span>Grand Total:</span>
              <span>Rs.${Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            ✨ Thank you for dining with us! ✨ <br/>
            Please visit again 🙏
          </div>
        </div>
      </body>
    </html>
  `;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">View and manage all invoices</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Table {invoice.table_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Rs.{Number(invoice.total).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'completed' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {invoice.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => viewInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInvoice(invoice)}
                        className="text-green-600 hover:text-green-900"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => printInvoice(invoice)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Invoice</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Styled Invoice Box */}
              <div className="border rounded-lg p-6">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold">🍽️ KhanaKart (Restaurant)</h1>
                  <p className="text-gray-600 text-sm">Pokhara, Nepal</p>
                  <p className="text-gray-600 text-sm">Phone: +977 123456789</p>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <p><strong>Invoice ID:</strong> #{selectedInvoice.invoice_number}</p>
                    <p><strong>Table:</strong> {selectedInvoice.table_number}</p>
                  </div>
                  <div>
                    <p><strong>Date:</strong> {format(new Date(), 'MMM dd, yyyy')}</p>
                    <p><strong>Time:</strong> {format(new Date(), 'HH:mm')}</p>
                  </div>
                </div>

                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-2 text-left text-xs font-semibold">Item</th>
                        <th className="border px-4 py-2 text-center text-xs font-semibold">Qty</th>
                        <th className="border px-4 py-2 text-center text-xs font-semibold">Price</th>
                        <th className="border px-4 py-2 text-center text-xs font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2 text-sm">{item.name}</td>
                          <td className="border px-4 py-2 text-sm text-center">{item.quantity}</td>
                          <td className="border px-4 py-2 text-sm text-center">Rs.{Number(item.price).toFixed(2)}</td>
                          <td className="border px-4 py-2 text-sm text-center">Rs.{Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal:</span>
                    <span>Rs.{Number(selectedInvoice.subtotal).toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount_percent > 0 && (
                    <div className="flex justify-between text-sm text-red-600 mb-2">
                      <span>Discount ({selectedInvoice.discount_percent}%):</span>
                      <span>-Rs.{Number(selectedInvoice.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-red-600 border-t pt-2">
                    <span>Grand Total:</span>
                    <span>Rs.{Number(selectedInvoice.total).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 mt-6">
                  ✨ Thank you for dining with us! ✨ <br />
                  Please visit again 🙏
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => downloadInvoice(selectedInvoice)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
