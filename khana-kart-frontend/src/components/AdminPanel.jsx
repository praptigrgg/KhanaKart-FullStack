import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { FaEdit, FaTrash } from "react-icons/fa";

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: 6,
    boxShadow: "0 2px 6px rgba(44,62,80,0.1)",
  },
  th: {
    padding: "0.8rem 1rem",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#564172ff",
    color: "white",
  },
  td: {
    padding: "0.8rem 1rem",
    borderBottom: "1px solid #ddd",
  },
  btnIcon: {
    background: "transparent",
    border: "none",
    color: "#674b8b",
    fontSize: 18,
    marginRight: 8,
    padding: "0.2rem 0.4rem",
    borderRadius: 4,
    cursor: "pointer",
  },
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all users for admin to manage
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err?.response?.data?.message || err.message));
  }, []);

  const handleEdit = (userId) => {
    // Redirect to user profile or open modal to edit user
    // For now, this can just log the ID or navigate
    console.log("Edit user", userId);
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      api
        .delete(`/users/${userId}`)
        .then(() => {
          setUsers(users.filter((user) => user.id !== userId));
        })
        .catch((err) => setError(err?.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto", fontFamily: "'Segoe UI', Tahoma" }}>
      <h2>Admin Panel - Manage Users</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Age</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.age}</td>
              <td style={styles.td}>
                <button
                  style={styles.btnIcon}
                  onClick={() => handleEdit(user.id)}
                >
                  <FaEdit />
                </button>
                <button
                  style={styles.btnIcon}
                  onClick={() => handleDelete(user.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
