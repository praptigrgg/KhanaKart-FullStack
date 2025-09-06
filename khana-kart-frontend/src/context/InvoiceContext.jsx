import { createContext, useContext, useEffect, useState } from 'react';
import { fetchInvoices } from '../services/invoiceAPI';

const InvoiceContext = createContext();
export const useInvoice = () => useContext(InvoiceContext);

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const data = await fetchInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Failed to load invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  // ✅ Add this function
  const addInvoice = (invoice) => {
    setInvoices((prev) => [...prev, invoice]);
  };

  return (
    <InvoiceContext.Provider value={{ invoices, loading, addInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}
