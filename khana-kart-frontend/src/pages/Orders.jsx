import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

export default function Orders() {
  const { role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [createForm, setCreateForm] = useState({
    table_id: "",
    items: [],
    discount: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [addItemsOrder, setAddItemsOrder] = useState(null);
  const [addItemsForm, setAddItemsForm] = useState({ items: [] });
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null); // ✅ New state for invoice
  const invoiceRef = useRef();
  const [loadingPayment, setLoadingPayment] = React.useState(false);
  const navigate = useNavigate();
  const canCreate = role === "waiter";

  useEffect(() => {
    async function fetchAll() {
      try {
        const [orderRes, tableRes, menuRes] = await Promise.all([
          api.get("/orders"),
          api.get("/tables"),
          api.get("/menu-items"),
        ]);
        setOrders(orderRes.data?.data || orderRes.data);
        setTables(tableRes.data);
        setMenu(menuRes.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);
  async function reloadOrders() {
    setLoading(true);
    setError(null);
    try {
      const orderRes = await api.get("/orders");
      setOrders(orderRes.data?.data || orderRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  function addItemToForm(menuItemId, formType) {
    const update = (form, setForm) => {
      const existing = form.items.find((i) => i.menu_item_id === menuItemId);
      if (existing) {
        setForm({
          ...form,
          items: form.items.map((i) =>
            i.menu_item_id === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      } else {
        setForm({
          ...form,
          items: [...form.items, { menu_item_id: menuItemId, quantity: 1 }],
        });
      }
    };

    if (formType === "create") {
      setCreateForm((prev) => {
        update(prev, setCreateForm);
        return prev;
      });
    } else if (formType === "addItems") {
      setAddItemsForm((prev) => {
        update(prev, setAddItemsForm);
        return prev;
      });
    }
  }

  async function handleSubmit(e, type) {
    e.preventDefault();
    if (type === "create") {
      if (!createForm.table_id) return alert("Please select a table");
      if (createForm.items.length === 0) return alert("Please add at least one item");

      setSubmitting(true);
      try {
        const payload = {
          table_id: Number(createForm.table_id),
          items: createForm.items.map((i) => ({
            ...i,
            quantity: Number(i.quantity),
          })),
          discount: Number(createForm.discount) || 0,
        };
        await api.post("/orders", payload);
        alert("Order created");
        setCreateForm({ table_id: "", items: [], discount: 0 });
        setShowCreateOrder(false);
        reloadOrders();
      } catch (err) {
        alert(err?.response?.data?.message || err.message);
      } finally {
        setSubmitting(false);
      }
    }
  }
  async function updateStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      reloadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  async function updateItemStatus(itemId, status) {
    try {
      await api.put(`/order-items/${itemId}/status`, { status });
      reloadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  async function addItemsToOrder(e) {
    e.preventDefault();
    if (!addItemsOrder || addItemsForm.items.length === 0) {
      return alert("Please add at least one item");
    }

    try {
      const payload = {
        items: addItemsForm.items.map((i) => ({
          ...i,
          quantity: Number(i.quantity),
        })),
      };
      await api.put(`/orders/${addItemsOrder.id}/add-items`, payload);
      alert("Items added!");
      setAddItemsOrder(null);
      setAddItemsForm({ items: [] });
      reloadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  function handlePayWithQr(order) {
    setPaymentOrder(null);
    navigate(`/payment/qr/${order.id}`);
  }

  async function markPaid(order, method) {
    try {
      // 1. Mark order as paid
      await api.put(`/orders/${order.id}/pay`, { payment_method: method });

      // 2. Fetch invoice data
      const invoiceRes = await api.get(`/invoices/${order.id}`);

      // 3. Set invoiceOrder state to show invoice modal
      setInvoiceOrder(invoiceRes.data);

      // 4. Close payment modal
      setPaymentOrder(null);

      // 5. Reload orders
      reloadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  }
  async function handlePayWithCash(orderId) {
    try {
      setLoadingPayment(true);
      await markPaid({ id: orderId }, "cash");
    } catch (error) {
      alert("Error processing payment");
    } finally {
      setLoadingPayment(false);
    }
  }
  // Button
  <button onClick={() => handlePayWithCash(paymentOrder.id)} disabled={loadingPayment}>
    {loadingPayment ? "Processing..." : "Pay with Cash"}
  </button>

  return (

    <div className="orders-container">
      <style>
        {`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}
      </style>
      <div className="header-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>Orders</h2>
        {canCreate && (
          <button className="btn" onClick={() => setShowCreateOrder(true)}>
            + Create Order
          </button>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="modal">
          <div className="card">
            <h3>Create New Order</h3>
            <form onSubmit={(e) => handleSubmit(e, "create")}>
              <select
                value={createForm.table_id}
                onChange={(e) => setCreateForm((f) => ({ ...f, table_id: e.target.value }))}
                required
              >
                <option value="">Select Table</option>
                {tables
                  .filter((t) => t.status === "available")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      Table {t.table_number}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                placeholder="Discount %"
                value={createForm.discount}
                onChange={(e) => setCreateForm((f) => ({ ...f, discount: e.target.value }))}
                min={0}
                max={100}
              />

              <div style={{ marginTop: 10 }}>
                {menu
                  .filter((m) => m.is_available)
                  .map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => addItemToForm(m.id, "create")}
                      style={{ marginRight: 5, marginBottom: 5 }}
                    >
                      + {m.name}
                    </button>
                  ))}
              </div>

              <ul>
                {createForm.items.map((item, idx) => {
                  const menuItem = menu.find((m) => m.id === item.menu_item_id);
                  return (
                    <li key={idx}>
                      {menuItem?.name || item.menu_item_id} ×{" "}
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setCreateForm((f) => ({
                            ...f,
                            items: f.items.map((x, j) => (j === idx ? { ...x, quantity: qty } : x)),
                          }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCreateForm((f) => ({
                            ...f,
                            items: f.items.filter((_, j) => j !== idx),
                          }));
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Order"}
              </button>
              <button type="button" onClick={() => setShowCreateOrder(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Orders Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Order List</h3>
        {loading ? (
          <p>Loading orders...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Table</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const table = tables.find((t) => t.id === order.table_id);
                const total = order.items.reduce((acc, item) => {
                  const menuItem = menu.find((m) => m.id === item.menu_item_id);
                  return acc + (menuItem ? menuItem.price * item.quantity : 0);
                }, 0);
                const totalAfterDiscount = total * ((100 - order.discount) / 100);

                return (

                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{table ? `Table ${table.table_number}` : "—"}</td>
                    <td>
                      {order.items.map((item) => {
                        const menuItem = menu.find((m) => m.id === item.menu_item_id);
                        return (
                          <div key={item.id} style={{ marginBottom: 10 }}>
                            <div>
                              <strong>{menuItem ? menuItem.name : `#${item.menu_item_id}`}</strong> × {item.quantity}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                              <small style={{ marginRight: 6 }}>Status:</small>
                              {role === "kitchen" ? (
                                <select
                                  value={item.status}
                                  onChange={(e) => updateItemStatus(item.id, e.target.value)}
                                  style={{ fontSize: "0.8rem", padding: "2px 4px" }}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="preparing">Preparing</option>
                                  <option value="ready">Ready</option>
                                  <option value="served">Served</option>
                                </select>
                              ) : (
                                <span>{item.status}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </td>

                    <td>Rs.{total.toFixed(2)}</td>
                    <td>{order.discount}%</td>
                    <td>Rs.{totalAfterDiscount.toFixed(2)}</td>
                    <td>{order.status}</td>
                    <td>
                      {role === "kitchen" && order.status !== "served" && (
                        <div style={{ padding: "10px 0" }}>
                          <button onClick={() => updateStatus(order.id, "pending")}>Pending</button>
                          <button onClick={() => updateStatus(order.id, "served")}>Served</button>
                        </div>
                      )}
                    </td>
                    <td>
                      {order.is_paid ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>Paid ✅</span>
                      ) : (
                        <>
                          {role === 'waiter' && (
                            <button onClick={() => setPaymentOrder({ ...order, total, totalAfterDiscount })}>
                              Pay
                            </button>
                          )}
                          {role === "waiter" && (
                            <button
                              onClick={() => {
                                setAddItemsOrder(order);
                                setAddItemsForm({ items: [] });
                              }}
                            >
                              + Add Items
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Items Modal */}
      {addItemsOrder && (
        <div className="modal">
          <div className="card">
            <h3>Add Items to Order #{addItemsOrder.id}</h3>
            <div>
              {menu
                .filter((m) => m.is_available)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addItemToForm(m.id, "addItems")}
                    style={{ marginRight: 5, marginBottom: 5 }}
                  >
                    + {m.name}
                  </button>
                ))}
            </div>

            <ul>
              {addItemsForm.items.map((item, idx) => {
                const menuItem = menu.find((m) => m.id === item.menu_item_id);
                return (
                  <li key={idx}>
                    {menuItem?.name || item.menu_item_id} ×{" "}
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => {
                        const qty = Number(e.target.value);
                        setAddItemsForm((f) => ({
                          ...f,
                          items: f.items.map((x, j) => (j === idx ? { ...x, quantity: qty } : x)),
                        }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAddItemsForm((f) => ({
                          ...f,
                          items: f.items.filter((_, j) => j !== idx),
                        }));
                      }}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>

            <button onClick={addItemsToOrder}>Add Items</button>
            <button onClick={() => setAddItemsOrder(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentOrder && (
        <div
          className="modal"
          onClick={() => setPaymentOrder(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "450px",
              width: "90%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h3>Pay Order #{paymentOrder.id}</h3>
            <div>
              <h4>Order Details:</h4>
              <ul>
                {paymentOrder.items.map((item) => {
                  const menuItem = menu.find((m) => m.id === item.menu_item_id);
                  const price = Number(menuItem?.price || 0);
                  return (
                    <li key={item.id}>
                      {menuItem?.name || `#${item.menu_item_id}`} × {item.quantity} : Rs.{price.toFixed(2)} each
                    </li>
                  );
                })}
              </ul>

              <label htmlFor="discount">Discount %:</label>
              <input
                type="number"
                id="discount"
                value={paymentOrder.discount || 0}
                min={0}
                max={100}
                onChange={(e) => {
                  const newDiscount = Number(e.target.value);
                  const newTotal = paymentOrder.total * ((100 - newDiscount) / 100);
                  setPaymentOrder((prev) => ({
                    ...prev,
                    discount: newDiscount,
                    totalAfterDiscount: newTotal,
                  }));
                }}
                style={{ width: "60px", marginLeft: "10px" }}
              />

              <p><strong>Total:</strong> Rs.{paymentOrder.total.toFixed(2)}</p>
              <p><strong>Total After Discount:</strong> Rs.{paymentOrder.totalAfterDiscount?.toFixed(2) || paymentOrder.total.toFixed(2)}</p>
            </div>

            <button
              onClick={() => handlePayWithCash(paymentOrder.id)}
              disabled={loading}
              style={{ marginRight: "10px" }}
            >
              Pay with Cash
            </button>
            <button
              onClick={() => handlePayWithQr(paymentOrder)}
              style={{ marginRight: "10px" }}
            >
              Pay with QR
            </button>
            <button onClick={() => setPaymentOrder(null)}>Cancel</button>
          </div>
        </div>
      )}

      {
        invoiceOrder && (
          <div
            className="modal"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: 24,
              overflowY: "auto",
            }}
          >
            <div ref={invoiceRef}
              className="card"
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                maxWidth: 480,
                width: "100%",
                padding: 32,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                color: "#333",
              }}
            >
              {/* Header */}
              <header
                style={{
                  marginBottom: 24,
                  borderBottom: "2px solid #f0f0f0",
                  paddingBottom: 12,
                  textAlign: "center",
                }}
              >
                <h2 style={{ margin: 0, fontWeight: "700", fontSize: "1.8rem", letterSpacing: "0.05em", color: "#222" }}>
                  INVOICE
                </h2>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginTop: 6,
                    letterSpacing: "0.03em",
                  }}
                >
                  Invoice #{invoiceOrder.invoice_number}
                </p>
              </header>

              {/* Table & Info */}
              <section
                style={{
                  marginBottom: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  color: "#555",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 6px 0" }}>
                    <strong>Table:</strong> {invoiceOrder.table_number}
                  </p>
                  {/* Uncomment if you want date */}
                  {/* <p style={{ margin: 0 }}>
            <strong>Date:</strong> {new Date(invoiceOrder.date).toLocaleString()}
          </p> */}
                </div>
              </section>

              {/* Items Table */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 24,
                  fontSize: "0.95rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f7f7f7",
                      borderBottom: "2px solid #ddd",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#444",
                    }}
                  >
                    <th style={{ padding: "10px 12px" }}>Item</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", width: 60 }}>Qty</th>
                    <th style={{ padding: "10px 12px", textAlign: "right", width: 90 }}>Price</th>
                    <th style={{ padding: "10px 12px", textAlign: "right", width: 110 }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: idx !== invoiceOrder.items.length - 1 ? "1px solid #eee" : "none",
                        color: "#555",
                      }}
                    >
                      <td style={{ padding: "10px 12px" }}>{item.name}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        Rs.{Number(item.price).toFixed(2)}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600" }}>
                        Rs.{item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <section
                style={{
                  fontSize: "1rem",
                  color: "#333",
                  borderTop: "2px solid #f0f0f0",
                  paddingTop: 16,
                  marginBottom: 16,
                }}
              >
                <p style={{ margin: "6px 0", display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal:</span>
                  <span>Rs.{invoiceOrder.subtotal.toFixed(2)}</span>
                </p>
                <p style={{ margin: "6px 0", display: "flex", justifyContent: "space-between" }}>
                  <span>
                    Discount: {invoiceOrder.discount_percent}% (
                    Rs.{invoiceOrder.discount_amount.toFixed(2)})
                  </span>
                  <span></span>
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontWeight: "700",
                    fontSize: "1.2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#111",
                  }}
                >
                  <span>Total Payable:</span>
                  <span>Rs.{invoiceOrder.total.toFixed(2)}</span>
                </p>
              </section>

              {/* Thank you note */}
              <p
                style={{
                  textAlign: "center",
                  fontStyle: "italic",
                  color: "#666",
                  marginBottom: 24,
                  userSelect: "none",
                }}
              >
                Thank you for dining with us!
              </p>

              {/* Buttons */}
              <div
                className="no-print"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      width: "100%",
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "12px 0",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "1rem",
                      transition: "background-color 0.3s",
                    }}
                  >
                    🖨️ Print
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <button
                    onClick={async () => {
                      if (invoiceRef.current) {
                        const noPrintElements = invoiceRef.current.querySelectorAll(".no-print");
                        noPrintElements.forEach((el) => (el.style.display = "none"));

                        const opt = {
                          margin: 0.5,
                          filename: `invoice-${invoiceOrder.invoice_number}.pdf`,
                          image: { type: 'jpeg', quality: 0.98 },
                          html2canvas: { scale: 2 },
                          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                        };

                        await html2pdf().set(opt).from(invoiceRef.current).save();

                        noPrintElements.forEach((el) => (el.style.display = ""));
                      }
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "12px 0",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "1rem",
                      transition: "background-color 0.3s",
                    }}
                  >
                    📥 Save as PDF
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <button
                    onClick={() => setInvoiceOrder(null)}
                    style={{
                      width: "100%",
                      backgroundColor: "#eee",
                      border: "none",
                      borderRadius: 6,
                      padding: "12px 0",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "1rem",
                      color: "#333",
                      transition: "background-color 0.3s",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )
      }



    </div > // End of main container
  );
}
