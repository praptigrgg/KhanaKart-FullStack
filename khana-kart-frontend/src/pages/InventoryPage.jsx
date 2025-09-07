import React, { useState, useEffect } from 'react';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import SupplierForm from '../components/SupplierForm';
import SupplierList from '../components/SupplierList';
import PurchaseForm from '../components/PurchaseForm';
import { api } from '../api/client';

import './InventoryPage.css';

export default function InventoryPage() {
  const [selectedSection, setSelectedSection] = useState(null);

  // Items state
  const [items, setItems] = useState([]);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [supplierToEdit, setSupplierToEdit] = useState(null);

  // Fetch functions
  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    }
  };

  // On section change, fetch corresponding data
  useEffect(() => {
    if (selectedSection === 'items') {
      fetchItems();
      setItemToEdit(null);
    }
    if (selectedSection === 'suppliers') {
      fetchSuppliers();
      setSupplierToEdit(null);
    }
  }, [selectedSection]);

  // After form saves, refresh the list
  const handleItemSaved = () => {
    setItemToEdit(null);
    fetchItems();
  };

  const handleSupplierSaved = () => {
    setSupplierToEdit(null);
    fetchSuppliers();
  };

  const sections = [
    {
      key: 'items',
      title: 'Stock Items',
      description: 'Manage inventory items and their stock levels.',
    },
    {
      key: 'suppliers',
      title: 'Suppliers',
      description: 'View and manage suppliers and their contact details.',
    },
    {
      key: 'purchases',
      title: 'Purchases / Adjustments',
      description: 'Adjust stock and log new purchases.',
    },
  ];

  const renderSection = () => {
    switch (selectedSection) {
      case 'items':
        return (
          <>
            <ItemForm itemToEdit={itemToEdit} onItemSaved={handleItemSaved} />
            <ItemList items={items} onEdit={setItemToEdit} />
          </>
        );
      case 'suppliers':
        return (
          <>
            <SupplierForm
              supplierToEdit={supplierToEdit}
              onSupplierSaved={handleSupplierSaved}
            />
            <SupplierList suppliers={suppliers} onEdit={setSupplierToEdit} />
          </>
        );
      case 'purchases':
        return <PurchaseForm />;
      default:
        return (
          <div className="card-grid">
            {sections.map((section) => (
              <div
                key={section.key}
                className="card"
                onClick={() => setSelectedSection(section.key)}
              >
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="inventory-dashboard">
      <h1 className="dashboard-heading">Inventory Management</h1>

      {selectedSection && (
        <button className="back-button" onClick={() => setSelectedSection(null)}>
          ← Back to Dashboard
        </button>
      )}

      <div className="inventory-tab-content">{renderSection()}</div>
    </div>
  );
}
