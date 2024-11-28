import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { apiCallWithToken, logout } from '../api';
import { FaTrashAlt,FaTimes } from 'react-icons/fa';  
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdRefresh } from "react-icons/md";
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";


const Editor = () => {
  const { noteId } = useParams(); 
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [note, setNote] = useState('');
  const [newCategory, setNewCategory] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null); 
  const navigate = useNavigate();
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
  
      let interimTranscript = '';
  
      recognition.onresult = (event) => {
        let finalTranscript = '';
        interimTranscript = '';
  
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript + ' ';
          }
        }
        setNote((prevNote) => prevNote.trim() + ' ' + finalTranscript.trim());
      };
  
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition error occurred.');
        setIsRecording(false);
      };
  
      recognition.onend = () => {
        setIsRecording(false);
      };
  
      recognitionRef.current = recognition;
    } else {
      console.error('Web Speech API not supported in this browser.');
      toast.error('Speech recognition not supported in this browser.');
    }
  }, []);
  

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

  const handleCheckGrammar = async () => {
    try {
      toast.info("Checking spelling and grammar...", {
        position: "top-center",
        autoClose: 2000,
      });
  
      const response = await apiCallWithToken('http://localhost:8000/check_grammar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: note }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        if (data.message === "No fix required!") {
          toast.info("No fix required!!!", {
            position: "top-center",
            autoClose: 2000,
          });
        } else if (data.correctedText) {
          setNote(data.correctedText);
          toast.success("Spelling and grammar fixed successfully.", {
            position: "top-center",
            autoClose: 2000,
          });
        } else {
          toast.error("Unexpected response from the server.", {
            position: "top-center",
            autoClose: 2000,
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || "Failed to fix spelling and grammar. Please try again!!!",
          {
            position: "top-center",
            autoClose: 2000,
          }
        );
      }
    } catch (error) {
      console.error('Error fixing spelling and grammar:', error);
      toast.error("An error occurred while fixing grammar. Please try again later.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };
  
  
  const handleSummarize = async () => {
    try {
      // Show a loading notification to indicate the process has started
      toast.info("Summarizing text...", {
        position: "top-center",
        autoClose: 1500,
      });
  
      // Make the API call
      const response = await apiCallWithToken('http://localhost:8000/summarize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: note }),
      });
  
      // Handle the response
      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          // Update the note with the summarized text
          setNote(data.summary);
          toast.success("Text summarized successfully.", {
            position: "top-center",
            autoClose: 2000,
          });
        } else {
          // Handle unexpected response format
          toast.error("Unexpected response from the server.", {
            position: "top-center",
            autoClose: 2000,
          });
        }
      } else {
        // Handle errors returned from the API
        const errorData = await response.json();
        toast.error(
          errorData.message || "Failed to summarize text. Please try again.",
          {
            position: "top-center",
            autoClose: 2000,
          }
        );
      }
    } catch (error) {
      // Handle network or other unexpected errors
      console.error('Error summarizing text:', error);
      toast.error("An error occurred while summarizing. Please try again later.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };
  

  const startTranscription = () => {
    if (recognitionRef.current) {
      toast.info("Recording in progress...", {
        position: "top-center",
        autoClose: 1500,
      });
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      toast.info("Recording Stopped!!!", {
        position: "top-center",
        autoClose: 1500,
      });
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-white flex flex-col items-center p-4">
      <div className="w-full bg-white pt-2 pb-2">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">{noteId ? 'Edit Note' : 'Create Note'}</h2>
          <div>
            {noteId && (
              <button
                onClick={handleDelete}
                className="bg-white hover:text-gray-600 text-black py-2 px-4 rounded"
              >
                <FaTrashAlt className="text-2xl" /> 
              </button>
            )}
            <button
              onClick={handleReset}
              className="bg-white hover:text-gray-600 text-black py-2 px-4 rounded font-extrabold"
            >
              <MdRefresh  className="text-2xl" />
            </button>
            <button
            onClick={() => navigate('/')}
            className="bg-white hover:text-gray-600 text-black py-2 px-4 rounded"
          >
            <FaTimes className="text-2xl" />
          </button>

          </div>
        </div>

        
        <div className="mb-4 flex space-x-4">
  <div className="flex-1 flex items-center space-x-2">
    <label className="text-black text-lg" htmlFor="title">
      Title:
    </label>
    <input
      type="text"
      id="title"
      className="w-full p-1 bg-white border text-black border-black rounded outline-none"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Enter note title"
      required
    />
  </div>
  <div className="flex-1 flex items-center space-x-2">
    <label className="text-black text-lg" htmlFor="category">
      Category:
    </label>
    <div className="flex items-center space-x-2 w-full">
      <select
        id="category"
        className="flex-grow p-[0.4rem] bg-white border text-black border-black rounded-md outline-none"
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
        className="bg-black hover:bg-gray-600 border border-black text-white p-[0.35rem] px-4 rounded-md flex-shrink-0"
      >
        New Category
      </button>
    </div>
  </div>
</div>



        <div className="mt-6 mb-4 relative">
        <textarea
          id="note"
          className="w-full px-2 bg-white text-black border border-black rounded-md h-96 outline-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onPaste={(e) => {
            e.preventDefault(); 
            const text = (e.clipboardData || window.clipboardData).getData('text'); 
            document.execCommand('insertText', false, text); 
          }}
          placeholder="Type or record your note here..."
          required
          style={{
            backgroundImage: `linear-gradient(to bottom, #d3d3d3 1px, transparent 1px)`,
            backgroundSize: `100% 2rem`, 
            lineHeight: `2rem`, 
            fontFamily: 'inherit', 
            paddingTop: '0.3rem',
          }}
        />
        <button
            onClick={isRecording ? stopTranscription : startTranscription}
            className={`absolute bottom-5 right-4 p-2 rounded-full hover:bg-gray-600 ${
              isRecording ? 'bg-black' : 'bg-black'
            }`}
          >
            {isRecording ? <FaStop className="text-white text-xl" /> : <FaMicrophone className="text-white text-xl" />}
          </button>
      </div>



        {/* Action Buttons */}
        <div className="flex justify-end">
          <button
            onClick={handleCheckGrammar}
            className="bg-black hover:bg-gray-600 border border-black text-white py-2 px-4 rounded mr-4"
          >
            Fix Spelling and Grammar
          </button>
          <button
            onClick={handleSummarize}
            className="bg-black hover:bg-gray-600 border border-black text-white py-2 px-4 rounded mr-4"
          >
            Summarize with AI
          </button>
          {/* <button
            onClick={handleReset}
            className="ml-4 bg-black hover:bg-gray-600 border border-black text-white py-2 px-4 rounded"
          >
            Reset
          </button> */}
          <button
            onClick={handleSave}
            className="bg-black hover:bg-green-700 border border-black text-white py-2 px-4 rounded"
          >
            {noteId ? 'Update Note' : 'Save'}
          </button>
          <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white p-6 rounded-md w-1/3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-2 right-2 text-xl text-black hover:text-gray-600 p-2"
            aria-label="Close"
          >
          <IoClose />
          </button>
            <h3 className="text-2xl mb-4 text-black">Create New Category</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-white border border-gray-600 text-black placeholder-gray-400 rounded"
              placeholder="Enter category title"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleNewCategory} // Save new category
                className="bg-black hover:bg-gray-600 text-white py-2 px-4 rounded-md"
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