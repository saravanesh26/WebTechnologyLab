import React from 'react';
import StudentCard from './components/StudentCard';
import './App.css';

function App() {
  const students = [
    { id: 1, name: "Alice Johnson", department: "Computer Science", marks: "95%" },
    { id: 2, name: "Bob Smith", department: "Mechanical Engineering", marks: "88%" },
    { id: 3, name: "Charlie Davis", department: "Electronics Engineering", marks: "92%" },
    { id: 4, name: "Diana Prince", department: "Data Science", marks: "98%" },
    { id: 5, name: "Saravanesh K S", department: "B.Tech SCOPE", marks: "94%" }
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>VIT-AP Student Portal</h1>
        <p>Lab 9 Exercise 2: React Component Reusability</p>
      </header>
      
      <main className="cards-container">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </main>
    </div>
  );
}

export default App;
