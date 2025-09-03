import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";

// Import components
import OrdersHeader from "./OrdersHeader";
import LoadingAndErrorStates from "./LoadingAndErrorStates";
import OrdersTable from "./OrdersTable";
import CreateOrderModal from "./CreateOrderModal";
import AddItemsModal from "./AddItemsModal";
import PaymentModal from "./PaymentModal";
import InvoiceModal from "./InvoiceModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function Orders() {
const { role } = useAuth();

  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [createForm, setCreateForm] = useState({ table_id: "", items: [], discount: 0 });
  const [submitting, setSubmitting] = useState(false);

  const [addItemsOrder, setAddItemsOrder] = useState(null);
  const [addItemsForm, setAddItemsForm] = useState({ items: [] });

  const [paymentOrder, setPaymentOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [qrPaymentMode, setQrPaymentMode] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);



  const navigate = useNavigate();
  const canCreate = role === "waiter";

  // Fetch data
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, tablesRes, menuRes] = await Promise.all([
        api.get("/orders"),
        api.get("/tables"),
        api.get("/menu-items"),
      ]);
      setOrders(ordersRes.data.data);
      setTables(tablesRes.data);
      setMenu(menuRes.data);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Calculate order totals with discount
  const calculateOrderTotal = (order) => {
    if (!order || !order.items || order.items.length === 0) {
      return { total: 0, totalAfterDiscount: 0 };
    }

    const total = order.items.reduce((sum, item) => {
      const menuItem = menu.find((m) => m.id === item.menu_item_id);
      if (!menuItem) return sum;
      return sum + menuItem.price * item.quantity;
    }, 0);

    const discountValue = order.discount ? (total * order.discount) / 100 : 0;
    const totalAfterDiscount = total - discountValue;

    return { total, totalAfterDiscount };
  };

  // Other placeholder helpers (implement as needed)
  const updateStatus = (orderId, newStatus) => {
    api
      .put(`/orders/${orderId}/status`, { status: newStatus }) // ✅ correct route
      .then(() => fetchAll())
      .catch(() => alert("Failed to update order status"));
  };

  const updateItemStatus = (itemId, newStatus) => {
    api
      .put(`/order-items/${itemId}/status`, { status: newStatus }) // ✅ correct route
      .then(() => fetchAll())
      .catch(() => alert("Failed to update item status"));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(orders.length / itemsPerPage)) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const addItemToForm = (menuItemId, type) => {
    if (type === "create") {
      setCreateForm((prevForm) => {
        const existingItemIndex = prevForm.items.findIndex(item => item.menu_item_id === menuItemId);

        if (existingItemIndex > -1) {
          const updatedItems = [...prevForm.items];
          updatedItems[existingItemIndex].quantity += 1;
          return { ...prevForm, items: updatedItems };
        } else {
          return { ...prevForm, items: [...prevForm.items, { menu_item_id: menuItemId, quantity: 1 }] };
        }
      });
    } else if (type === "addItems") {
      setAddItemsForm((prevForm) => {
        const existingItemIndex = prevForm.items.findIndex(item => item.menu_item_id === menuItemId);

        if (existingItemIndex > -1) {
          const updatedItems = [...prevForm.items];
          updatedItems[existingItemIndex].quantity += 1;
          return { ...prevForm, items: updatedItems };
        } else {
          return { ...prevForm, items: [...prevForm.items, { menu_item_id: menuItemId, quantity: 1 }] };
        }
      });
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (type === "create") {
      setSubmitting(true);
      try {
        const payload = {
          table_id: createForm.table_id,
          discount: Number(createForm.discount) || 0,
          items: createForm.items.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
          })),
        };
        await api.post("/orders", payload);
        setShowCreateOrder(false);
        setCreateForm({ table_id: "", items: [], discount: 0 });
        fetchAll();
      } catch (err) {
        alert("Failed to create order");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const addItemsToOrder = async () => {
    if (!addItemsOrder || !addItemsForm.items.length) return;

    setSubmitting(true);
    try {
      const payload = {
        items: addItemsForm.items.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      };
      await api.put(`/orders/${addItemsOrder.id}/add-items`, payload);
      setAddItemsOrder(null);
      setAddItemsForm({ items: [] });
      fetchAll();
    } catch {
      alert("Failed to add items");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteOrder = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(`/orders/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchAll();
    } catch {
      alert("Failed to delete order");
    }
  };
  const handlePaymentSuccess = (paidOrder) => {
  setPaymentSuccess(true);
  setTimeout(() => setPaymentSuccess(false), 3000);

  if (!paidOrder) return;

  // Prepare invoice order structure with calculated fields
  const discountPercent = paidOrder.discount || 0;

  const itemsWithDetails = paidOrder.items.map(item => {
    const menuItem = menu.find(m => m.id === item.menu_item_id);
    const price = Number(menuItem?.price || 0);
    return {
      name: menuItem?.name || "Unknown Item",
      quantity: item.quantity,
      price,
      subtotal: price * item.quantity,
    };
  });

  const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  setInvoiceOrder({
    ...paidOrder,
    invoice_number: paidOrder.id, // or use another number generator if you want
    items: itemsWithDetails,
    subtotal,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    total,
  });

  setShowInvoice(true);
  setPaymentOrder(null); // Close Payment modal
};


  return (
    <div className="orders-container">
      {paymentSuccess && (
        <div className="payment-success-notification">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <span>Payment processed successfully!</span>
          </div>
        </div>
      )}

      <div className="card">
        <OrdersHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          canCreate={canCreate}
          setShowCreateOrder={setShowCreateOrder}
        />

        <LoadingAndErrorStates loading={loading} error={error} fetchAll={fetchAll} />

        {!loading && !error && (
          <OrdersTable
            orders={orders}
            tables={tables}
            menu={menu}
            role={role}
            setPaymentOrder={setPaymentOrder}
            setAddItemsOrder={setAddItemsOrder}
            setAddItemsForm={setAddItemsForm}
            setDeleteConfirm={setDeleteConfirm}
            updateStatus={updateStatus}
            updateItemStatus={updateItemStatus}
            calculateOrderTotal={calculateOrderTotal}
            getStatusColor={() => "#ddd"} // implement as needed
            getStatusIcon={() => null}   // implement as needed
            sortConfig={sortConfig}
            handleSort={handleSort}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={Math.ceil(orders.length / itemsPerPage)}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            canCreate={canCreate}
            setShowCreateOrder={setShowCreateOrder}
          />
        )}
      </div>

      <CreateOrderModal
        showCreateOrder={showCreateOrder}
        setShowCreateOrder={setShowCreateOrder}
        createForm={createForm}
        setCreateForm={setCreateForm}
        tables={tables}
        menu={menu}
        addItemToForm={addItemToForm}
        handleSubmit={handleSubmit}
        submitting={submitting}
      />

      <AddItemsModal
        addItemsOrder={addItemsOrder}
        setAddItemsOrder={setAddItemsOrder}
        addItemsForm={addItemsForm}
        setAddItemsForm={setAddItemsForm}
        menu={menu}
        addItemToForm={addItemToForm}
        addItemsToOrder={addItemsToOrder}
        submitting={submitting}
      />

      <PaymentModal
        paymentOrder={paymentOrder}
        setPaymentOrder={setPaymentOrder}
        setQrPaymentMode={setQrPaymentMode}
        qrPaymentMode={qrPaymentMode}
        setPaymentSuccess={setPaymentSuccess}
        loadingPayment={loadingPayment}
        menu={menu}
         setShowInvoice={setShowInvoice}
        setInvoiceOrder={setInvoiceOrder}
      />

      <InvoiceModal
        showInvoice={showInvoice}
        setShowInvoice={setShowInvoice}
        invoiceOrder={invoiceOrder}
        setInvoiceOrder={setInvoiceOrder}
      />

      <DeleteConfirmationModal
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        deleteOrder={deleteOrder}
      />
    </div>
  );
}
