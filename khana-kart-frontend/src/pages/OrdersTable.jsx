import React, { useState } from "react";
import {
  FaPlus, FaCreditCard, FaTrash, FaCheck, FaSort, FaSortUp, FaSortDown,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";

export default function OrdersTable({
  orders,
  tables,
  menu,
  role,
  setPaymentOrder,
  setAddItemsOrder,
  setAddItemsForm,
  setDeleteConfirm,
  updateStatus,
  updateItemStatus,
  calculateOrderTotal,
  getStatusColor,
  getStatusIcon,
  sortConfig,
  handleSort,
  currentPage,
  itemsPerPage,
  totalPages,
  handlePageChange,
  handleItemsPerPageChange,
  searchTerm,
  statusFilter,
  canCreate,
  setShowCreateOrder
}) {
  // New: State for date filter toggles
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter by date first
  const dateFilteredOrders = orders.filter(order => {
    if (!order.created_at) return false;

    const orderDateStr = new Date(order.created_at).toISOString().slice(0, 10);

    if (showTodayOnly) {
      return orderDateStr === todayStr;
    } else if (startDate && endDate) {
      return orderDateStr >= startDate && orderDateStr <= endDate;
    }
    return true; // no date filter applied
  });

  // Sort by created_at descending (most recent first)
  const sortedOrders = [...dateFilteredOrders]
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Then filter by search and status
  const filteredOrders = sortedOrders.filter(order => {
    if (!order) return false;

    const matchesSearch =
      (order.id && order.id.toString().includes(searchTerm)) ||
      (order.table_id && order.table_id.toString().includes(searchTerm)) ||
      (order.items && order.items.some(item => {
        const menuItem = menu.find(m => m.id === item.menu_item_id);
        return menuItem?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      }));

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination slicing
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sorting icon component
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <>
      {/* Date filter controls */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={showTodayOnly}
            onChange={() => setShowTodayOnly(!showTodayOnly)}
          />{" "}
          Show Today's Orders Only
        </label>

        {!showTodayOnly && (
          <>
            <label>
              Start Date:{" "}
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={todayStr}
              />
            </label>
            <label>
              End Date:{" "}
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                max={todayStr}
                min={startDate || undefined}
              />
            </label>
          </>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                <div className="sortable-header">
                  Order ID <SortIcon columnKey="id" />
                </div>
              </th>
              <th onClick={() => handleSort('table_id')} style={{ cursor: 'pointer' }}>
                <div className="sortable-header">
                  Table <SortIcon columnKey="table_id" />
                </div>
              </th>
              <th>Items</th>
              <th onClick={() => handleSort('total')} style={{ cursor: 'pointer' }}>
                <div className="sortable-header">
                  Total <SortIcon columnKey="total" />
                </div>
              </th>
              <th>Discount</th>
              <th>Status</th>
              <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                <div className="sortable-header">
                  Date <SortIcon columnKey="created_at" />
                </div>
              </th>
              {role !== "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty">
                  <div className="table-empty-icon">📋</div>
                  <h3>No orders found</h3>
                  <p>{searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Start by creating your first order"}</p>
                  {canCreate && (
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => setShowCreateOrder(true)}
                    >
                      <FaPlus /> Create First Order
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => {
                if (!order) return null;

                const table = tables.find((t) => t.id === order.table_id);
                const { total, totalAfterDiscount } = calculateOrderTotal(order);
                const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';

                return (
                  <tr key={order.id} className="order-row">
                    <td data-label="Order ID">
                      <span className="order-id">#{order.id}</span>
                    </td>
                    <td data-label="Table">
                      {table ? (
                        <span className="table-info">
                          Table {table.table_number}<br></br>
                          <small>{table.capacity}4 seats</small>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td data-label="Items">
                      <div className="order-items">
                        {order.items && order.items.map((item) => {
                          const menuItem = menu.find((m) => m.id === item.menu_item_id);
                          return (
                            <div key={item.id} className="order-item">
                              <span className="item-name">{menuItem?.name}</span>
                              <span className="item-quantity">× {item.quantity}</span>
                              {role === "kitchen" && (
                                <select
                                  className={`status-select ${item.status}`}
                                  value={item.status}
                                  onChange={(e) => updateItemStatus(item.id, e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="preparing">Preparing</option>
                                  <option value="ready">Ready</option>
                                  <option value="served">Served</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td data-label="Total">
                      <span className="total-amount">Rs. {totalAfterDiscount.toFixed(2)}</span>
                    </td>
                    <td data-label="Discount">
                      <span className="discount">{order.discount || 0}%</span>
                    </td>
                    <td data-label="Status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td data-label="Date">
                      <span className="order-date">{orderDate}</span>
                    </td>
                    {role !== "admin" && (
                      <td data-label="Actions">
                        <div className="order-actions">
                          {order.is_paid ? (
                            <span className="paid-badge">
                              <FaCheck /> Paid
                            </span>
                          ) : (
                            <>
                              {(role === 'waiter' || role === 'cashier') && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => setPaymentOrder({ ...order, total, totalAfterDiscount })}
                                  title="Process Payment"
                                >
                                  <FaCreditCard />
                                </button>
                              )}

                              {role === 'waiter' && (
                                <>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setAddItemsOrder(order);
                                      setAddItemsForm({ items: [] });
                                    }}
                                    title="Add Items"
                                  >
                                    <FaPlus />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => setDeleteConfirm(order)}
                                    title="Delete Order"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </>

                          )}
                        </div>

                        {role === "kitchen" && order.status !== "served" && (
                          <div className="kitchen-actions">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => updateStatus(order.id, "pending")}
                              title="Mark as Pending"
                            >
                              Pending
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateStatus(order.id, "served")}
                              title="Mark as Served"
                            >
                              Served
                            </button>
                          </div>
                        )}
                      </td>
                    )}

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            <span>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
            </span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="items-per-page-select"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="pagination-buttons">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <FaChevronLeft />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 :
                currentPage >= totalPages - 2 ? totalPages - 4 + i :
                  currentPage - 2 + i;
              return page <= totalPages && page > 0 ? (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ) : null;
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="pagination-ellipsis">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 1 && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className="pagination-btn"
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

      )}
    </>
  );
}
