import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [reTypePassword, setReTypePassword] = useState('');

const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== reTypePassword) {
        toast.error('Passwords do not match');
        return;
    }
    try {
    const response = await fetch('http://localhost:8000/reset-new-password/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            new_password: newPassword,
            re_type_password: reTypePassword,
        }),
    });
    console.log("Response", response);
    if (response.ok) {
        toast.success('Password reset successfully. You will be redirected to login page.');
        setTimeout(() => {
            navigate('/login');
        }, 3000);
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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex justify-between w-8/12">
        <div className="flex flex-col items-center w-1/2 mt-5">
          <img src="/fp1.png" alt="Logo" className="w-80 h-64 mb-4" />
          <h3 className="text-white text-xl font-semibold text-center">
          Forgot your password? <br/>No worries, create a new one and get back on track!
          </h3>
         
        </div>
        <div className="bg-black p-10 rounded-md w-2/3 max-w-md h-80 border-2 border-white">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleResetPassword}>
            <div className="mb-4 flex items-center">
              <label className="text-white text-sm font-semibold w-1/3 mr-8">Username</label>
             <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={"p-2 w-2/3 bg-white border border-black text-black rounded"}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-4 flex items-center">
              <label className="text-white text-sm w-1/3 font-semibold mr-8 ">
              New Password
              </label>
              <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2 w-2/3 bg-white border border-black text-black rounded"
              placeholder="Enter New password"
              />
          </div>
          <div className="mb-4 flex items-center">
              <label className="text-white text-sm font-semibold w-1/3 mr-8">
              Re-type Password
              </label>
              <input
              type="password"
              value={reTypePassword}
              onChange={(e) => setReTypePassword(e.target.value)}
              className="p-2 w-2/3 bg-white border border-black text-black rounded"
              placeholder="Re-type new password"
              />
          </div>
            <div className="m-6">
              <button
                type="submit"
                className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ForgotPassword;
