import React, { useState, useEffect } from 'react';
import { getFolders, createFolder, renameFolder, deleteFolder, type Folder } from '../../../services/folderService.ts';
import CreateFolderModal from './CreateFolderModal.tsx';
import './CollectionsPopup.css';

const iconClose = "/assets/home/close.svg";
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconHistory = "/assets/home/book.svg";
const iconFavoritesCollection = "/assets/home/favorite-collection.svg";
const iconWordSets = "/assets/home/star.svg";
const iconCustomFolder = "/assets/home/custom-folder.svg";
const iconFlag = "/assets/home/flag.svg";
const iconPlus = "/assets/home/plus.svg";

interface CollectionsPopupProps {
    onClose: () => void;
    onOpenCollection: (id: string, folderId?: number) => void;
    historyCount: number;
    favoritesCount: number;
    wordSetsCount: number;
    onFoldersUpdated?: () => void;
}

const CollectionsPopup: React.FC<CollectionsPopupProps> = ({
    onClose,
    onOpenCollection,
    historyCount,
    favoritesCount,
    wordSetsCount,
    onFoldersUpdated
}) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    const foldersRowRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = (direction: 'left' | 'right') => {
        if (foldersRowRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = foldersRowRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            foldersRowRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

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

    const handleCreateFolder = async (name: string) => {
        const newFolder = await createFolder(name);
        setFolders(prev => [...prev, newFolder]);
        setError(null);
        onFoldersUpdated?.();
    };

    const handleRename = async (folderId: number, newName: string) => {
        if (!newName.trim()) {
            setError('Folder name cannot be empty');
            return;
        }

        try {
            const updated = await renameFolder(folderId, newName.trim());
            setFolders(prev => prev.map(f => f.id === folderId ? updated : f));
            setEditingFolderId(null);
            setEditingName('');
            setActiveMenu(null);
            setError(null);
            onFoldersUpdated?.();
        } catch (e: any) {
            console.error('Failed to rename folder', e);
            if (e.response?.status === 409) {
                setError('A folder with this name already exists');
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
            setActiveMenu(null);
            setError(null);
            onFoldersUpdated?.();
        } catch (e: any) {
            console.error('Failed to delete folder', e);
            setError('Failed to delete folder');
        }
    };



    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !editingFolderId && !isCreatingFolder && !deletingFolderId) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose, editingFolderId, isCreatingFolder, deletingFolderId]);

    const defaultCollections = [
        { id: 'history', name: 'History', count: historyCount, icon: iconHistory },
        { id: 'favourites', name: 'Favourites', count: favoritesCount, icon: iconFavoritesCollection },
        { id: 'wordsets', name: 'Word sets', count: wordSetsCount, icon: iconWordSets }
    ];

    return (
        <div className="collections-popup-overlay">
            <div className="collections-popup-content">
                <div className="collections-popup-header">
                    <h2>Collections</h2>
                    <div className="collections-popup-controls">
                        <button className="nav-arrow" onClick={() => handleScroll('left')}>
                            <img src={iconNavLeft} alt="Previous" />
                        </button>
                        <button className="nav-arrow" onClick={() => handleScroll('right')}>
                            <img src={iconNavRight} alt="Next" />
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            <img src={iconClose} alt="Close" />
                        </button>
                    </div>
                </div>

                <div className="collections-popup-body">
                    {error && <div className="error-message">{error}</div>}

                    {/* Row 1: Default Collections */}
                    <div className="collections-row">
                        <h3 className="row-title">Collections</h3>
                        <div className="collections-row-content">
                            {defaultCollections.map(collection => (
                                <div
                                    key={collection.id}
                                    className="collection-item"
                                    onClick={() => onOpenCollection(collection.id)}
                                >
                                    <div className="collection-info">
                                        <h3>{collection.name}</h3>
                                        <p>{collection.count} {collection.id === 'wordsets' ? 'sets' : 'lessons'}</p>
                                    </div>
                                    <div className="collection-icon">
                                        <img src={collection.icon} alt={collection.name} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 2: Custom Folders */}
                    <div className="collections-row">
                        <h3 className="row-title">Folders</h3>
                        <div className="collections-row-content" ref={foldersRowRef}>
                            {/* Custom Folders */}
                            {folders.map(folder => (
                                <div
                                    key={folder.id}
                                    className="collection-item custom-folder-item"
                                    onClick={() => onOpenCollection(`folder-${folder.id}`, folder.id)}
                                >
                                    <div className="collection-info">
                                        <h3>{folder.name}</h3>
                                        <p>{folder.lesson_count} {folder.lesson_count === 1 ? 'lesson' : 'lessons'}</p>
                                    </div>
                                    <div className="collection-icon-wrapper">
                                        <div className="collection-icon">
                                            <img src={iconFlag} alt="Flag" />
                                        </div>
                                        <button
                                            className="folder-menu-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === folder.id ? null : folder.id);
                                            }}
                                        >
                                            ⋯
                                        </button>
                                        {activeMenu === folder.id && (
                                            <div className="folder-menu">
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingFolderId(folder.id);
                                                    setEditingName(folder.name);
                                                    setActiveMenu(null);
                                                }}>Rename</button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingFolderId(folder.id);
                                                    setActiveMenu(null);
                                                }}>Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add Folder Item */}
                            <div
                                className="collection-item add-folder-item"
                                onClick={() => setIsCreatingFolder(true)}
                            >
                                <div className="collection-info">
                                    <h3>Add folder</h3>
                                </div>
                                <div className="collection-icon add-icon">
                                    <img src={iconPlus} alt="Add" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deletingFolderId !== null && (
                    <div className="delete-confirmation-overlay">
                        <div className="delete-confirmation-modal">
                            <h2>Do you want to delete this folder?</h2>
                            <div className="delete-confirmation-actions">
                                <button className="cancel-btn" onClick={() => setDeletingFolderId(null)}>Go back</button>
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

                {/* Create Folder Modal */}
                {isCreatingFolder && (
                    <CreateFolderModal
                        onClose={() => setIsCreatingFolder(false)}
                        onSave={handleCreateFolder}
                    />
                )}

                {/* Rename Folder Modal */}
                {editingFolderId !== null && (
                    <CreateFolderModal
                        onClose={() => {
                            setEditingFolderId(null);
                            setEditingName('');
                        }}
                        onSave={(name) => handleRename(editingFolderId, name)}
                        title="Rename your folder"
                        initialValue={editingName}
                    />
                )}
            </div>
        </div>
    );
};

export default CollectionsPopup;
