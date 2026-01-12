import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Search from './pages/Search';
import History from './pages/History';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/search" element={<Search />} />
                        <Route path="/history" element={<History />} />
                    </Route>

                    {/* Redirect root to search */}
                    <Route path="/" element={<Navigate to="/search" replace />} />

                    {/* 404 - Redirect to search */}
                    <Route path="*" element={<Navigate to="/search" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
