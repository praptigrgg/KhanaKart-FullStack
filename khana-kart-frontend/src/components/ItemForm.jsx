import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

const ItemForm = ({ itemToEdit, onItemSaved }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');

  // When editing an existing item, populate the form
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setQuantity(itemToEdit.quantity || '');
      setUnit(itemToEdit.unit || '');
      setPrice(itemToEdit.price || '');
    } else {
      // Reset form if no item to edit
      setName('');
      setQuantity('');
      setUnit('');
      setPrice('');
    }
  }, [itemToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation can be added here if needed

    const data = {
      name,
      quantity: Number(quantity),
      unit,
      price: Number(price),
    };

    try {
      if (itemToEdit) {
        await api.put(`/items/${itemToEdit.id}`, data);
      } else {
        await api.post('/items', data);
      }

      onItemSaved(); // Notify parent to refresh list & reset edit mode

      // Clear form after submit if adding new item
      if (!itemToEdit) {
        setName('');
        setQuantity('');
        setUnit('');
        setPrice('');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item, please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <h2>{itemToEdit ? 'Edit Item' : 'Add New Item'}</h2>
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        required
        min="0"
      />
      <input
        type="text"
        placeholder="Unit (e.g. pcs, kg)"
        value={unit}
        onChange={e => setUnit(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price (optional)"
        value={price}
        onChange={e => setPrice(e.target.value)}
        min="0"
        step="0.01"
      />
      <button type="submit">{itemToEdit ? 'Update Item' : 'Add Item'}</button>
    </form>
  );
};

export default ItemForm;
