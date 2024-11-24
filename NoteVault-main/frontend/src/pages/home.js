import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlusCircle, FaThumbtack, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { apiCallWithToken } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', title: 'All' }]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [visibleCategoryStartIndex, setVisibleCategoryStartIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const categoriesToShow = 3;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await apiCallWithToken('http://localhost:8000/categories/');
        const categoriesData = await categoriesResponse.json();
        setCategories([{ _id: 'all', title: 'All' }, ...categoriesData]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        let notesResponse;
        if (selectedCategoryId === 'all') {
          notesResponse = await apiCallWithToken('http://localhost:8000/notes/');
        } else {
          notesResponse = await apiCallWithToken(`http://localhost:8000/notes/category/${selectedCategoryId}/`);
        }

        const notesData = await notesResponse.json();
        const updatedNotes = notesData.map((note) => {
          const pinStatus = JSON.parse(localStorage.getItem(note.id));
          return { ...note, pinned: pinStatus ? pinStatus.pinned : note.pinned };
        });

        const pinned = [];
        const unpinned = [];

        updatedNotes.forEach((note) => {
          if (note.pinned) {
            pinned.push(note);
          } else {
            unpinned.push(note);
          }
        });

        pinned.sort((a, b) => a.title.localeCompare(b.title));
        unpinned.sort((a, b) => a.title.localeCompare(b.title));

        setNotes([...pinned, ...unpinned]); 
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, [selectedCategoryId]); // Dependency on selectedCategoryId to refetch notes

  // Filter notes based on search query
  useEffect(() => {
    let filteredNotes = notes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotes(filteredNotes);
  }, [searchQuery, notes]);

  const togglePin = (e, noteId) => {
    e.stopPropagation(); 
    
    const currentPinStatus = JSON.parse(localStorage.getItem(noteId))?.pinned || false;
    
    const newPinStatus = !currentPinStatus;
    localStorage.setItem(noteId, JSON.stringify({ pinned: newPinStatus }));

    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.map((note) =>
        note.id === noteId ? { ...note, pinned: newPinStatus } : note
      );

      const pinned = [];
      const unpinned = [];

      updatedNotes.forEach((note) => {
        if (note.pinned) {
          pinned.push(note);
        } else {
          unpinned.push(note);
        }
      });

      pinned.sort((a, b) => a.title.localeCompare(b.title));
      unpinned.sort((a, b) => a.title.localeCompare(b.title));

      return [...pinned, ...unpinned]; 
    });
  };

const handleSaveCategory = async (categoryId) => {
  if (newCategoryTitle.trim()) {
    const token = localStorage.getItem('token');
    const url = categoryId
      ? `http://localhost:8000/categories/update/${categoryId}/`
      : 'http://localhost:8000/categories/create/'; 


    const method = categoryId ? 'PUT' : 'POST'; 
    const requestBody = JSON.stringify({ title: newCategoryTitle });

    try {
      const response = await apiCallWithToken(url, {
        method,
        body: requestBody,
      });

      if (response.ok) {
        const category = await response.json();

        if (categoryId) {
          setCategories(categories.map((cat) => (cat.id === category.id ? category : cat)));
        } else {
          setCategories([...categories, category]);
        }
        setNewCategoryTitle('');
        setIsModalOpen(false);
        toast.success(categoryId ? 'Category updated successfully!' : 'Category created successfully');
      } else {
        console.error('Failed to save category');
        toast.error(response.statusText);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'An unexpected error occurred');
    }
  }
};


  const handleDeleteCategory = async (categoryId) => {
    if (categoryId) {
      try {
        const response = await apiCallWithToken(`http://localhost:8000/categories/delete/${categoryId}/`, { method: 'DELETE' });
  
        if (response.ok) {
          const notesToDelete = notes.filter(note => note.category === categoryId);
          setCategories(categories.filter((cat) => cat.id !== categoryId));
          setNotes(notes.filter((note) => note.category !== categoryId));
          if(selectedCategoryId === categoryId) { setSelectedCategoryId('all'); }
          setIsDeleteModalOpen(false);
          if(notesToDelete.length > 0)
            {toast.success('Category and its notes deleted successfully')
          } else{toast.success('Category deleted successfully');
          }
        } else {
          console.error('Failed to delete category');
          toast.error(response.statusText);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.message || 'An unexpected error occurred');
      }
    }
  };
  
  const handlePrevCategory = () => {
    if (visibleCategoryStartIndex > 0) {
      setVisibleCategoryStartIndex(visibleCategoryStartIndex - 1);
    }
  };

  const handleNextCategory = () => {
    if (visibleCategoryStartIndex + categoriesToShow < categories.length) {
      setVisibleCategoryStartIndex(visibleCategoryStartIndex + 1);
    }
  };

  const handleNoteClick = (noteId) => {
    navigate(`/edit-note/${noteId}`);
  };


  const handleDropdownToggle = (categoryId) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null); 
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Modals
  const openCreateModal = () => {
    setEditingCategoryId(null);
    setNewCategoryTitle('');
    setIsModalOpen(true);
  };

  const openEditModal = (categoryId, currentTitle) => {
    setEditingCategoryId(categoryId); 
    setNewCategoryTitle(currentTitle); 
    setIsModalOpen(true);
    setOpenDropdown(null);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };
  
  const dropdownRef = useRef(null);

  return (
    <div className="min-h-screen bg-white text-white flex flex-col items-center p-4">
      <div className="flex items-center w-full max-w-6xl mb-4 space-x-4">
        <div className="flex items-center bg-white border-2 rounded-md px-4 py-2 w-3/5">
          <FaSearch className="text-white mr-2" />
          <input
            type="text"
            placeholder="Search a Note"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none text-black w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          {visibleCategoryStartIndex > 0 && (
            <button className="bg-gray-700 py-2 px-4 rounded-full" onClick={handlePrevCategory}>
              <FaArrowLeft className="text-white" />
            </button>
          )}

          {categories
        .slice(visibleCategoryStartIndex, visibleCategoryStartIndex + categoriesToShow)
        .map((category) => (
          <div key={category.id} className="relative group flex">
          <button
            onClick={() => setSelectedCategoryId(category.id ? category.id : 'all')}
            className={`flex items-center py-2 px-4 rounded-full ${
              selectedCategoryId === category.id ? 'bg-black' : 'bg-gray-700'
            }`}
          >
            {category.title}
        
            {category.id && category.id !== 'all' && (
              <div className="ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleDropdownToggle(category.id); 
                  }}
                  className="text-white text-xl p-0 bg-gray-500 rounded-full w-4"
                >
                  &#8942;
                </button>
              </div>
            )}
          </button>
        
          {openDropdown === category.id && (
            <div
              ref={dropdownRef}
              className="absolute top-8 right-6 mt-0 bg-white border rounded-md shadow-lg w-28 z-10"
            >
              <div className="absolute top-0 right-0 p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                  }}
                  className="text-white text-xl bg-transparent p-0"
                >
                  &#8942;
                </button>
              </div>
        
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => openEditModal(category.id, category.title)}
                    className="block py-2 px-10 text-gray-800 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openDeleteModal(category)}
                    className="block py-2 px-8 text-red-600 hover:bg-gray-100 rounded-sm"
                  >
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        ))}

          {visibleCategoryStartIndex + categoriesToShow < categories.length && (
            <button className="bg-gray-700 py-2 px-4 rounded-full" onClick={handleNextCategory}>
              <FaArrowRight className="text-white" />
            </button>
          )}

          <button
            className="bg-gray-700 py-2 px-4 rounded-full"
            onClick={openCreateModal}
          >
            <FaPlusCircle className="text-white" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-3 gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg relative cursor-pointer"
              onClick={() => handleNoteClick(note.id)} 
            >
              <h3 className="text-xl font-bold">{note.title}</h3> 
              <p className="text-gray-400">{note.content}</p>
              <span className="text-sm text-gray-400">#{note.category.title}</span>

              <FaThumbtack
                className={`absolute top-2 right-2 cursor-pointer ${
                  note.pinned ? 'text-yellow-400' : 'text-gray-400'
                }`}
                onClick={(e) => togglePin(e, note.id)} 
              />
            </div>
          ))
        ) : (
          <p className="text-gray-400">No notes available in this category.</p>
        )}
      </div>

      <button
        onClick={() => navigate('/create-note')}
        className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full flex items-center"
      >
        <FaPlusCircle className="mr-2" /> Create a new Note
      </button>

    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
          <h3 className="text-2xl mb-4">{editingCategoryId ? 'Edit Category' : 'Create New Category'}</h3>
          <input
            type="text"
            className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
            placeholder="Enter category title"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
          />
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => editingCategoryId ? handleSaveCategory(editingCategoryId) : handleSaveCategory("")} 
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              {editingCategoryId ? 'Save Changes' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )}


{isDeleteModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
          <h3 className="text-2xl mb-4 text-white">
            Are you sure you want to delete this category - <span className="font-bold">{categoryToDelete?.title}</span>?
          </h3>
          <div className="flex justify-end space-x-4">
            <button
              onClick={closeDeleteModal} 
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              No
            </button>
            <button
              onClick={() => handleDeleteCategory(categoryToDelete.id)}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    )}

    <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

    </div>

    
  );
};

export default Home;