import React, { useState } from 'react';

function ItemInput({ onAddItem }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddItem(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form className="item-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a new item..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button type="submit">Add Item</button>
    </form>
  );
}

export default ItemInput;
