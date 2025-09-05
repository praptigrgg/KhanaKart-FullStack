import { FaPlus, FaSearch } from "react-icons/fa";

import './OrdersHeader.css'
export default function OrdersHeader({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  canCreate,
  setShowCreateOrder
}) {
  return (
    <div className="card-header">
      <h2 className="card-title">Orders Management</h2>
      <div className="d-flex align-center gap-2">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
          <option value="paid">Paid</option>
        </select>
        {canCreate && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateOrder(true)}
          >
            <FaPlus /> Create Order
          </button>
        )}
      </div>
    </div>
  );
}
