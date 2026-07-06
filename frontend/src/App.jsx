import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard/Dashboard";
import Focus from "./pages/Focus"
import Notes from "./pages/Notes";
import Flashcards from "./pages/Flashcards";
import Planner from "./pages/Planner";
import AiTutor from "./pages/AiTutor";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";


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

      <Route 
      path="/dashboard/planner" 
      element={<Planner />} />

      <Route 
      path="/dashboard/ai-tutor" 
      element={<AiTutor />} />

      <Route 
      path="/dashboard/profile" 
      element={<Profile />} />

      <Route 
      path="/dashboard/resources" 
      element={<Resources />} />
    </Routes>
  );
}

export default App;