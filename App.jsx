import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import StudentForm from '@/components/StudentForm';
import ReportCard from '@/components/ReportCard';
import StudentRecord from '@/components/StudentRecord';
import Navigation from '@/components/Navigation';
import StudentList from '@/components/StudentList';
import Login from '@/components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }

    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    setStudents(savedStudents);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setCurrentView('list');
    setSelectedStudent(null);
  };

  const handleStudentSubmit = (newStudentData) => {
    const newStudent = { ...newStudentData, id: Date.now() };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    setSelectedStudent(newStudent);
    setCurrentView('record');
  };
  
  const handleSelectStudent = (student) => {
    const savedRecord = JSON.parse(localStorage.getItem(`student-record-${student.id}`) || '{}');
    setSelectedStudent(student);
    setGrades(savedRecord.grades || {});
    setCurrentView('record');
  };

  const handleUpdateStudent = (updatedStudent) => {
    const updatedStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updatedStudents);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    setSelectedStudent(updatedStudent);
  };

  const handleDeleteStudent = (studentId) => {
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    localStorage.removeItem(`student-record-${studentId}`);
    setCurrentView('list');
    setSelectedStudent(null);
  }

  const handleGradesUpdate = (newGrades) => {
    setGrades(newGrades);
    if(selectedStudent){
        const savedData = {
            student: selectedStudent,
            grades: newGrades,
        };
        localStorage.setItem(`student-record-${selectedStudent.id}`, JSON.stringify(savedData));
    }
  };

  const navigateTo = (view) => {
    if (view !== 'form' && !selectedStudent && (view === 'record' || view === 'report')) {
      alert("Por favor, selecione um aluno da lista primeiro.");
      setCurrentView('list');
    } else {
      setCurrentView(view);
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return <StudentList students={students} onSelectStudent={handleSelectStudent} setCurrentView={setCurrentView} />;
      case 'form':
        return <StudentForm onSubmit={handleStudentSubmit} />;
      case 'record':
        return (
          <StudentRecord 
            studentData={selectedStudent}
            grades={grades}
            onGradesUpdate={handleGradesUpdate}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case 'report':
        return <ReportCard studentData={selectedStudent} grades={grades} />;
      default:
        return <StudentList students={students} onSelectStudent={handleSelectStudent} setCurrentView={setCurrentView} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Helmet>
        <title>Sistema Escolar - Gestão de Fichas e Boletins</title>
        <meta name="description" content="Sistema completo para gestão de fichas individuais e boletins escolares" />
        <meta property="og:title" content="Sistema Escolar - Gestão de Fichas e Boletins" />
        <meta property="og:description" content="Sistema completo para gestão de fichas individuais e boletins escolares" />
      </Helmet>
      
      <div className="min-h-screen">
        <Header onLogout={handleLogout} />
        
        <main className="container mx-auto px-4 py-8">
          <Navigation currentView={currentView} setCurrentView={navigateTo} />
          
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {renderContent()}
          </motion.div>
        </main>
        
        <Toaster />
      </div>
    </>
  );
}

export default App;