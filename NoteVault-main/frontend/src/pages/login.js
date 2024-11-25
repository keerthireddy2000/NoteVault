import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page if already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home'); // Redirect if token exists
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

        if (!username) {
        toast.info("Please fill in the username" , {
          style: {
            backgroundColor: '#2196F3',  
            color: 'white',               
            borderRadius: '8px',          
            padding: '10px',             
          },
            position: "top-center",
            autoClose: 2000 , 
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
      });
        return;
      } else if (!password) {
        toast.info("Please fill in password." , {
          style: {
            backgroundColor: '#2196F3',  
            color: 'white',               
            borderRadius: '8px',          
            padding: '10px',             
          },
            position: "top-center",
            autoClose: 2000 , 
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
      });
        return;
    }
    try{
      const response = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Save tokens and username to localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh', data.refresh);

        // Redirect to home page after successful login
        navigate('/home');
      } else {
        const result = await response.json();
        setError(result.detail || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An error occurred while logging in. Please try again.');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Content Wrapper */}
      <div className="flex justify-between w-8/12">
        {/* Left Section */}
        <div className="flex flex-col items-center w-1/2 mt-5">
          <img src="/logo.jpeg" alt="Logo" className="w-40 h-28 mb-4" />
          <h1 className="text-5xl text-white font-bold mb-3">NOTE VAULT</h1>
          <h3 className="text-white text-xl font-semibold text-center">
            Secure your thoughts, unlock your potential
          </h3>
        </div>

        {/* Right Section */}
        <div className="bg-black p-8 rounded-md w-full max-w-md border-2 border-white">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center">
              <label className="text-white text-sm font-semibold w-1/3">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
                placeholder="Enter your username"
                
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
                
              />
            </div>
            <div className="text-right text-white">
              <Link to="/forgot-password" className="hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="m-6">
              <button
                type="submit"
                className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-300"
              >
                Login
              </button>
              <ToastContainer />
            </div>
            <div className="mt-4 text-center text-white">
              New user?{' '}
              <Link to="/signup" className="text-white hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
