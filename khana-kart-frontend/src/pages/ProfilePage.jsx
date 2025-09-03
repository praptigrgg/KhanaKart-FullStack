import React, { useState, useEffect } from "react";
import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const styles = {
  userList: {
    listStyle: "none",
    padding: 0,
    margin: "1rem 0",
    maxWidth: 400,
    border: "1px solid #ddd",
    borderRadius: 6,
    backgroundColor: "#fafafa",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  userListItem: {
    padding: "10px 15px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  userListItemLast: {
    borderBottom: "none",
  },
  selectedUserListItem: {
    backgroundColor: "#cce0ff",
    fontWeight: 600,
    cursor: "default",
  },
  selectedUserProfile: {
    marginTop: "1.5rem",
    padding: "1rem",
    maxWidth: 700,
    border: "1px solid #ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  },
  btnPrimary: {
    padding: "0.5rem 1rem",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    backgroundColor: "#2d72d9",
    color: "white",
    transition: "background-color 0.3s ease",
  },
  btnPrimaryHover: {
    backgroundColor: "#1a4bb8",
  },
  btnSecondary: {
    padding: "0.5rem 1rem",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    backgroundColor: "#aaa",
    color: "white",
    transition: "background-color 0.3s ease",
  },
  btnSecondaryHover: {
    backgroundColor: "#888",
  },
  heading: {
    marginBottom: "0.75rem",
  },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (user?.role === "admin") {
      setLoadingUsers(true);
      api
        .get("/users")
        .then((res) => {
          setUsers(res.data || []);
        })
        .catch(() => {
          setUsers([]);
        })
        .finally(() => setLoadingUsers(false));
    }
  }, [user]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={styles.heading}>My Profile</h2>
      <ProfileForm userId={null} isAdmin={false} />

      {user?.role === "admin" && (
        <>
          <h2 style={{ ...styles.heading, marginTop: "2rem" }}>Other Users</h2>

          {loadingUsers && <p>Loading users...</p>}

          {!loadingUsers && users.length === 0 && <p>No users found.</p>}

          {!loadingUsers && users.length > 0 && (
            <ul style={styles.userList}>
              {users.map((u, idx) => {
                const isSelected = selectedUserId === u.id;
                const itemStyle = {
                  ...styles.userListItem,
                  ...(idx === users.length - 1 ? styles.userListItemLast : {}),
                  ...(isSelected ? styles.selectedUserListItem : {}),
                };
                return (
                  <li
                    key={u.id}
                    style={itemStyle}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <span style={{ fontWeight: "bold", minWidth: 24 }}>{idx + 1}.</span>
                    <span>{u.name} ({u.email})</span>
                  </li>
                );
              })}
            </ul>
          )}

          {selectedUserId && (
            <div style={styles.selectedUserProfile}>
              <h3 style={styles.heading}>
                Editing Profile of {users.find((u) => u.id === selectedUserId)?.name}
              </h3>
              <ProfileForm userId={selectedUserId} isAdmin={true} />
              <button
                style={styles.btnSecondary}
                onClick={() => setSelectedUserId(null)}
              >
                Close
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
