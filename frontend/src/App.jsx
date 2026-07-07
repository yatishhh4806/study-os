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
import Settings from "./pages/Settings";
import CommandPalette from "./components/CommandPalette";
import Leaderboard from "./pages/LeaderBoard";
import Badges from "./pages/Badges";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <AuthProvider>
      <CommandPalette></CommandPalette>
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
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/focus"
          element={
            <ProtectedRoute>
              <Focus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/flashcards"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/planner"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/ai-tutor"
          element={
            <ProtectedRoute>
              <AiTutor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/badges"
          element={
            <ProtectedRoute>
              <Badges />
            </ProtectedRoute>
          }
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;