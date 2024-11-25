import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password , first_name: firstName, last_name: lastName}),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('username', username);
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh', data.refresh);
        toast.success('Signup successful! Redirecting...');
        setTimeout(() => navigate('/home'), 1000);
      } else {
        toast.error(data.message || 'Signup failed!!! Try a different username');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex items-center justify-center mb-10 pt-[60px]">
      <img src="/logo.jpeg" alt="Logo" className="w-40 h-28 mr-4 -ml-16" />
      <div>
        <h1 className="text-5xl text-white font-bold text-center mb-3">NOTE VAULT</h1>
        <h3 className="text-white text-xl font-semibold">Secure your thoughts, unlock your potential</h3>
      </div>
    </div>

    
    <div className=" bg-black flex items-center justify-center">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="bg-black p-8 rounded-md w-full max-w-md border-2 border-white">
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center">
              <label className="text-white text-sm font-semibold w-1/3">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="mb-4 flex items-center">
              <label className="text-white text-sm font-semibold w-1/3">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
                placeholder="Enter your last name"
                required
              />
            </div>
          <div className="mb-4 flex items-center">
            <label className="text-white text-sm font-semibold w-1/3">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="text-white text-sm font-semibold w-1/3">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="text-white text-sm font-semibold w-1/3">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="text-white text-sm font-semibold w-1/3">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
              placeholder="Confirm your password"
              required
            />
          </div>
          <div className="m-6">
            <button
              type="submit"
              className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-300"
            >
              Register
            </button>
          </div>
          <div className="text-center text-white">
            Existing user?{' '}
            <Link to="/login" className="text-white hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Signup;
