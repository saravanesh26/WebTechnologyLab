import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Minimal delay to showcase the loading indicator smoothly
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching the data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once on component mount

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">User Directory</h1>
        <p className="subtitle">Fetching and displaying external API Data</p>
      </header>

      {/* Conditional Rendering for Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users from API...</p>
        </div>
      ) : error ? (
        /* Conditional Rendering for Error State */
        <div className="error-container">
          <h2 className="error-title">⚠️ Error fetching data</h2>
          <p className="error-msg">{error}</p>
          <button className="retry-button" onClick={fetchUsers}>
            Try Again
          </button>
        </div>
      ) : (
        /* Data Display */
        <div className="grid-container">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="card-header">
                <h2 className="user-name">{user.name}</h2>
                <div className="user-username">@{user.username}</div>
              </div>
              <div className="card-body">
                <p>
                  <span className="icon">📧</span> {user.email}
                </p>
                <p>
                  <span className="icon">📞</span> {user.phone.split(' ')[0]}
                </p>
                <p>
                  <span className="icon">🏢</span> {user.company.name}
                </p>
              </div>
              <div className="card-footer">
                ID: {user.id} • API Sync Complete
              </div>
            </div>
          ))}
          {users.length === 0 && <p>No users found.</p>}
        </div>
      )}
    </div>
  );
}

export default App;
