import React, { useState, useEffect } from 'react';
import {api} from '../api/client';
import  '../pages/inventory.css';

const SupplierList = ({ onEdit, onDelete }) => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get('/suppliers');
        setSuppliers(response.data);
      } catch (error) {
        console.error('Error fetching suppliers', error);
      }
    };

    fetchSuppliers();
  }, []);

  return (
    <div className='list-container'>
      <h2>Suppliers</h2>
      <table className='list-table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td>
              <td>{JSON.stringify(supplier.contact_info)}</td>
              <td>
                <button onClick={() => onEdit(supplier)}>Edit</button>
                <button onClick={() => onDelete(supplier.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;
