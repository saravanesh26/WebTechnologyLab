import React from 'react';
import './StudentCard.css';

const StudentCard = ({ student }) => {
  const { name, department, marks } = student;
  
  return (
    <div className="student-card">
      <div className="card-header">
        <h3 className="student-name">{name}</h3>
      </div>
      <div className="card-body">
        <p><strong>Department:</strong> {department}</p>
        <p><strong>Marks:</strong> {marks}</p>
      </div>
    </div>
  );
};

export default StudentCard;
