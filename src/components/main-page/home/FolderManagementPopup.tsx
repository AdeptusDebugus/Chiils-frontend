import React, { useState, useEffect } from 'react';
import { getFolders, createFolder, renameFolder, deleteFolder, type Folder } from '../../../services/folderService.ts';
import './FolderManagementPopup.css';

const iconClose = "/assets/home/close.svg";
const iconCustomFolder = "/assets/home/custom-folder.svg";
const iconEdit = "/assets/home/edit.svg"; // Assuming you have an edit icon
const iconDelete = "/assets/home/delete.svg"; // Assuming you have a delete icon

interface FolderManagementPopupProps {
    onClose: () => void;
    onOpenFolder: (folderId: number, folderName: string) => void;
    onFoldersUpdated?: () => void;
}

const FolderManagementPopup: React.FC<FolderManagementPopupProps> = ({ onClose, onOpenFolder, onFoldersUpdated }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null);

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        try {
            setLoading(true);
            const data = await getFolders();
            setFolders(data);
            setError(null);
        } catch (e) {
            console.error('Failed to load folders', e);
            setError('Failed to load folders');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            setError('Folder name cannot be empty');
            return;
        }

        try {
            const newFolder = await createFolder(newFolderName.trim());
            setFolders(prev => [...prev, newFolder]);
            setNewFolderName('');
            setIsCreating(false);
            setError(null);
            onFoldersUpdated?.();
        } catch (e: any) {
            console.error('Failed to create folder', e);
            if (e.response?.status === 409) {
                setError('A folder with this name already exists');
            } else {
                setError('Failed to create folder');
            }
        }
    };

    const handleStartRename = (folder: Folder) => {
        setEditingFolderId(folder.id);
        setEditingName(folder.name);
        setError(null);
    };

    const handleRename = async (folderId: number) => {
        if (!editingName.trim()) {
            setError('Folder name cannot be empty');
            return;
        }

        try {
            const updated = await renameFolder(folderId, editingName.trim());
            setFolders(prev => prev.map(f => f.id === folderId ? updated : f));
            setEditingFolderId(null);
            setEditingName('');
            setError(null);
            onFoldersUpdated?.();
        } catch (e: any) {
            console.error('Failed to rename folder', e);
            if (e.response?.status === 409) {
                setError('A folder with this name already exists');
            } else if (e.response?.status === 404) {
                setError('Folder not found');
            } else {
                setError('Failed to rename folder');
            }
        }
    };

    const handleDeleteConfirm = async (folderId: number) => {
        try {
            await deleteFolder(folderId);
            setFolders(prev => prev.filter(f => f.id !== folderId));
            setDeletingFolderId(null);
            setError(null);
            onFoldersUpdated?.();
        } catch (e: any) {
            console.error('Failed to delete folder', e);
            if (e.response?.status === 404) {
                setError('Folder not found');
            } else {
                setError('Failed to delete folder');
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: 'create' | 'rename', folderId?: number) => {
        if (e.key === 'Enter') {
            if (action === 'create') {
                handleCreateFolder();
            } else if (action === 'rename' && folderId) {
                handleRename(folderId);
            }
        } else if (e.key === 'Escape') {
            if (action === 'create') {
                setIsCreating(false);
                setNewFolderName('');
            } else if (action === 'rename') {
                setEditingFolderId(null);
                setEditingName('');
            }
            setError(null);
        }
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !editingFolderId && !isCreating && !deletingFolderId) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose, editingFolderId, isCreating, deletingFolderId]);

    return (
        <div className="folder-management-overlay">
            <div className="folder-management-content">
                <div className="folder-management-header">
                    <h2>Manage Folders</h2>
                    <button className="close-btn" onClick={onClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </div>

                <div className="folder-management-body">
                    {loading ? (
                        <div className="loading-state">Loading folders...</div>
                    ) : (
                        <>
                            {error && <div className="error-message">{error}</div>}

                            {folders.length === 0 && !isCreating ? (
                                <div className="empty-state">
                                    <p>No folders yet. Create your first folder!</p>
                                </div>
                            ) : (
                                <div className="folders-grid">
                                    {folders.map(folder => (
                                        <div key={folder.id} className="folder-card">
                                            {editingFolderId === folder.id ? (
                                                <div className="folder-edit-form">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, 'rename', folder.id)}
                                                        autoFocus
                                                        maxLength={50}
                                                    />
                                                    <div className="folder-edit-actions">
                                                        <button onClick={() => {
                                                            setEditingFolderId(null);
                                                            setEditingName('');
                                                            setError(null);
                                                        }}>Cancel</button>
                                                        <button onClick={() => handleRename(folder.id)}>Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div
                                                        className="folder-card-main"
                                                        onClick={() => onOpenFolder(folder.id, folder.name)}
                                                    >
                                                        <div className="folder-icon">
                                                            <img src={iconCustomFolder} alt="Folder" />
                                                        </div>
                                                        <div className="folder-info">
                                                            <h3>{folder.name}</h3>
                                                            <p>{folder.lessonCount} {folder.lessonCount === 1 ? 'lesson' : 'lessons'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="folder-actions">
                                                        <button
                                                            className="edit-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStartRename(folder);
                                                            }}
                                                            title="Rename folder"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeletingFolderId(folder.id);
                                                            }}
                                                            title="Delete folder"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isCreating ? (
                                <div className="create-folder-section">
                                    <input
                                        type="text"
                                        placeholder="Folder name"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'create')}
                                        autoFocus
                                        maxLength={50}
                                    />
                                    <div className="create-folder-actions">
                                        <button onClick={() => {
                                            setIsCreating(false);
                                            setNewFolderName('');
                                            setError(null);
                                        }}>Cancel</button>
                                        <button onClick={handleCreateFolder}>Create</button>
                                    </div>
                                </div>
                            ) : (
                                <button className="create-folder-btn" onClick={() => setIsCreating(true)}>
                                    + Create New Folder
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deletingFolderId !== null && (
                    <div className="delete-confirmation-overlay">
                        <div className="delete-confirmation-modal">
                            <h3>Delete Folder?</h3>
                            <p>Are you sure you want to delete this folder? Lessons will not be deleted.</p>
                            <div className="delete-confirmation-actions">
                                <button onClick={() => setDeletingFolderId(null)}>Cancel</button>
                                <button
                                    className="confirm-delete"
                                    onClick={() => handleDeleteConfirm(deletingFolderId)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FolderManagementPopup;
