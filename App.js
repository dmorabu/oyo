import React from 'react';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Signup from './Signup';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes >
          <Route path="/" element={<Login/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/login" element={<Login/>} />
        </Routes >
      </div>
    </Router>
  );
};

export default App;
