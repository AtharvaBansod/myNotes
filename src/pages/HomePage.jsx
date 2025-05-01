




import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NoteCard from '../components/NoteCard';
import AddNoteModal from '../components/AddNoteModal';

const HomePage = ({ darkMode }) => {
    const [notes, setNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [viewMode, setViewMode] = useState('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('supabase_token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            
            

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch notes');
            }

            const data = await response.json();
            console.log('Fetched notes:', data);
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
            // Optionally show error to user
        } finally {
            setIsLoading(false);
        }
    };

    const addNote = async (newNote) => {
        try {
            const token = localStorage.getItem('supabase_token');
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    title: newNote.title,
                    description: newNote.description,
                    image_url: newNote.image || ''
                })
            });

            if (!response.ok) {
                const data1 = await response.json()
                console.log('ma ki chut',data1);
                
                throw new Error('Failed to add note');
            }

            const data = await response.json();
            setNotes([...notes, data]);
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const updateNote = async (updatedNote) => {
        try {
            const token = localStorage.getItem('supabase_token');
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notes/${updatedNote.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: updatedNote.title,
                    description: updatedNote.description,
                    image_url: updatedNote.image,
                    is_bookmarked: updatedNote.is_bookmarked
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update note');
            }

            const data = await response.json();
            setNotes(notes.map(note => note.id === data.id ? data : note));
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const deleteNote = async (id) => {
        try {
            const token = localStorage.getItem('supabase_token');
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            setNotes(notes.filter(note => note.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const toggleBookmark = async (id) => {
        const note = notes.find(n => n.id === id);
        if (!note) return;

        try {
            const token = localStorage.getItem('supabase_token');
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...note,
                    is_bookmarked: !note.is_bookmarked
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update bookmark status');
            }

            const data = await response.json();
            setNotes(notes.map(n => n.id === id ? data : n));
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedNotes = [...filteredNotes].sort((a, b) => {
        if (a.is_bookmarked && !b.is_bookmarked) return -1;
        if (!a.is_bookmarked && b.is_bookmarked) return 1;

        if (sortBy === 'created_at' || sortBy === 'updated_at') {
            const dateA = new Date(a[sortBy]);
            const dateB = new Date(b[sortBy]);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        }
    });

    return (
        <div className="home-page">
            <div className="dots-bg"></div>

            <div className="home-content">
                <motion.div
                    className="page-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Notes</h1>

                    <div className="controls">
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="sort-options">
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="created_at">Created At</option>
                                <option value="updated_at">Updated At</option>
                                <option value="title">Title</option>
                            </select>

                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>

                        <div className="view-toggle">
                            <button
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                            >
                                <i className="fas fa-th-large"></i>
                            </button>
                            <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                            >
                                <i className="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.button
                    className="add-note-btn"
                    onClick={() => setShowAddModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <i className="fas fa-plus"></i>
                    <span>Add Note</span>
                </motion.button>

                {isLoading ? (
                    <motion.div
                        className="loading-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                        <i className="fas fa-spinner"></i>
                    </motion.div>
                ) : (
                    <div className={`notes-container ${viewMode}`}>
                        {sortedNotes.length > 0 ? (
                            sortedNotes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    viewMode={viewMode}
                                    onUpdate={updateNote}
                                    onDelete={deleteNote}
                                    onBookmark={toggleBookmark}
                                    darkMode={darkMode}
                                />
                            ))
                        ) : (
                            <motion.div
                                className="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <i className="fas fa-sticky-note"></i>
                                <p>No notes found. Create your first note!</p>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddNoteModal
                    onClose={() => setShowAddModal(false)}
                    onSave={addNote}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
};

export default HomePage;