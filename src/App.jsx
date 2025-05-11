import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DocumentView from './pages/DocumentView';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';
import { UserRoleProvider } from './context/UserRoleContext';
import { SidebarProvider } from './context/SidebarContext';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import CategoryManagement from './pages/admin/CategoryManagement';
import DocumentManagement from './pages/admin/DocumentManagement';
import QuestionManagement from './pages/admin/QuestionManagement';
import HomePage from './pages/HomePage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/firebase';
import { useUserRole } from './context/UserRoleContext';
const ConditionalHomeRoute = () => {
  const [user] = useAuthState(auth);
  const { isAdmin, loading } = useUserRole();
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>;
  }
  if (user && isAdmin) {
    return (
      <ProtectedAdminRoute>
        <AdminUserManagement />
      </ProtectedAdminRoute>
    );
  }
  return <HomePage />;
};
function App() {
  return (
    <ThemeProvider>
      <UserRoleProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<ConditionalHomeRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/users" element={
                <ProtectedAdminRoute>
                  <AdminUserManagement />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedAdminRoute>
                  <CategoryManagement />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/documents" element={
                <ProtectedAdminRoute>
                  <DocumentManagement />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/questions" element={
                <ProtectedAdminRoute>
                  <QuestionManagement />
                </ProtectedAdminRoute>
              } />
              <Route path="/:categorySlug/:documentSlug" element={<DocumentView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SidebarProvider>
      </UserRoleProvider>
    </ThemeProvider>
  );
}
export default App;