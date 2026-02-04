import api from './api';

export interface Student {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
}

export const addStudent = async (email: string, name?: string): Promise<void> => {
    await api.post('/students', { email, name });
};

export const getMyStudents = async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/students');
    return response.data;
};

export const removeStudent = async (studentId: string): Promise<void> => {
    await api.delete(`/students/${studentId}`);
};
