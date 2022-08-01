import './App.css';
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage';
import { Routes, Route } from "react-router-dom";
import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import VideoChat from './pages/VideoChat/VideoChat';

function App() {
  return (
    <div className="App">
      <AuthProvider>             
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } exact />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/videochat" element={<VideoChat />} />
        </Routes>
        </AuthProvider>
    </div>
  );
}

export default App;
