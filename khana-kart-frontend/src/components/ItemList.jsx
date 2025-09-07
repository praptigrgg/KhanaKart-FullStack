import React, { useState, useEffect } from 'react';
import {api} from '../api/client';
import  '../pages/inventory.css';



const ItemList = ({ items, onEdit, onDelete }) => {
  return (
    <div className="list-container">
      <h2>Items</h2>
      <table className="list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan="5">No items found.</td></tr>
          ) : (
            items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.price}</td>
                <td>
                  <button onClick={() => onEdit(item)}>Edit</button>
                  <button onClick={() => onDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ItemList;
