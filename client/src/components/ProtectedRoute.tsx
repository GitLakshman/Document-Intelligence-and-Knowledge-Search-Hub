import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { LoadingSpinner } from './ui';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#212121]">
                <LoadingSpinner branded size="md" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#212121]">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default ProtectedRoute;
