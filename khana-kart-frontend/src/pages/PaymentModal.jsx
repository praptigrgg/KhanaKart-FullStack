import React, { useState } from "react";
import {
  FaTimes,
  FaMoneyBillWave,
  FaQrcode,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import { markPaid } from "../api/client";
import { formatOrderForInvoice } from "../utils/formatOrderForInvoice";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "white",
  borderRadius: "8px",
  padding: "20px 30px",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  position: "relative",
};

export default function PaymentModal({
  paymentOrder,
  setPaymentOrder,
  setQrPaymentMode,
  qrPaymentMode,
  setPaymentSuccess,
  loadingPayment,
  menu,
  setShowInvoice,
  setInvoiceOrder,
  onPaymentSuccess,
}) {
  const [localLoading, setLocalLoading] = useState(false);
  const [discountInput, setDiscountInput] = useState(
    paymentOrder?.discount || 0
  );

  if (!paymentOrder) return null;

  const discountAmount = (paymentOrder.total * discountInput) / 100;
  const totalAfterDiscount = paymentOrder.total - discountAmount;

  const handlePayWithCash = async (orderId) => {
    try {
      setLocalLoading(true);
      await markPaid(orderId, "cash"); // Update if your API supports discount
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);

      setInvoiceOrder(
        formatOrderForInvoice(
          { ...paymentOrder, discount: discountInput, totalAfterDiscount },
          menu
        )
      );
      setShowInvoice(true);
      setPaymentOrder(null);
    } catch (error) {
      console.error("Payment error response:", error.response?.data || error.message);
      alert(
        "Error processing payment: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePayWithQr = async (orderId) => {
    try {
      setLocalLoading(true);
      await markPaid(orderId, "qr"); // Update if your API supports discount
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentOrder);
      }
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);

      setInvoiceOrder(
        formatOrderForInvoice(
          { ...paymentOrder, discount: discountInput, totalAfterDiscount },
          menu
        )
      );
      setShowInvoice(true);
      setPaymentOrder(null);
      setQrPaymentMode(false);
    } catch (error) {
      alert(
        "Error processing QR payment: " +
          (error.message || JSON.stringify(error))
      );
    } finally {
      setLocalLoading(false);
    }
  };

  if (qrPaymentMode) {
    return (
      <div
        style={overlayStyle}
        onClick={() => {
          setPaymentOrder(null);
          setQrPaymentMode(false);
        }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="qr-payment-title"
      >
        <div
          style={modalStyle}
          className="qr-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <button
              className="btn btn-icon back-btn"
              onClick={() => setQrPaymentMode(false)}
              aria-label="Back to payment methods"
            >
              <FaArrowLeft />
            </button>
            <h3 id="qr-payment-title">QR Payment - Order #{paymentOrder.id}</h3>
            <button
              className="btn btn-icon"
              onClick={() => {
                setPaymentOrder(null);
                setQrPaymentMode(false);
              }}
              aria-label="Close payment modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className="qr-payment-content">
            <div
              className="qr-code-placeholder"
              aria-label="QR code for payment"
            >
              <div className="qr-image">
                <div
                  className="qr-placeholder-text"
                  style={{ textAlign: "center", color: "#555" }}
                >
                  <FaQrcode size={64} />
                  <p>QR Code Image</p>
                </div>
              </div>
              <p
                className="scan-instruction"
                style={{ textAlign: "center", marginTop: "10px" }}
              >
                Scan the QR code to complete payment
              </p>
            </div>

            <div
              className="payment-amount"
              style={{ textAlign: "center", marginTop: "20px" }}
            >
              <h4>Amount to Pay:</h4>
              <p
                className="amount"
                style={{ fontSize: "24px", fontWeight: "bold" }}
              >
                Rs. {totalAfterDiscount.toFixed(2)}
              </p>
            </div>

            <div
              className="payment-confirmation-buttons"
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button
                className="btn btn-success"
                onClick={() => handlePayWithQr(paymentOrder.id)}
                disabled={loadingPayment || localLoading}
                aria-label="Confirm QR payment"
                style={{ padding: "10px 20px", fontSize: "16px" }}
              >
                <FaCheck /> Payment Successful
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setPaymentOrder(null);
                  setQrPaymentMode(false);
                }}
                aria-label="Cancel QR payment"
                style={{ padding: "10px 20px", fontSize: "16px" }}
              >
                <FaTimes /> Cancel Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={overlayStyle}
      onClick={() => setPaymentOrder(null)}
      aria-modal="true"
      role="dialog"
      aria-labelledby="payment-title"
    >
      <div
        style={modalStyle}
        className="payment-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 id="payment-title">Payment - Order #{paymentOrder.id}</h3>
          <button
            className="btn btn-icon"
            onClick={() => setPaymentOrder(null)}
            aria-label="Close payment modal"
            style={{
              fontSize: "18px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div className="payment-details" style={{ marginTop: "20px" }}>
          <div
            className="payment-items"
            aria-label="List of order items"
            style={{ marginBottom: "20px" }}
          >
            <h4>Order Items</h4>
            {paymentOrder.items.map((item) => {
              const menuItem = menu.find((m) => m.id === item.menu_item_id);
              const price = Number(menuItem?.price || 0);
              return (
                <div
                  key={item.id}
                  className="payment-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span>{menuItem?.name || "Unknown Item"}</span>
                  <span>× {item.quantity}</span>
                  <span>Rs. {price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div
            className="discount-input"
            style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <label htmlFor="discount">Discount (%):</label>
            <input
              type="number"
              id="discount"
              value={discountInput}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, Number(e.target.value)));
                setDiscountInput(value);
              }}
              min="0"
              max="100"
              style={{
                width: "80px",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          <div
            className="payment-summary"
            aria-label="Order summary"
            style={{ borderTop: "1px solid #ccc", paddingTop: "15px" }}
          >
            <div
              className="summary-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span>Subtotal:</span>
              <span>Rs. {paymentOrder.total.toFixed(2)}</span>
            </div>
            <div
              className="summary-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span>Discount ({discountInput}%):</span>
              <span>- Rs. {discountAmount.toFixed(2)}</span>
            </div>
            <div
              className="summary-row total"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "18px",
                marginTop: "12px",
                borderTop: "2px solid #8e7ba9ff",
                paddingTop: "12px",
                color: "#000000ff",
              }}
            >
              <span>Total:</span>
              <span>Rs. {totalAfterDiscount.toFixed(2)}</span>
            </div>
          </div>

          <div
            className="payment-methods"
            style={{
              marginTop: "25px",
              display: "flex",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            <button
              className="btn btn-primary payment-method-btn"
              onClick={() => handlePayWithCash(paymentOrder.id)}
              disabled={loadingPayment || localLoading}
              aria-label="Pay with cash"
              style={{ padding: "10px 20px", fontSize: "16px" }}
            >
              <FaMoneyBillWave />{" "}
              {loadingPayment || localLoading ? "Processing..." : "Cash Payment"}
            </button>
            <button
              className="btn btn-secondary payment-method-btn"
              onClick={() => setQrPaymentMode(true)}
              aria-label="Select QR payment"
              style={{ padding: "10px 20px", fontSize: "16px" }}
            >
              <FaQrcode /> QR Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
