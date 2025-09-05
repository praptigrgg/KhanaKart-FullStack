import React from "react";
import { FaTimes, FaTrash } from "react-icons/fa";

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
  maxWidth: "700px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  position: "relative",
  width: "90%", // responsive width
};

export default function CreateOrderModal({
  showCreateOrder,
  setShowCreateOrder,
  createForm,
  setCreateForm,
  tables,
  menu,
  addItemToForm,
  handleSubmit,
  submitting,
}) {
  if (!showCreateOrder) return null;

  return (
    <div style={overlayStyle} onClick={() => setShowCreateOrder(false)} aria-modal="true" role="dialog" aria-labelledby="create-order-title">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 id="create-order-title">Create New Order</h3>
          <button
            className="btn btn-icon"
            onClick={() => setShowCreateOrder(false)}
            aria-label="Close create order modal"
            style={{ fontSize: "18px", background: "none", border: "none", cursor: "pointer" }}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, "create")} className="order-form" style={{ marginTop: "20px" }}>
          {/* Table + Discount Row */}
          <div className="form-row" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: "1 1 200px" }}>
              <label className="form-label">Select Table *</label>
              <select
                className="form-input"
                value={createForm.table_id}
                onChange={(e) => setCreateForm((f) => ({ ...f, table_id: e.target.value }))}
                required
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">Choose a table</option>
                {tables
                  .filter((t) => t.status === "available")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      Table {t.table_number} ({t.capacity} seats)
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: "1 1 150px" }}>
              <label className="form-label">Discount (%)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={createForm.discount}
                onChange={(e) => setCreateForm((f) => ({ ...f, discount: e.target.value }))}
                min={0}
                max={100}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className="form-group" style={{ marginTop: "20px" }}>
            <label className="form-label">Add Menu Items</label>
            <div
              className="menu-items-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "12px",
                maxHeight: "250px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {menu
                .filter((m) => m.is_available)
                .map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className="menu-item-btn"
                    onClick={() => addItemToForm(m.id, "create")}
                    style={{
                      padding: "10px",
                      border: "1px solid #007bff",
                      borderRadius: "6px",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "background-color 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6f0ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    <span className="item-name" style={{ fontWeight: "600", marginBottom: "4px", textAlign: "center" }}>
                      {m.name}
                    </span>
                    <span className="item-price" style={{ color: "#007bff", fontSize: "14px" }}>
                      Rs. {m.price}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Selected Items */}
          {createForm.items.length > 0 && (
            <div className="selected-items" style={{ marginTop: "25px" }}>
              <h4>Selected Items</h4>
              <div className="items-list" style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "6px" }}>
                {createForm.items.map((item, idx) => {
                  const menuItem = menu.find((m) => m.id === item.menu_item_id);
                  return (
                    <div
                      key={idx}
                      className="selected-item"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}
                    >
                      <div className="item-info">
                        <span className="item-name" style={{ fontWeight: "bold" }}>
                          {menuItem?.name}
                        </span>
                        <span className="item-price" style={{ marginLeft: "10px", color: "#555" }}>
                          Rs. {menuItem?.price}
                        </span>
                      </div>
                      <div className="item-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="number"
                          className="quantity-input"
                          value={item.quantity}
                          min={1}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            setCreateForm((f) => ({
                              ...f,
                              items: f.items.map((x, j) => (j === idx ? { ...x, quantity: qty } : x)),
                            }));
                          }}
                          style={{ width: "60px", padding: "6px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setCreateForm((f) => ({
                              ...f,
                              items: f.items.filter((_, j) => j !== idx),
                            }));
                          }}
                          style={{
                            backgroundColor: "#dc3545",
                            border: "none",
                            color: "white",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          aria-label={`Remove ${menuItem?.name} from order`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="selected-items-total" style={{ marginTop: "10px", fontWeight: "bold", textAlign: "right" }}>
                Total: Rs.{" "}
                {createForm.items
                  .reduce((sum, item) => {
                    const menuItem = menu.find((m) => m.id === item.menu_item_id);
                    return sum + (menuItem?.price || 0) * item.quantity;
                  }, 0)
                  .toFixed(2)}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions" style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateOrder(false)} style={{ padding: "10px 20px" }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: "10px 20px" }}>
              {submitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
