import React from 'react';
import './App.css';
import MyComponent from './components/MyComponent';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>React App</h1>
        <MyComponent />
      </header>
    </div>
  );
}

export default App;
