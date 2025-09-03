// src/pages/ProfilePage.jsx
import React from "react";
import ProfileForm from "../components/ProfileForm";
import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { id } = useParams(); // This will be undefined on /profile and defined on /profiles/:id
  const isAdminEditing = Boolean(id);

  return <ProfileForm userId={id} isAdmin={isAdminEditing} />;
}
