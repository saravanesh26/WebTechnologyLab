import React, { useState } from 'react';
import ItemInput from './components/ItemInput';
import ItemList from './components/ItemList';
import './App.css';

function App() {
  const [items, setItems] = useState([]);

  const handleAddItem = (text) => {
    const newItem = {
      id: Date.now(),
      text: text,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="app-container">
      <h1>Dynamic Item List</h1>
      <ItemInput onAddItem={handleAddItem} />
      <ItemList items={items} onRemoveItem={handleRemoveItem} />
    </div>
  );
}

export default App;
