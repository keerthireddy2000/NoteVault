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
  const [tooltipContent, setTooltipContent] = useState([
    "- Password is required.",
    "- Password must be at least 8 characters long.",
    "- Password must be at most 20 characters long.",
    "- Password must contain at least one uppercase letter.",
    "- Password must contain at least one lowercase letter.",
    "- Password must contain at least one number.",
    "- Password must contain at least one special character (e.g., @, #, $, etc.).",
    "- Password should not contain any whitespace."
  ]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [tooltipClass, setTooltipClass] = useState('text-white'); // Default to white text color for tooltip

  const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 20;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasWhitespace = /\s/.test(password);

    const unsatisfiedRules = new Set();

    if (password.length === 0) {
      unsatisfiedRules.add("- Password is required.");
      unsatisfiedRules.add("- Password must be at least 8 characters long.");
      unsatisfiedRules.add("- Password must be at most 20 characters long.");
      unsatisfiedRules.add("- Password must contain at least one uppercase letter.");
      unsatisfiedRules.add("- Password must contain at least one lowercase letter.");
      unsatisfiedRules.add("- Password must contain at least one number.");
      unsatisfiedRules.add("- Password must contain at least one special character (e.g., @, #, $, etc.).");
      unsatisfiedRules.add("- Password should not contain any whitespace.");
    } else {
      if (password.length < minLength) {
        unsatisfiedRules.add("- Password must be at least 8 characters long.");
      }
      if (password.length > maxLength) {
        unsatisfiedRules.add("- Password must be at most 20 characters long.");
      }
      if (!hasUpperCase) {
        unsatisfiedRules.add("- Password must contain at least one uppercase letter.");
      }
      if (!hasLowerCase) {
        unsatisfiedRules.add("- Password must contain at least one lowercase letter.");
      }
      if (!hasNumber) {
        unsatisfiedRules.add("- Password must contain at least one number.");
      }
      if (!hasSpecialChar) {
        unsatisfiedRules.add("- Password must contain at least one special character (e.g., @, #, $, etc.).");
      }
      if (hasWhitespace) {
        unsatisfiedRules.add("- Password should not contain any whitespace.");
      }
    }
    return Array.from(unsatisfiedRules);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const unsatisfiedRules = validatePassword(newPassword);
    if (unsatisfiedRules.length > 0) {
      setShowTooltip(true);
      setTooltipContent(unsatisfiedRules);
      setIsPasswordValid(false);
      setTooltipClass('text-white');
    } else {
      setShowTooltip(false);
      setIsPasswordValid(true);
    }
  };

  const handlePasswordClick = () => {
    setShowTooltip(true);
    setTooltipClass('text-white');
  };

  const handlePasswordBlur = () => {
    const unsatisfiedRules = validatePassword(password);
    if (unsatisfiedRules.length > 0) {
      setTooltipClass('text-red-500');
      setIsPasswordValid(false);
    } else {
      setTooltipClass('text-white');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error('Password requirements are not met');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://52.7.128.221:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, first_name: firstName, last_name: lastName }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('username', username);
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh', data.refresh);
        toast.success('Signup successful! Redirecting...');
        setTimeout(() => navigate('/home'), 1000);
      } else {
        toast.error(data.message || 'Signup failed! Try a different username');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex items-center justify-center mb-10 pt-[60px]">
        <img src="/Logo.png" alt="Logo" className="w-40 h-28 mr-4 -ml-16" />
        <div>
          <h1 className="text-5xl text-white font-bold text-center mb-3">NOTE VAULT</h1>
          <h3 className="text-white text-xl font-semibold">Secure your thoughts, unlock your potential</h3>
        </div>
      </div>

      <div className="bg-black flex items-center justify-center">
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

            <div className="mb-4 flex items-center relative">
              <label className="text-white text-sm font-semibold w-1/3">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none`}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-4 flex items-center relative">
              <label className="text-white text-sm font-semibold w-1/3">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onClick={handlePasswordClick}
                onBlur={handlePasswordBlur}
                className="w-2/3 p-2 ml-[36px] bg-white text-black rounded outline-none"
                placeholder="Enter your password"
                required
              />
              {showTooltip && (
                <div className="absolute left-full top-0 ml-2 p-2 bg-gray-900 rounded shadow-lg min-w-[330px] sm:block hidden">
                  <ul className={`${tooltipClass} text-sm`}>
                    {tooltipContent.map((message, index) => (
                      <li key={index}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
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

