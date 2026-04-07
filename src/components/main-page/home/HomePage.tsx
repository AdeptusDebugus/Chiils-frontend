import React from 'react';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import TeacherHomePage from './TeacherHomePage.tsx';
import StudentHomePage from './StudentHomePage.tsx';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Redirect based on user role to avoid Hook violation
  // Backend Enum is 'STUDENT', 'TEACHER', 'USER'
  if (user?.role === 'STUDENT') {
    return <StudentHomePage />;
  }

  // Default to Teacher/Standard dashboard for other roles
  return <TeacherHomePage />;
};

export default HomePage;