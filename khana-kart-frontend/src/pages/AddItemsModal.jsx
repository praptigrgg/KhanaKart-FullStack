import React from "react";
import { FaTimes, FaTrash } from "react-icons/fa";

export default function AddItemsModal({
  addItemsOrder,
  setAddItemsOrder,
  addItemsForm,
  setAddItemsForm,
  menu,
  addItemToForm,
  addItemsToOrder
}) {
  if (!addItemsOrder) return null;

  return (
    <div
  style={{
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
  }}
  onClick={() => setAddItemsOrder(null)}
>
  <div
    style={{
      background: "white",
      borderRadius: "8px",
      padding: "20px 30px",
      maxWidth: "700px",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      position: "relative",
      width: "90%",
    }}
    onClick={(e) => e.stopPropagation()}
  >

        <div className="modal-header">
          <h3>Add Items to Order #{addItemsOrder.id}</h3>
          <button className="btn btn-icon" onClick={() => setAddItemsOrder(null)}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); addItemsToOrder(); }} className="order-form">
          <div className="form-group">
            <label className="form-label">Add Menu Items</label>
            <div className="menu-items-grid">
              {menu
                .filter((m) => m.is_available)
                .map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className="menu-item-btn"
                    onClick={() => addItemToForm(m.id, "addItems")}
                  >
                    <span className="item-name">{m.name}</span>
                    <span className="item-price">Rs. {m.price}</span>
                  </button>
                ))}
            </div>
          </div>

          {addItemsForm.items.length > 0 && (
            <div className="selected-items">
              <h4>Items to Add</h4>
              <div className="items-list">
                {addItemsForm.items.map((item, idx) => {
                  const menuItem = menu.find((m) => m.id === item.menu_item_id);
                  return (
                    <div key={idx} className="selected-item">
                      <div className="item-info">
                        <span className="item-name">{menuItem?.name}</span>
                        <span className="item-price">Rs. {menuItem?.price}</span>
                      </div>
                      <div className="item-controls">
                        <input
                          type="number"
                          className="quantity-input"
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
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setAddItemsForm((f) => ({
                              ...f,
                              items: f.items.filter((_, j) => j !== idx),
                            }));
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="selected-items-total">
                <strong>Additional Total: Rs. {
                  addItemsForm.items.reduce((sum, item) => {
                    const menuItem = menu.find(m => m.id === item.menu_item_id);
                    return sum + (menuItem?.price || 0) * item.quantity;
                  }, 0).toFixed(2)
                }</strong>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAddItemsOrder(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={addItemsForm.items.length === 0}>
              Add Items
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
