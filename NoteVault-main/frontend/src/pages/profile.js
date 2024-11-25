import React, { useState, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {FaTimes } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState(""); // New state for first name
  const [lastName, setLastName] = useState(""); // New state for last name
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [image, setImage] = useState(null); // State to store the profile image
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/profile/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setEmail(data.email);
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setOriginalData({
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
          });
          if (data.image) {
            setImage(data.image);
            setIsImageUploaded(true);
          }
        } else {
          toast.error('Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('An error occurred');
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateEmail = async () => {
    try {
      const response = await fetch('http://localhost:8000/profile/', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Email updated successfully');
        setIsEditingEmail(false); // Exit editing mode
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update email');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      toast.error('An error occurred');
    }
  };
  const handleCancel = () => {
    setFirstName(originalData.firstName);
    setLastName(originalData.lastName);
    setEmail(originalData.email);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setIsImageUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setIsImageUploaded(false);
  };
  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:8000/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        setOriginalData({ firstName, lastName, email });
        setIsEditing(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("An error occurred");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }
    
    try {
    const response = await fetch('http://localhost:8000/reset-password/', {
        method: 'POST',
        headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        }),
    });

    if (response.ok) {
        toast.success('Password reset successfully');
        setIsResetPasswordOpen(false); // Close dialog
    } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reset password');
    }
    } catch (err) {
    console.error('Error resetting password:', err);
    toast.error('An error occurred');
    }
    
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
    <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative -top-12" >
      <h1 className="text-3xl text-center text-white font-bold mb-6">Profile</h1>
      <button
            onClick={() => navigate('/')}
            className="absolute top-2 right-2 bg-white hover:bg-red-500 text-black py-2 px-4 rounded"
          >
            <FaTimes className="text-2xl text-black" />
          </button>
        {/* Profile Image Section */}
        <div className="flex justify-center mb-6">
<div className="relative flex-col items-center">
  <img
    src={image ? image : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} // Default image if no profile image
    alt="Profile"
    className="w-32 h-32 rounded-full object-cover"
  />
  <div  
  className="flex justify-center space-x-4 mt-[3mm]">
    {/* Upload Icon */}
    <i
      className="fas fa-upload text-black black p-2 rounded-full shadow-lg cursor-pointer"
      onClick={() => document.getElementById("file-input").click()}
      title="Upload Image"
    ></i>

    {/* Remove Icon */}
    <i
      className="fas fa-trash text-black black p-2 rounded-full shadow-lg cursor-pointer"
      onClick={handleRemoveImage}
      title="Remove Image"
    ></i>
  </div>
  <input
    type="file"
    id="file-input"
    onChange={handleImageUpload}
    className="hidden"
  />
</div>
</div>




      {/* First Name */}
      <div className="mb-4">
        <label className="block text-black-400 text-sm font-semibold mb-2">First Name</label>
        <input
          type="text"
          value={firstName}
          placeholder="Enter your first name"
          onChange={(e) => {
            setFirstName(e.target.value);
            setIsEditing(true);
          }}
          className="w-full p-2 bg-white border border-black text-black placeholder-gray-400 rounded"          />
      </div>

      {/* Last Name */}
      <div className="mb-4">
        <label className="block text-black-400 text-sm font-semibold mb-2">Last Name</label>
        <input
          type="text"
          value={lastName}
          placeholder="Enter your last name"
          onChange={(e) => {
            setLastName(e.target.value);
            setIsEditing(true);
          }}
          className="w-full p-2 bg-white border border-black text-black placeholder-gray-400 rounded"

        />
      </div>

{/* Email */}
<div className="mb-4">
 <label className="block text-black-400 text-sm font-semibold mb-2">Email</label>
<p  className="w-full p-2 bg-white border border-black text-black placeholder-gray-400 rounded">{email}</p>
</div>


      {/* Username (Read-only) */}
      <div className="mb-4">
        <label className="block text-black-400 text-sm font-semibold mb-2">Username</label>
        <p  className="w-full p-2 bg-white border border-black text-black placeholder-gray-400 rounded">{username}</p>
      </div>

      {/* Save and Cancel Buttons */}
      {isEditing && (
        <div className="flex justify-between">
          <button
            onClick={handleCancel}
            className="w-full bg-black text-white py-2 rounded mr-2 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-700"
          >
            Save
          </button>
        </div>
      )}

      {/* Reset Password Button */}
      <button
        onClick={() => setIsResetPasswordOpen(true)} // Open reset password dialog
        className="w-full bg-black text-white py-2 rounded mt-[3mm] hover:bg-gray-600"
      >
        Reset Password
      </button>

              {/* Reset Password Dialog */}
              {isResetPasswordOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-black font-semibold">Reset Password</h2>
              <button
              onClick={() => setIsResetPasswordOpen(false)} // Close dialog
              className="text-black hover:text-gray-700 text-lg"
              >
              <IoClose />
              </button>
          </div>

          {/* Current Password */}
          <div className="mb-4 flex items-center">
              <label className="text-black text-sm font-semibold w-1/3">
              Current Password
              </label>
              <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-2/3 p-2 bg-white border border-black text-black rounded"
              placeholder="Enter current password"
              />
          </div>

          {/* New Password */}
          <div className="mb-4 flex items-center">
              <label className="text-black text-sm font-semibold w-1/3">
              New Password
              </label>
              <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-2/3 p-2 bg-white border border-black text-black rounded"
              placeholder="Enter new password"
              />
          </div>

          {/* Confirm Password */}
          <div className="mb-4 flex items-center">
              <label className="text-black text-sm font-semibold w-1/3">
              Confirm Password
              </label>
              <input
              type="password"
              value={confirmPassword} // For simplicity; typically, add a separate state
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-2/3 p-2 bg-white border border-black text-black rounded"
              placeholder="Confirm new password"
              />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
              <button
              onClick={() => setIsResetPasswordOpen(false)} // Close dialog
              className="bg-black text-white py-1 px-4 rounded hover:bg-gray-700"
              >
              Cancel
              </button>
              <button
              onClick={handleResetPassword}
              className="bg-black text-white py-1 px-4 rounded hover:bg-gray-700"
              >
              Save
              </button>
          </div>
          </div>
      </div>
      )}
    </div>
  </div>
);
};

export default Profile;