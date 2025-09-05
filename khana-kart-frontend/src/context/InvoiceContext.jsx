import React, { createContext, useContext, useState, useEffect } from 'react';

const InvoiceContext = createContext();

export const useInvoice = () => useContext(InvoiceContext);

// Simple validation function, returns true if invoice is valid
function validateInvoice(invoice) {
  if (typeof invoice !== 'object' || invoice === null) return false;

  const hasId = typeof invoice.id === 'string' || typeof invoice.id === 'number';
  const hasTable = typeof invoice.table === 'string' || typeof invoice.table === 'number';
  const hasItems = Array.isArray(invoice.items) && invoice.items.every(item =>
    typeof item.name === 'string' &&
    typeof item.qty === 'number' &&
    typeof item.price === 'number'
  );
  const hasSubtotal = typeof invoice.subtotal === 'number';
  const hasDiscount = typeof invoice.discount === 'number';
  const hasDiscountPercent = typeof invoice.discountPercent === 'number';
  const hasTotal = typeof invoice.total === 'number';
  const hasStatus = typeof invoice.status === 'string';

  return hasId && hasTable && hasItems && hasSubtotal && hasDiscount &&
         hasDiscountPercent && hasTotal && hasStatus;
}

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('all_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Ignore malformed JSON
      }
    }
    return [];
  });

  const addInvoice = (invoice) => {
    if (!validateInvoice(invoice)) {
      console.warn('Invalid invoice structure, skipping add:', invoice);
      return;
    }

    setInvoices((prev) => {
      const existsIndex = prev.findIndex(inv => inv.id === invoice.id);
      let updated;

      if (existsIndex !== -1) {
        // Optional: Update existing invoice instead of ignoring
        updated = [...prev];
        updated[existsIndex] = invoice;
      } else {
        updated = [...prev, invoice];
      }

      localStorage.setItem('all_invoices', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const syncStorage = () => {
      const saved = localStorage.getItem('all_invoices');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setInvoices(parsed);
        } catch {
          // Ignore malformed JSON
        }
      }
    };
    window.addEventListener('storage', syncStorage);
    return () => window.removeEventListener('storage', syncStorage);
  }, []);

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}
