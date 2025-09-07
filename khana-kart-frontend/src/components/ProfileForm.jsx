import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    padding: 24,
    maxWidth: 768,
    margin: "0 auto",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  messageSuccess: {
    color: "#2f855a", // green
    marginBottom: 8,
  },
  messageError: {
    color: "#c53030", // red
    marginBottom: 8,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #d1d5db", // gray-300
    marginBottom: 16,
  },
  th: {
    border: "1px solid #d1d5db",
    padding: "8px 16px",
    textAlign: "left",
    backgroundColor: "#f9fafb", // gray-50
    fontWeight: "600",
  },
  td: {
    border: "1px solid #d1d5db",
    padding: "8px 16px",
  },
  buttonPrimary: {
    backgroundColor: "#a9734c", // blue-600
    color: "white",
    padding: "10px 16px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  buttonPrimaryDisabled: {
    backgroundColor: "rgba(135, 138, 144, 1)",
    opacity: 0.5,
    cursor: "wait",
  },
  buttonSecondary: {
    backgroundColor: "#6b7280", // gray-500
    color: "white",
    padding: "10px 16px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  },
  formGridMd: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  input: {
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #d1d5db",
  },
  buttonGroup: {
    marginTop: 16,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
};

export default function ProfileForm({ userId = null, isAdmin = false }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();

  const endpoint = userId ? `/profiles/${userId}` : "/profile";

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setEditing(false);

    api
      .get(endpoint)
      .then((res) => {
        if (!res.data) {
          setError("Profile not found.");
          setProfile(null);
        } else {
          setProfile(res.data);
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setError("Profile not found.");
        } else {
          setError(err?.response?.data?.message || "Failed to load profile.");
        }
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put(endpoint, profile);
      setSuccess("Profile updated successfully.");
      setEditing(false);

  
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: 24 }}>Loading profile...</p>;
  if (error) return <p style={{ padding: 24, color: "#c53030" }}>⚠️ {error}</p>;
  if (!profile) return <p style={{ padding: 24, color: "#c53030" }}>No profile data available.</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{isAdmin ? "Edit User Profile" : "My Profile"}</h1>

      {success && <p style={styles.messageSuccess}>✅ {success}</p>}
      {error && <p style={styles.messageError}>⚠️ {error}</p>}

      {!editing ? (
        <>
          <table style={styles.table}>
            <tbody>
              <tr>
                <th style={styles.th}>Name</th>
                <td style={styles.td}>{profile.name}</td>
              </tr>
              <tr>
                <th style={styles.th}>Email</th>
                <td style={styles.td}>{profile.email}</td>
              </tr>
              <tr>
                <th style={styles.th}>Age</th>
                <td style={styles.td}>{profile.age || "-"}</td>
              </tr>
              <tr>
                <th style={styles.th}>Contact Number</th>
                <td style={styles.td}>{profile.contact_number || "-"}</td>
              </tr>
              <tr>
                <th style={styles.th}>Temporary Address</th>
                <td style={styles.td}>{profile.temporary_address || "-"}</td>
              </tr>
              <tr>
                <th style={styles.th}>Permanent Address</th>
                <td style={styles.td}>{profile.permanent_address || "-"}</td>
              </tr>
            </tbody>
          </table>

          <button
            onClick={() => setEditing(true)}
            style={styles.buttonPrimary}
            type="button"
          >
            Edit Profile
          </button>
        </>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ ...styles.formGrid, ...styles.formGridMd }}
        >
          <input
            name="name"
            placeholder="Name"
            value={profile.name || ""}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={profile.email || ""}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            name="age"
            type="number"
            placeholder="Age"
            value={profile.age || ""}
            onChange={handleChange}
            style={styles.input}
            min={0}
            max={150}
          />
          <input
            name="contact_number"
            placeholder="Contact Number"
            value={profile.contact_number || ""}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="temporary_address"
            placeholder="Temporary Address"
            value={profile.temporary_address || ""}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="permanent_address"
            placeholder="Permanent Address"
            value={profile.permanent_address || ""}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={{
                ...styles.buttonPrimary,
                ...(saving ? styles.buttonPrimaryDisabled : {}),
                flex: 1,
                minWidth: 120,
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
                setSuccess(null);
              }}
              style={{ ...styles.buttonSecondary, flex: 1, minWidth: 120 }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
