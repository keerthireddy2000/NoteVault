
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlusCircle, FaThumbtack, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { apiCallWithToken } from '../api';
import { toast , ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoClose } from "react-icons/io5";

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
  const [categoriesDict, setCategoriesDict] = useState([{}]);

  const categoriesToShow = 8;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await apiCallWithToken(
          "http://localhost:8000/categories/"
        );
        const categoriesData = await categoriesResponse.json();
        setCategories([{ _id: "all", title: "All" }, ...categoriesData]);
        setCategoriesDict(
          categoriesData.reduce((acc, item) => {
            acc[item.id] = item.title;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        let notesResponse;
        if (selectedCategoryId === undefined || selectedCategoryId === 'all') {
          notesResponse = await apiCallWithToken('http://localhost:8000/notes/');
        } else {
          notesResponse = await apiCallWithToken(`http://localhost:8000/notes/category/${selectedCategoryId}/`);
        }
        const notesData = await notesResponse.json();
        const pinnedNotes = notesData.filter(note => note.pinned);
        const unpinnedNotes = notesData.filter(note => !note.pinned);
        const sortedPinnedNotes = pinnedNotes.sort((a, b) => a.title.localeCompare(b.title));
        const sortedUnpinnedNotes = unpinnedNotes.sort((a, b) => a.title.localeCompare(b.title));
        const sortedNotes = [...sortedPinnedNotes, ...sortedUnpinnedNotes];
        setNotes(sortedNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
  
    fetchNotes();
  }, [selectedCategoryId]);

  useEffect(() => {
    let tempNotes = notes.filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContent = note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch || matchesContent;
    });
    setFilteredNotes(tempNotes);
  }, [searchQuery, notes]);

  const togglePin = async (noteId) => {
    const updatedNotes = notes.map((note) =>
    note.id === noteId ? { ...note, pinned: !note.pinned } : note
  );
  const pinnedNotes = updatedNotes.filter(note => note.pinned);
  const unpinnedNotes = updatedNotes.filter(note => !note.pinned);

  const sortedPinnedNotes = pinnedNotes.sort((a, b) => a.title.localeCompare(b.title));
  const sortedUnpinnedNotes = unpinnedNotes.sort((a, b) => a.title.localeCompare(b.title));

  const sortedNotes = [...sortedPinnedNotes, ...sortedUnpinnedNotes];

  setNotes(sortedNotes);
  
    try {
      const response = await fetch(`http://localhost:8000/notes/toggle-pin/${noteId}/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to toggle pin status on the server');
      }
      const data = await response.json();
      console.log('Pin status updated on server:', data);
    } catch (error) {
      console.error('Error toggling pin status:', error);
      const revertedNotes = notes.map((note) =>
        note._id === noteId ? { ...note, pinned: !note.pinned } : note
      );
      setNotes(revertedNotes);
    }
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
            setCategories(categories.map((cat) => (cat._id === category._id ? category : cat)));
            setCategoriesDict((prevDict) => ({ ...prevDict, [category._id]: category.title }));
          } else {
            setCategories((prevCategories) => [...prevCategories, category]);
            setCategoriesDict((prevDict) => ({ ...prevDict, [category._id]: category.title }));
          }
          setNewCategoryTitle('');
          setIsModalOpen(false);
          toast.success(categoryId ? 'Category updated successfully!' : 'Category created successfully');
        } else {
          console.error('Failed to save category');
          toast.error(response.error ? response.error : "Error creating category");
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
          // const notesToDelete = notes.filter(note => note.category === categoryId);
          setCategories(categories.filter((cat) => cat.id !== categoryId));
          setNotes(notes.filter((note) => note.category !== categoryId));
          if (selectedCategoryId === categoryId) { setSelectedCategoryId('all'); }
          setIsDeleteModalOpen(false);
          // if (notesToDelete.length > 0) {
            toast.success('Category and its notes deleted successfully')
          
          // else {
          //   toast.success('Category deleted successfully');
          // }
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

  const handleCancel = () => {
    setIsModalOpen(false); 
    setNewCategoryTitle('');
    setEditingCategoryId(null); 
  }
  const dropdownRef = useRef(null);

  return (
    <div className="min-h-screen bg-white text-white flex flex-col items-center p-4">
      {/* search and filter section of the page */}
      <div className="flex flex-col w-full mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-4 w-2/3">
          {/* Search Bar */}
          <div className="flex items-center bg-white border border-black rounded-full px-4 py-2 flex-grow">
            <input
              type="text"
              placeholder="Search a note by title or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-black w-full"
            />
            <FaSearch className="text-black hover:text-gray-600 mr-2" />
          </div>

          {/* Button */}
          <button
            onClick={() => navigate("/create-note")}
            className="bg-black border-black border text-white py-2 px-4 rounded-full flex items-center"
          >
            <FaPlusCircle className="mr-2" /> Add Note
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center space-x-2 text-black">
          {visibleCategoryStartIndex > 0 && (
            <button
              className="!bg-white border-[2px] py-2 px-4 rounded-full"
              onClick={handlePrevCategory}
            >
              <FaArrowLeft className="text-black" />
            </button>
          )}
          {categories
            .slice(
              visibleCategoryStartIndex,
              visibleCategoryStartIndex + categoriesToShow
            )
            .map((category) => (
              <div key={category.id} className="relative group flex w-[150px]">
  <button
    onClick={() =>
      setSelectedCategoryId(category.id ? category.id : "all")
    }
    className={`flex items-center justify-between p-2 px-4 rounded-full w-full ${
      selectedCategoryId === category.id ||
      (category.id === undefined && selectedCategoryId === "all")
        ? "bg-black text-white p-[0.6rem]"
        : "bg-white border border-black"
    }`}
  >
    <span className="truncate max-w-[100px]">{category.title}</span>
    {category.id && category.id !== "all" && (
      <div className="ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDropdownToggle(category.id);
          }}
          className="text-black text-xl p-0 bg-gray-200 rounded-full w-4"
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
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => openEditModal(category.id, category.title)}
            className="block py-2 px-10 text-black hover:bg-gray-600"
          >
            Edit
          </button>
        </li>
        <li>
          <button
            onClick={() => openDeleteModal(category)}
            className="block py-2 px-8 text-black hover:bg-gray-600 rounded-sm"
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
            <button
              className="!bg-white border-[2px] py-[0.75rem] px-4 rounded-md border-black"
              onClick={handleNextCategory}
            >
              <FaArrowRight className="text-black" />
            </button>
          )}

          <button
            className="bg-black text-white px-4 p-[0.6rem] rounded-full flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlusCircle className="mr-2" /> Add Category
          </button>
        </div>
      </div>

      <div className="w-full overflow-y-auto grid grid-cols-4 gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-gray-100 p-4 rounded-md border border-gray-400 shadow-lg relative cursor-pointer h-32"
              onClick={() => handleNoteClick(note.id)}
            >
              <h3 className="text-xl font-bold text-black">{note.title}</h3>
              <p className="text-gray-700 truncate">{note.content}</p>
              <span className="text-sm text-gray-700">
                #{categoriesDict[note.category]}
              </span>

              {/* Pin Icon */}
              <FaThumbtack
                className={`absolute top-2 right-2 cursor-pointer ${
                  note.pinned ? "text-black" : "text-gray-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(note.id);
                }}
              />
            </div>
          ))
        ) : (
          <p className="text-black text-lg">
            No notes available in this category!!!
          </p>
        )}
      </div>

      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-2 right-2 text-xl text-black hover:text-gray-600 p-2"
        aria-label="Close"
      >
        <IoClose />
      </button>

      {/* Modal Content */}
      <h3 className="text-2xl mb-4 text-black">
        {editingCategoryId ? "Edit Category" : "Create New Category"}
      </h3>
      <input
        type="text"
        className="w-full p-2 mb-4 bg-white border border-gray-600 text-black placeholder-gray-400 rounded"
        placeholder="Enter category title"
        value={newCategoryTitle}
        onChange={(e) => setNewCategoryTitle(e.target.value)}
      />
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            editingCategoryId
              ? handleSaveCategory(editingCategoryId)
              : handleSaveCategory("")
          }
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          {editingCategoryId ? "Update" : "Save"}
        </button>
      </div>
    </div>
  </div>
)}



      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative bg-white p-6 rounded-md w-1/3 text-black border border-black">
            {/* Close Button */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-2 right-2 text-xl text-black hover:text-gray-600 p-2"
              aria-label="Close"
            >
              <IoClose />
            </button>
            <h3 className="text-2xl mb-6 text-black">
              Are you sure you want to delete this category -{" "}
              <span className="font-bold">{categoryToDelete?.title}</span>?
            </h3>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                No
              </button>

              <button
                onClick={() => handleDeleteCategory(categoryToDelete.id)}
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
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
