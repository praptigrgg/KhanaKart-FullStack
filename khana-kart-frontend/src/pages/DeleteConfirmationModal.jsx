import React from "react";
import { FaTimes, FaTrash, FaExclamationTriangle } from "react-icons/fa";

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: 8,
    padding: "1.5rem 2rem",
    maxWidth: 400,
    width: "90%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    position: "relative",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  btnIcon: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    color: "#444",
  },
  deleteContent: {
    textAlign: "center",
  },
  deleteWarning: {
    marginBottom: "1.5rem",
  },
  warningIcon: {
    fontSize: "2rem",
    color: "#e74c3c",
    marginBottom: "0.5rem",
  },
  formActions: {
    display: "flex",
    justifyContent: "space-around",
    gap: "1rem",
  },
  btnSecondary: {
    padding: "0.5rem 1.2rem",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    backgroundColor: "#ccc",
    color: "#333",
  },
  btnDanger: {
    padding: "0.5rem 1.2rem",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    backgroundColor: "#e74c3c",
    color: "#fff",
  },
};

export default function DeleteConfirmationModal({
  deleteConfirm,
  setDeleteConfirm,
  deleteOrder,
}) {
  if (!deleteConfirm) return null;

  return (
    <div style={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
      <div
        style={styles.modalContent}
        className="delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h3>Confirm Delete</h3>
          <button
            style={styles.btnIcon}
            className="btn btn-icon"
            onClick={() => setDeleteConfirm(null)}
          >
            <FaTimes />
          </button>
        </div>

        <div style={styles.deleteContent}>
          <div style={styles.deleteWarning}>
            <FaExclamationTriangle style={styles.warningIcon} />
            <p>Are you sure you want to delete Order #{deleteConfirm.id}?</p>
            <p>This action cannot be undone.</p>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              style={styles.btnDanger}
              onClick={() => deleteOrder(deleteConfirm.id)}
            >
              <FaTrash /> Delete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
