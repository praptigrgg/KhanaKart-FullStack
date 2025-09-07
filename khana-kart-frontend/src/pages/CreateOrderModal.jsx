import React, { useState } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import "./CreateOrderModal.css";

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
  const [searchTerm, setSearchTerm] = useState("");

  if (!showCreateOrder) return null;

  // Group menu items by category and filter by searchTerm
  const groupedMenu = menu
    .filter(
      (m) =>
        m.is_available &&
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

  return (
    <div
      className="create-order-overlay"
      onClick={() => setShowCreateOrder(false)}
      aria-modal="true"
      role="dialog"
      aria-labelledby="create-order-title"
    >
      <div className="create-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="create-order-title">Create New Order</h3>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => setShowCreateOrder(false)}
            aria-label="Close create order modal"
          >
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e, "create");
          }}
          className="order-form"
        >
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="table-select">
                Select Table *
              </label>
              <select
                id="table-select"
                className="form-input"
                value={createForm.table_id}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, table_id: e.target.value }))
                }
                required
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

            
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="menu-search">
              Search Menu
            </label>
            <input
              id="menu-search"
              type="text"
              className="form-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Add Menu Items</label>
            <div className="grouped-menu-container" aria-label="Menu items grouped by category">
              {Object.entries(groupedMenu).map(([category, items]) => (
                <div key={category} className="menu-category">
                  <h5 className="category-title">{category}</h5>
                  <div className="menu-items-grid">
                    {items.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        className="menu-item-btn"
                        onClick={() => addItemToForm(m.id, "create")}
                        aria-label={`Add ${m.name} priced Rs. ${m.price}`}
                      >
                        <span className="item-name">{m.name}</span>
                        <span className="item-price">Rs. {m.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {createForm.items.length > 0 && (
            <div className="selected-items" aria-live="polite">
              <h4>Selected Items</h4>
              <div className="items-list">
                {createForm.items.map((item, idx) => {
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
                          aria-label={`Quantity of ${menuItem?.name}`}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            if (qty < 1) return;
                            setCreateForm((f) => ({
                              ...f,
                              items: f.items.map((x, j) =>
                                j === idx ? { ...x, quantity: qty } : x
                              ),
                            }));
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            setCreateForm((f) => ({
                              ...f,
                              items: f.items.filter((_, j) => j !== idx),
                            }));
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
              <div className="selected-items-total" aria-live="polite">
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

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateOrder(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
