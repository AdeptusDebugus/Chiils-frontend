import api from './api';

export interface Student {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
}

export const addStudent = async (email: string, name?: string): Promise<Student> => {
    const response = await api.post<Student>('/students', { email, name });
    return response.data;
};

export const getMyStudents = async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/students');
    return response.data;
};

export const removeStudent = async (studentId: string): Promise<void> => {
    await api.delete(`/students/${studentId}`);
};

export const getMyTeacher = async (): Promise<Student | null> => {
    try {
        const response = await api.get<Student>('/students/teacher');
        return response.data;
    } catch (e) {
        return null;
    }
};
