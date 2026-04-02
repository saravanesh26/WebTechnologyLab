import React from 'react';

function ItemList({ items, onRemoveItem }) {
  if (items.length === 0) {
    return <p className="empty-message">The list is currently empty. Add some items above!</p>;
  }

  return (
    <ul className="item-list">
      {items.map((item) => (
        <li key={item.id} className="item">
          <span>{item.text}</span>
          <button onClick={() => onRemoveItem(item.id)} className="delete-button">
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ItemList;
