import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

const SupplierForm = ({ supplierToEdit, onSupplierSaved }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name || '');
      setContact(supplierToEdit.contact || '');
      setEmail(supplierToEdit.email || '');
      setAddress(supplierToEdit.address || '');
    } else {
      setName('');
      setContact('');
      setEmail('');
      setAddress('');
    }
  }, [supplierToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { name, contact, email, address };

    try {
      if (supplierToEdit) {
        await api.put(`/suppliers/${supplierToEdit.id}`, data);
      } else {
        await api.post('/suppliers', data);
      }

      onSupplierSaved();
      if (!supplierToEdit) {
        setName('');
        setContact('');
        setEmail('');
        setAddress('');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier, please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="supplier-form">
      <h2>{supplierToEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
      <input
        type="text"
        placeholder="Supplier Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Contact Number"
        value={contact}
        onChange={e => setContact(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      <button type="submit">{supplierToEdit ? 'Update Supplier' : 'Add Supplier'}</button>
    </form>
  );
};

export default SupplierForm;
