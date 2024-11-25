import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUsername(''); // Clear the username state
    setIsSidebarOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    const storedUsername = localStorage.getItem('username');
    setIsAuthenticated(!!token);
    setUsername(storedUsername || ''); // Update username from localStorage
  }, [setIsAuthenticated]); // Runs whenever `setIsAuthenticated` changes

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-black text-white shadow-md">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <img src="/logo.jpeg" alt="Logo" className="w-16 h-10" />
          <h1 className="text-2xl font-semibold">NoteVault</h1>
        </div>

        {/* User Greeting and Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          <p className="text-lg">Hello, {username}</p>
          <button onClick={toggleSidebar} className="text-2xl focus:outline-none">
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Sidebar and Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50"
          onClick={toggleSidebar} // Close sidebar when clicking outside
        >
          <nav
        className="fixed top-0 right-0 w-64 bg-black text-white h-full p-4 shadow-lg z-60"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the sidebar
      >
            
            <Link
              to="/profile"
              className="text-center text-lg text-white hover:underline p-2 rounded mt-12 block w-full"
              onClick={() => setIsSidebarOpen(false)} // Close sidebar when navigating
            >
              View Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-lg text-white bg-transparent hover:underline mt-4 block w-full"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}></div>
    </div>
  );
};

export default Header;
