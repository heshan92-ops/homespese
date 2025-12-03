import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Movements from './pages/Movements';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import RecurringExpenses from './pages/RecurringExpenses';
import Users from './pages/Users';
import Families from './pages/Families';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';

import { FabProvider } from './context/FabContext';

function App() {
  return (
    <AuthProvider>
      <FabProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/movements" element={
              <Layout>
                <Movements />
              </Layout>
            } />
            <Route path="/budgets" element={
              <ProtectedRoute>
                <Layout>
                  <Budgets />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/recurring" element={
              <ProtectedRoute>
                <Layout>
                  <RecurringExpenses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requireSuperuser={true}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/families" element={
              <ProtectedRoute requireSuperuser={true}>
                <Layout>
                  <Families />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </FabProvider>
    </AuthProvider>
  );
}

export default App;
