import React from 'react';

export default function MyComponent(props) {
  return (
    <div className="my-component">
      <h2>My Component</h2>
      <p>This is a working React component!</p>
      <div className="component-content">
        <button onClick={() => alert('Hello!')}>Click me</button>
      </div>
    </div>
  );
}
