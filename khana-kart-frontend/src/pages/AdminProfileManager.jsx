import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../context/AuthContext";

export default function AdminProfileManager() {
  const { role } = useAuth(); // Get role from AuthContext
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  useEffect(() => {
  console.log("useEffect triggered, role:", role);  // Check if role is 'admin'
  if (role === 'admin') {
    // Only fetch users if the logged-in user is an admin
    setLoadingUsers(true);
    api.get('/users')
      .then(res => {
        console.log("Fetched users:", res.data);  // Log the users data
        setUsers(res.data);  // Set users state
        setErrorUsers(null);
      })
      .catch(() => {
        setErrorUsers("Failed to load users.");
      })
      .finally(() => setLoadingUsers(false));
  } else {
    setErrorUsers("You do not have permission to view other users.");
    setLoadingUsers(false);
  }
}, [role]);



  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage User Profiles</h1>

      {errorUsers && <p className="text-red-600">{errorUsers}</p>}

      {selectedUserId ? (
        <ProfileForm userId={selectedUserId} isAdmin={true} />
      ) : (
        <p className="text-gray-600 mb-4">Select a user to view or edit their profile.</p>
      )}

      {/* Users List */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Users List</h2>

        {loadingUsers && <p>Loading users...</p>}
        {errorUsers && <p className="text-red-600">{errorUsers}</p>}

        {!loadingUsers && !errorUsers && (
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
             {users.map(user => (
  <tr
    key={user.id}
    onClick={() => {
      setSelectedUserId(user.id);  // Set the selected user ID
      console.log("Selected user ID:", user.id);  // Log the selected user ID
    }}
    className={`cursor-pointer hover:bg-gray-100 ${
      user.id === selectedUserId ? "bg-blue-100 font-semibold" : ""
    }`}
  >
    <td className="border border-gray-300 px-4 py-2">{user.id}</td>
    <td className="border border-gray-300 px-4 py-2">{user.name}</td>
    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
  </tr>
))}

            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
