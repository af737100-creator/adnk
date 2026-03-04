import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CourseEditor from './pages/CourseEditor';
import CoursePlayer from './pages/CoursePlayer';
import Sidebar from './components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-stone-50 font-sans text-stone-900">
        {user && <Sidebar profile={profile} />}
        <main className={`flex-1 ${user ? 'md:ml-64' : ''}`}>
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Home />} 
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-courses" 
              element={user ? <MyCourses /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/reports" 
              element={user && profile?.role === 'teacher' ? <Reports /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={user && profile?.role === 'teacher' ? <Settings /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/course/new" 
              element={user && profile?.role === 'teacher' ? <CourseEditor /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/course/edit/:id" 
              element={user && profile?.role === 'teacher' ? <CourseEditor /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/course/play/:id" 
              element={user ? <CoursePlayer /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
