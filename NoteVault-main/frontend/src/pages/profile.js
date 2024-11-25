import React, { useState, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-3xl text-center text-white font-bold mb-6">Profile</h1>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-semibold mb-2">Username</label>
          <p className="text-white bg-gray-700 p-2 rounded">{username}</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-semibold mb-2">Email</label>
          <div className="flex items-center space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 bg-gray-700 border border-gray-600 text-white rounded ${
                isEditingEmail ? '' : 'cursor-not-allowed'
              }`}
              readOnly={!isEditingEmail} // Set read-only if not editing
            />
            {!isEditingEmail ? (
              <FaPen
                className="text-blue-400 cursor-pointer hover:text-blue-500"
                onClick={() => setIsEditingEmail(true)} // Enable editing
              />
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateEmail}
                  className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingEmail(false)} // Cancel editing
                  className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsResetPasswordOpen(true)} // Open reset password dialog
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
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
