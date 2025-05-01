


import { motion } from 'framer-motion';
import { useState } from 'react';

const AddNoteModal = ({ onClose, onSave, darkMode }) => {
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [showImage, setShowImage] = useState(false);

  const handleChange = (e) => {
    setNewNote({
      ...newNote,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNote.title.trim()) {
      onSave({
        ...newNote,
        image: newNote.image || ''
      });
    }
  };

  const removeImage = () => {
    setNewNote({ ...newNote, image: '' });
    setShowImage(false);
  };

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={`modal-content ${darkMode ? 'dark' : 'light'}`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <div className="modal-header">
          <h3>Add New Note</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={newNote.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newNote.description}
              onChange={handleChange}
            />
          </div>
          
          {showImage && newNote.image && (
            <div className="image-preview">
              <img src={newNote.image} alt="Preview" />
              <button type="button" className="remove-image-btn" onClick={removeImage}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="image-upload" className="upload-btn">
              <i className="fas fa-image"></i> {showImage ? 'Change Image' : 'Add Image'}
            </label>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setNewNote({ ...newNote, image: event.target.result });
                    setShowImage(true);
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
            />
          </div>
          
          <div className="modal-actions">
            <motion.button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="save-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save Note
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddNoteModal;