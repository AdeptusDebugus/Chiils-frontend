import React, { useState, useEffect } from 'react';
import { getMyStudents, removeStudent, type Student } from '../../../services/studentService';
import { getSharedUsers, unshareLesson } from '../../../services/lessonService';

const iconClose = "/assets/home/close-circle.svg";

interface SharedToSidebarProps {
    lessonId?: string;
    wordSetId?: string;
    refreshKey?: number;
}

const SharedToSidebar: React.FC<SharedToSidebarProps> = ({ lessonId, wordSetId, refreshKey }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStudents();
    }, [lessonId, wordSetId, refreshKey]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            let data: Student[] = [];
            if (lessonId) {
                data = await getSharedUsers(lessonId);
            } else {
                data = await getMyStudents();
            }
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students', err);
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (studentId: string) => {
        try {
            if (lessonId) {
                await unshareLesson(lessonId, studentId);
            } else {
                await removeStudent(studentId);
            }
            setStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (err) {
            console.error('Failed to delete/unshare student', err);
            setError('Failed to remove student');
        }
    };

    if (loading) return <div className="shared-sidebar-placeholder">Loading students...</div>;
    if (error) return <div className="shared-sidebar-placeholder error">{error}</div>;

    return (
        <div className="shared-to-container">
            <h3 className="shared-to-title">Shared to</h3>
            <div className="students-scroll-list">
                {students.length === 0 ? (
                    <div className="empty-state">No students added yet.</div>
                ) : (
                    students.map(student => (
                        <div key={student.id} className="student-row">
                            <span className="student-email-link">{student.email}</span>
                            <button
                                className="remove-student-icon-btn"
                                onClick={() => handleDelete(student.id)}
                                title="Remove student"
                            >
                                <img src={iconClose} alt="Remove" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .shared-to-container {
                    background: #FFFFFF;
                    border: 1px solid #2a2b2a;
                    border-radius: 13px;
                    padding: 16px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                    margin-bottom: 12px;
                }
                .shared-to-title {
                    font-family: 'TeX Gyre Heros', sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    color: #2a2b2a;
                    margin: 0;
                    line-height: 18.57px;
                }
                .students-scroll-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .student-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .student-email-link {
                    font-family: 'TeX Gyre Heros', sans-serif;
                    font-size: 15.79px;
                    font-weight: 400;
                    color: #2a2b2a;
                    text-decoration: underline;
                    line-height: 19.74px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .remove-student-icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .remove-student-icon-btn img {
                    width: 18px;
                    height: 18px;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                .remove-student-icon-btn:hover img {
                    opacity: 1;
                }
                .shared-sidebar-placeholder {
                    padding: 40px 0;
                    text-align: center;
                    color: #999999;
                    font-size: 14px;
                }
                .shared-sidebar-placeholder.error {
                    color: #D32F2F;
                }
                .empty-state {
                    font-size: 13px;
                    color: #999999;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default SharedToSidebar;
