import axios from 'axios';

const API_BASE = 'http://localhost:8000/api'; // change to your Laravel API URL

// GET all invoices
export const fetchInvoices = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Optional: Get single invoice
export const fetchInvoiceById = async (id) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}/invoices/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
