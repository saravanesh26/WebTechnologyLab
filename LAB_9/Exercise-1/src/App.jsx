import React from 'react';

// Functional component to display student profile
function App() {
  // Store student details using JavaScript variables
  const name = "Saravanesh K S";
  const department = "Information Technology";
  const year = "3rd Year";
  const section = "A Section";

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Student Profile</h1>
        <div className="profile-details">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Department:</strong> {department}</p>
          <p><strong>Year:</strong> {year}</p>
          <p><strong>Section:</strong> {section}</p>
        </div>
      </div>
    </div>
  );
}

// Export the component
export default App;
