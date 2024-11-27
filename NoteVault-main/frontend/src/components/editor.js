import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { apiCallWithToken, logout } from '../api';
import { FaTrashAlt,FaTimes } from 'react-icons/fa';  
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Editor = () => {
  const { noteId } = useParams(); 
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [note, setNote] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCallWithToken('http://localhost:8000/categories', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setCategories(data); 
        } else {
          console.error('Token expired, logging out...');
          logout();
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  
  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        try {
          const response = await apiCallWithToken(`http://localhost:8000/notes/${noteId}`, { method: 'GET' });
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title);
            setCategory(data.category);
            setNote(data.content);
          } else {
            console.error('Failed to fetch note');
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        }
      };
      fetchNote();
    }
  }, [noteId]);

  const handleNewCategory = async () => {
    try {
      const response = await apiCallWithToken('http://localhost:8000/categories/create/', {
        method: 'POST',
        body: JSON.stringify({ title: newCategory }),
      });

      if (response.ok) {
        const categoryData = await response.json();
        setCategories([...categories, categoryData]); 
        setCategory(categoryData.id); 
        setNewCategory('');
        setIsModalOpen(false);
      } else {
        console.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleReset = () => {
    // setTitle('');
    // setCategory('');
    setNote('');
  };

  const handleSave = async () => {
    if (!title) {
      toast.info("Please fill in the title for the note." ,{
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
    } else if (!category) {
      toast.info("Please select a category." , {
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
    } else if (!note) {
      toast.info("Please fill in the content for the note.", {
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

    try {
      const response = await apiCallWithToken(noteId ? `http://localhost:8000/notes/update/${noteId}/` 
                                                      : 'http://localhost:8000/notes/create/', {
        method: noteId ? 'PUT' : 'POST',
        body: JSON.stringify({ title, category, content: note }),
      });

      if (response.ok) {
        const savedNote = await response.json();
        console.log('Note saved:', savedNote);
        handleReset(); 
        navigate('/home');
      } else {
        console.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async () => {
    if (noteId) {
      try {
        const response = await apiCallWithToken(`http://localhost:8000/notes/delete/${noteId}/`, { method: 'DELETE' });
        if (response.ok) {
          console.log('Note deleted successfully');
          toast.success('Note deleted successfully');
          navigate('/home'); 
        } else {
          console.error('Failed to delete note');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-white flex flex-col items-center p-4">
      <div className="w-full max-w-5xl bg-white border border-black p-6 rounded-lg shadow-lg">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">{noteId ? 'Edit Note' : 'Create Note'}</h2>
          <div>
            {noteId && (
             <button
             onClick={handleDelete}
             className="bg-white hover:bg-red-500 text-black py-2 px-4 rounded"
             aria-label="Delete note"
             
           >
             <FaTrashAlt className="text-2xl" />
           </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="bg-white hover:bg-red-500 text-black py-2 px-4 rounded"
            >
              <FaTimes className="text-2xl text-black" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-black text-xl text-sm mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 bg-white border text-black border-black rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-black text-xl text-sm mb-2" htmlFor="category">
            Category
          </label>
          <div className="flex items-center">
            <select
              id="category"
              className="w-3/4 p-2 bg-white border text-black border-black rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 bg-black hover:bg-green-600 border border-black text-white py-2 px-4 rounded"
            >
              New Category
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-black text-xl text-sm mb-2" htmlFor="note">
            Note Content
          </label>
          <textarea
            id="note"
            className="w-full p-2 bg-white text-black border border-black rounded h-48"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your note here..."
            required
          />
        </div>
        
        <div className="flex justify-end space-x-4">
        <button
              onClick={handleReset}
              className="ml-4 bg-black hover:bg-gray-500 border border-black text-white  py-2 px-4 rounded"
            >
              Reset
            </button>

          <button
            onClick={handleSave}
            className="bg-black hover:bg-green-700 border border-black text-white py-2 px-4 rounded"
          >
            {noteId ? 'Update' : 'Save'}
          </button>
          <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-2xl mb-4">Create New Category</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-white border border-gray-600 text-black placeholder-gray-400 rounded"
              placeholder="Enter category title"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white hover:bg-red-600 text-black py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {handleNewCategory}}
                className="bg-white hover:bg-green-700 text-black py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
