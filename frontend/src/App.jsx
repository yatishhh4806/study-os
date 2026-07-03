import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard/Dashboard";
import Focus from "./pages/Focus"
import Notes from "./pages/Notes";
import Flashcards from "./pages/Flashcards";


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />
      
      <Route 
      path="/dashboard" 
      element={<Dashboard />} 
      />

      <Route 
      path="/dashboard/focus" 
      element={<Focus />} />

      <Route 
      path="/dashboard/notes" 
      element={<Notes />} />

      <Route 
      path="/dashboard/flashcards" 
      element={<Flashcards />} />
    </Routes>
  );
}

export default App;