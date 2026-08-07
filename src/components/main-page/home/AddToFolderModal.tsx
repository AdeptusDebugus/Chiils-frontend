import React, { useState, useEffect, useRef } from 'react';
import { getFolders, addLessonToFolder, removeLessonFromFolder, createFolder, getFoldersForLesson, type Folder } from '../../../services/folderService.ts';
import CreateFolderModal from './CreateFolderModal.tsx';
import FolderNotification from './FolderNotification.tsx';
import './AddToFolderModal.css';

const iconClose = "/assets/home/close-circle.svg";
const iconFlag = "/assets/home/flag.svg";
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";

interface AddToFolderModalProps {
    lessonId: string;
    onClose: () => void;
    onFoldersUpdated?: () => void;
}

const AddToFolderModal: React.FC<AddToFolderModalProps> = ({ lessonId, onClose, onFoldersUpdated }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [foldersWithLesson, setFoldersWithLesson] = useState<Set<number>>(new Set());
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ folderId: number, folderName: string } | null>(null);

    const recentRowRef = useRef<HTMLDivElement>(null);
    const allRowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000); // Auto-dismiss after 5s
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const loadFolders = async () => {
        try {
            setLoading(true);
            const [data, containingFolderIds] = await Promise.all([
                getFolders(),
                getFoldersForLesson(lessonId)
            ]);
            setFolders(data);
            setFoldersWithLesson(new Set(containingFolderIds));
        } catch (e) {
            console.error('Failed to load folders', e);
            setError('Failed to load folders');
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 220;
            const newScrollLeft = ref.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            ref.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
    };

    const handleToggleFolder = async (folderId: number) => {
        const hasLesson = foldersWithLesson.has(folderId);
        const folder = folders.find(f => f.id === folderId);

        if (hasLesson) return; // Only allow adding to folders that don't have the lesson

        try {
            // Adding shows notification with undo
            await addLessonToFolder(folderId, lessonId);
            setFoldersWithLesson(prev => new Set(prev).add(folderId));
            setFolders(prev => prev.map(f =>
                f.id === folderId ? { ...f, lesson_count: f.lesson_count + 1 } : f
            ));
            if (folder) {
                setNotification({ folderId, folderName: folder.name });
            }
            onFoldersUpdated?.();

            // Auto-close if this is the only folder
            if (folders.length === 1) {
                setTimeout(onClose, 500); // Small delay to show state change
            }
        } catch (e: any) {
            console.error('Failed to add to folder', e);
            setError('Failed to add to folder');
        }
    };

    const handleUndo = async () => {
        if (!notification) return;
        const { folderId } = notification;
        try {
            await removeLessonFromFolder(folderId, lessonId);
            setFoldersWithLesson(prev => {
                const newSet = new Set(prev);
                newSet.delete(folderId);
                return newSet;
            });
            setFolders(prev => prev.map(f =>
                f.id === folderId ? { ...f, lesson_count: Math.max(0, f.lesson_count - 1) } : f
            ));
            setNotification(null);
            onFoldersUpdated?.();
        } catch (e) {
            console.error('Failed to undo add to folder', e);
            setError('Failed to undo');
        }
    };

    const handleCreateFolder = async (name: string) => {
        try {
            const newFolder = await createFolder(name);
            setFolders(prev => [...prev, newFolder]);
            setIsCreatingFolder(false);

            // Automatically add lesson to the new folder
            await addLessonToFolder(newFolder.id, lessonId);
            setFoldersWithLesson(prev => new Set(prev).add(newFolder.id));
            setFolders(prev => prev.map(f =>
                f.id === newFolder.id ? { ...f, lesson_count: 1 } : f
            ));
            setNotification({ folderId: newFolder.id, folderName: newFolder.name });
            onFoldersUpdated?.();

            // Auto-close if this was the first folder created
            if (folders.length === 0) {
                setTimeout(onClose, 500);
            }
        } catch (e) {
            console.error('Failed to create folder', e);
            setError('Failed to create folder');
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    // For "Recent", let's take the first 4 folders or similar
    const recentFolders = folders.slice(0, 4);

    return (
        <div className="add-to-folder-overlay" onClick={handleOverlayClick}>
            <div className="add-to-folder-modal">
                <div className="add-to-folder-header">
                    <h2>Save to folder</h2>
                    <button className="close-btn" onClick={onClose}>
                        <img src={iconClose} alt="Close" />
                    </button>
                </div>

                <div className="add-to-folder-body">
                    {loading ? (
                        <div className="loading-state">Loading folders...</div>
                    ) : (
                        <>
                            {/* Recent Section */}
                            <div className="folder-section">
                                <div className="section-header">
                                    <h3>Recent</h3>
                                    <div className="section-nav">
                                        <button onClick={() => handleScroll(recentRowRef, 'left')}><img src={iconNavLeft} alt="<" /></button>
                                        <button onClick={() => handleScroll(recentRowRef, 'right')}><img src={iconNavRight} alt=">" /></button>
                                    </div>
                                </div>
                                <div className="folder-cards-row" ref={recentRowRef}>
                                    {recentFolders.map(folder => (
                                        <div
                                            key={`recent-${folder.id}`}
                                            className="folder-card-item"
                                            onClick={() => handleToggleFolder(folder.id)}
                                        >
                                            <div className="folder-card-info">
                                                <h4>{folder.name}</h4>
                                                <span>{folder.lesson_count} lessons</span>
                                            </div>
                                            <div className="folder-card-icon">
                                                <img src={iconFlag} alt="Flag" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* All Folders Section */}
                            <div className="folder-section">
                                <div className="section-header">
                                    <h3>All folders</h3>
                                    <div className="section-nav">
                                        <button onClick={() => handleScroll(allRowRef, 'left')}><img src={iconNavLeft} alt="<" /></button>
                                        <button onClick={() => handleScroll(allRowRef, 'right')}><img src={iconNavRight} alt=">" /></button>
                                    </div>
                                </div>
                                <div className="folder-cards-row" ref={allRowRef}>
                                    {folders.map(folder => (
                                        <div
                                            key={`all-${folder.id}`}
                                            className="folder-card-item"
                                            onClick={() => handleToggleFolder(folder.id)}
                                        >
                                            <div className="folder-card-info">
                                                <h4>{folder.name}</h4>
                                                <span>{folder.lesson_count} lessons</span>
                                            </div>
                                            <div className="folder-card-icon">
                                                <img src={iconFlag} alt="Flag" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="create-folder-pill" onClick={() => setIsCreatingFolder(true)}>
                        Create new folder
                    </button>
                </div>

                {isCreatingFolder && (
                    <CreateFolderModal
                        onClose={() => setIsCreatingFolder(false)}
                        onSave={handleCreateFolder}
                        existingNames={folders.map(f => f.name)}
                        title="Create folder"
                    />
                )}
            </div>

            {notification && (
                <FolderNotification
                    folderName={notification.folderName}
                    onUndo={handleUndo}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default AddToFolderModal;

