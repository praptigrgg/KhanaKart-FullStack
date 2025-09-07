import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

const PurchaseForm = ({ purchaseToEdit, onPurchaseSaved }) => {
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Load items and suppliers for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, suppliersRes] = await Promise.all([
          api.get('/items'),
          api.get('/suppliers')
        ]);
        setItems(itemsRes.data);
        setSuppliers(suppliersRes.data);
      } catch (error) {
        console.error('Error fetching items or suppliers:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (purchaseToEdit) {
      setItemId(purchaseToEdit.itemId || '');
      setQuantity(purchaseToEdit.quantity || '');
      setSupplierId(purchaseToEdit.supplierId || '');
      setDate(purchaseToEdit.date ? purchaseToEdit.date.substring(0, 10) : '');
    } else {
      setItemId('');
      setQuantity('');
      setSupplierId('');
      setDate('');
    }
  }, [purchaseToEdit]);

 const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
    supplier_id: supplierId,
    quantity: Number(quantity),
    price: 0, // TODO: Add price input and update this
    type: 'increase', // TODO: Add type input (e.g., dropdown)
  };

  try {
    if (purchaseToEdit) {
      await api.put(`/purchases/${purchaseToEdit.id}`, data);
    } else {
      await api.post(`/purchases/${itemId}`, data);
    }

    onPurchaseSaved();

    if (!purchaseToEdit) {
      setItemId('');
      setQuantity('');
      setSupplierId('');
      setDate('');
    }
  } catch (error) {
    console.error('Error saving purchase:', error);
    alert('Failed to save purchase, please try again.');
  }
};

  return (
    <form onSubmit={handleSubmit} className="purchase-form">
      <h2>{purchaseToEdit ? 'Edit Purchase/Adjustment' : 'Add New Purchase/Adjustment'}</h2>

      <select
        value={itemId}
        onChange={e => setItemId(e.target.value)}
        required
      >
        <option value="" disabled>Select Item</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        required
        min="0"
      />

      <select
        value={supplierId}
        onChange={e => setSupplierId(e.target.value)}
        required
      >
        <option value="" disabled>Select Supplier</option>
        {suppliers.map(supplier => (
          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      <button type="submit">{purchaseToEdit ? 'Update' : 'Add'}</button>
    </form>
  );
};

export default PurchaseForm;
