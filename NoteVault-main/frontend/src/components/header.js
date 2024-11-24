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
       className="fixed inset-0 bg-black bg-opacity-70 flex justify-end"
       onClick={toggleSidebar} 
     >
       <nav
         className="w-64 bg-black text-white h-full p-4 shadow-lg"
         onClick={(e) => e.stopPropagation()} 
       >
         <Link
           to="/profile"
           className="text-center text-lg text-white hover:bg-gray-500 p-2 rounded mt-12 block w-full hover:text-white transition duration-200 ease-in-out"
           onClick={() => setIsSidebarOpen(false)}
         >
           View Profile
         </Link>
         <button
           onClick={handleLogout}
           className="text-center text-lg text-white hover:bg-gray-500 p-2 rounded mt-3 block w-full hover:text-white transition duration-200 ease-in-out"
         >
           Logout
         </button>
       </nav>
     </div>
     
      )}
    </div>
  );
};

export default Header;
