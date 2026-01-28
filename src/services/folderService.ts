import api from './api';
import { type Tags } from './lessonService';

// ===== Folder Types =====
export interface Folder {
    id: number;
    name: string;
    lesson_count: number;
}

export interface FolderLesson {
    lesson_id: string;
    youtube_url: string;
    lesson_topic: string;
    tags: Tags;
    created_at: string;
}

export interface CreateFolderRequest {
    name: string;
}

export interface RenameFolderRequest {
    name: string;
}

export interface AddLessonToFolderRequest {
    lessonId: string;
}

// ===== API Functions =====

/**
 * Get all folders for the current user with lesson counts
 */
export async function getFolders(): Promise<Folder[]> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return [];

    try {
        const res = await api.get<Folder[]>('/folders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data || [];
    } catch (e) {
        console.error('Failed to get folders', e);
        return [];
    }
}

/**
 * Create a new folder
 */
export async function createFolder(name: string): Promise<Folder> {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('Not authenticated');

    const res = await api.post<Folder>('/folders', { name }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

/**
 * Rename an existing folder
 */
export async function renameFolder(folderId: number, name: string): Promise<Folder> {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('Not authenticated');

    const res = await api.put<Folder>(`/folders/${folderId}`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

/**
 * Delete a folder
 */
export async function deleteFolder(folderId: number): Promise<void> {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('Not authenticated');

    await api.delete(`/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

/**
 * Get all lessons inside a folder
 */
export async function getFolderLessons(folderId: number): Promise<FolderLesson[]> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return [];

    try {
        const res = await api.get<FolderLesson[]>(`/folders/${folderId}/lessons`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data || [];
    } catch (e) {
        console.error('Failed to get folder lessons', e);
        return [];
    }
}

/**
 * Add a lesson to a folder
 */
export async function addLessonToFolder(folderId: number, lessonId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('Not authenticated');

    await api.post(`/folders/${folderId}/lessons`, { lessonId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

/**
 * Remove a lesson from a folder
 */
export async function removeLessonFromFolder(folderId: number, lessonId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('Not authenticated');

    await api.delete(`/folders/${folderId}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

/**
 * Get folders that contain a specific lesson
 */
export async function getFoldersForLesson(lessonId: string): Promise<number[]> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return [];

    try {
        const folders = await getFolders();
        const folderIds: number[] = [];

        // Check each folder to see if it contains the lesson
        for (const folder of folders) {
            const lessons = await getFolderLessons(folder.id);
            if (lessons.some(l => l.lesson_id === lessonId)) {
                folderIds.push(folder.id);
            }
        }

        return folderIds;
    } catch (e) {
        console.error('Failed to get folders for lesson', e);
        return [];
    }
}
