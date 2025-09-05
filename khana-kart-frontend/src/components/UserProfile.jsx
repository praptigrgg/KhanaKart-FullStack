import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { FaEdit } from "react-icons/fa";

const styles = {
  container: {
    maxWidth: 800,
    margin: "2rem auto",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
  },
  heading: {
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  form: {
    backgroundColor: "white",
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
  },
  label: {
    fontWeight: 600,
    marginBottom: 4,
    color: "#34495e",
  },
  buttonPrimary: {
    cursor: "pointer",
    padding: "0.6rem 1.2rem",
    borderRadius: 4,
    fontWeight: 600,
    fontSize: 16,
    border: "none",
    backgroundColor: "#674b8b",
    color: "white",
    transition: "background-color 0.25s ease",
  },
};

export default function UserProfile() {
  const { user, role } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    age: "",
    contactNumber: "",
    temporaryAddress: "",
    permanentAddress: "",
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch current user profile data
    if (user?.id) {
      api
        .get(`/users/${user.id}`)
        .then((res) => setProfileData(res.data))
        .catch((err) => setError(err?.response?.data?.message || err.message));
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .put(`/users/${user.id}`, profileData)
      .then(() => setEditing(false))
      .catch((err) => setError(err?.response?.data?.message || err.message));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>User Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            disabled={!editing}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            disabled={!editing}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Age</label>
          <input
            type="number"
            name="age"
            value={profileData.age}
            onChange={handleChange}
            disabled={!editing}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={profileData.contactNumber}
            onChange={handleChange}
            disabled={!editing}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Temporary Address</label>
          <input
            type="text"
            name="temporaryAddress"
            value={profileData.temporaryAddress}
            onChange={handleChange}
            disabled={!editing}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Permanent Address</label>
          <input
            type="text"
            name="permanentAddress"
            value={profileData.permanentAddress}
            onChange={handleChange}
            disabled={!editing}
            style={styles.input}
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          {editing ? (
            <>
              <button type="submit" style={styles.buttonPrimary}>
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={styles.buttonPrimary}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={styles.buttonPrimary}
            >
              <FaEdit />
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
