



import { useState } from 'react';
import { motion } from 'framer-motion';

const NoteCard = ({ note, viewMode, onUpdate, onDelete, onBookmark, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({ ...note });
  const [showImage, setShowImage] = useState(!!note.image_url);

  const handleChange = (e) => {
    setEditedNote({
      ...editedNote,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    onUpdate(editedNote);
    setIsEditing(false);
  };

  const handleCopy = () => {
    const noteContent = `Title: ${note.title}\nDescription: ${note.description}\nImage: ${note.image_url || 'No image'}`;
    navigator.clipboard.writeText(noteContent);
  };

  const removeImage = () => {
    setEditedNote({ ...editedNote, image_url: '' });
    setShowImage(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div 
      className={`note-card ${viewMode} ${note.is_bookmarked ? 'bookmarked' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      {note.is_bookmarked && (
        <div className="bookmark-icon">
          <i className="fas fa-bookmark"></i>
        </div>
      )}
      
      {showImage && note.image_url && (
        <div className="note-image-container">
          <img src={note.image_url} alt={note.title} className="note-image" />
          {isEditing && (
            <button className="remove-image-btn" onClick={removeImage}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      )}
      
      <div className="note-header">
        {isEditing ? (
          <input
            type="text"
            name="title"
            value={editedNote.title}
            onChange={handleChange}
            className="edit-title"
            placeholder="Note title"
          />
        ) : (
          <h3>{note.title}</h3>
        )}
        
        <div className="note-actions">
          <button 
            className="bookmark-btn"
            onClick={() => onBookmark(note.id)}
            title={note.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <i className={note.is_bookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
          </button>
          
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave} title="Save">
                <i className="fas fa-check"></i>
              </button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)} title="Cancel">
                <i className="fas fa-times"></i>
              </button>
            </>
          ) : (
            <>
              <button className="edit-btn" onClick={() => setIsEditing(true)} title="Edit">
                <i className="fas fa-edit"></i>
              </button>
              <button className="delete-btn" onClick={() => onDelete(note.id)} title="Delete">
                <i className="fas fa-trash"></i>
              </button>
              <button className="copy-btn" onClick={handleCopy} title="Copy">
                <i className="fas fa-copy"></i>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="note-content">
        {isEditing ? (
          <textarea
            name="description"
            value={editedNote.description || ''}
            onChange={handleChange}
            className="edit-description"
            placeholder="Note description..."
          />
        ) : (
          <p>{note.description}</p>
        )}
      </div>
      
      <div className="note-footer">
        <div className="note-dates">
          <span>Created: {formatDate(note.created_at)}</span>
          {note.created_at !== note.updated_at && (
            <span>Updated: {formatDate(note.updated_at)}</span>
          )}
        </div>
        
        {isEditing && (
          <div className="image-upload">
            <label htmlFor={`image-upload-${note.id}`} className="upload-btn">
              <i className="fas fa-image"></i> {viewMode === 'grid' ? 'Add Image' : 'Image'}
            </label>
            <input 
              id={`image-upload-${note.id}`}
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setEditedNote({ ...editedNote, image_url: event.target.result });
                    setShowImage(true);
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NoteCard;