import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";

const styles = {
  container: {
    maxWidth: 800,
    margin: "2rem auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    backgroundColor: "#ffffffff",
    padding: "2rem",
    borderRadius: 8,
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
  },
  heading: {
    color: "#92553a",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  form: {
    backgroundColor: "#dec6b8ff",
    padding: "1.5rem",
    borderRadius: 6,
    marginBottom: "2rem",
    boxShadow: "0 2px 6px rgba(44,62,80,0.1)",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem 0.7rem",
    border: "1.5px solid #ccc",
    borderRadius: 4,
    fontSize: 16,
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  inputFocus: {
    borderColor: "#ae836d",
    boxShadow: "0 0 6px rgba(41,128,185,0.3)",
  },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: 4,
    color: "#000000ff",
  },
  select: {
    width: "100%",
    padding: "0.5rem 0.7rem",
    border: "1.5px solid #ccc",
    borderRadius: 4,
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  buttonPrimary: {
    cursor: "pointer",
    padding: "0.6rem 1.2rem",
    borderRadius: 4,
    fontWeight: 600,
    fontSize: 16,
    border: "none",
    backgroundColor: "#ae836d",
    color: "white",
    transition: "background-color 0.25s ease",
  },
  buttonPrimaryHover: {
    backgroundColor: "#ae836d",
  },
  buttonCancel: {
    cursor: "pointer",
    padding: "0.6rem 1.2rem",
    borderRadius: 4,
    fontWeight: 600,
    fontSize: 16,
    border: "none",
    backgroundColor: "#bdc3c7",
    color: "#2c3e50",
    transition: "background-color 0.25s ease",
    marginLeft: 12,
  },
  buttonCancelHover: {
    backgroundColor: "#95a5a6",
    color: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(44,62,80,0.1)",
  },
  th: {
    padding: "0.8rem 1rem",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#a9734c",
    color: "white",
    fontWeight: 600,
  },
  td: {
    padding: "0.8rem 1rem",
    borderBottom: "1px solid #ddd",
  },
  trHover: {
    backgroundColor: "#ecf0f1",
  },
  btnIcon: {
    background: "transparent",
    border: "none",
    color: "#4a3060",
    fontSize: 18,
    marginRight: 8,
    padding: "0.2rem 0.4rem",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background-color 0.25s ease",
  },
  btnIconDanger: {
    color: "#e74c3c",
  },
  btnIconHover: {
    backgroundColor: "#c9c0ceff",
  },
  btnIconDangerHover: {
    backgroundColor: "#fea6a6ff",
  },
  errorMessage: {
    color: "#b00020",
    fontWeight: 600,
    marginTop: "1rem",
    textAlign: "center",
  },
  spinner: {
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },
};

// Add spin animation with a style tag for keyframes
const SpinStyle = () => (
  <style>
    {`
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
    `}
  </style>
);

export default function Users() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "waiter",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role]);

  const fetchUsers = () => {
    setLoading(true);
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      api.put(`/users/${editingUser.id}`, formData).then(() => {
        fetchUsers();
        setEditingUser(null);
        setFormData({
          name: "",
          email: "",
          role: "waiter",
          password: "",
          password_confirmation: "",
        });
      });
    } else {
      api.post("/users", formData).then(() => {
        fetchUsers();
        setFormData({
          name: "",
          email: "",
          role: "waiter",
          password: "",
          password_confirmation: "",
        });
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      password_confirmation: "",
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    api.delete(`/users/${id}`).then(fetchUsers);
  };

  if (role !== "admin") {
    return (
      <p style={{ color: "#b00020", padding: 24, textAlign: "center" }}>
        You are not authorized to view this page.
      </p>
    );
  }

  return (
    <div style={styles.container}>
      <SpinStyle />
      <h1 style={styles.heading}>Manage Users</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Name"
              style={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password_confirmation">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              type="password"
              placeholder="Confirm Password"
              style={styles.input}
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              required={!editingUser}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="role">
              Role
            </label>
            <select
              id="role"
              style={styles.select}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>

            </select>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            style={styles.buttonPrimary}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.buttonPrimaryHover.backgroundColor)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.buttonPrimary.backgroundColor)}
          >
            {editingUser ? (
              <>
                <FaEdit />
                Update User
              </>
            ) : (
              <>
                <FaPlus />
                Add User
              </>
            )}
          </button>
          {editingUser && (
            <button
              type="button"
              style={styles.buttonCancel}
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  name: "",
                  email: "",
                  role: "waiter",
                  password: "",
                  password_confirmation: "",
                });
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.buttonCancelHover.backgroundColor;
                e.currentTarget.style.color = styles.buttonCancelHover.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.buttonCancel.backgroundColor;
                e.currentTarget.style.color = styles.buttonCancel.color;
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Error */}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.container}>
        <SpinStyle />
        <h1 style={styles.heading}>Users List</h1>
        {/* Users Table */}
        {loading ? (
          <p style={{ textAlign: "center" }}>
            <FaSpinner style={styles.spinner} /> Loading users...
          </p>
        ) : (

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...styles.td, textAlign: "center" }}>
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr
                  key={u.id}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.trHover.backgroundColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.btnIcon}
                      title="Edit"
                      onClick={() => handleEdit(u)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.btnIconHover.backgroundColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <FaEdit />
                    </button>
                    <button
                      style={{ ...styles.btnIcon, ...styles.btnIconDanger }}
                      title="Delete"
                      onClick={() => handleDelete(u.id)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.btnIconDangerHover.backgroundColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        )}
      </div>

    </div>
  );
}
