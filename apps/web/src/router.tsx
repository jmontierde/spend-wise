import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import ExpenseAdd from "./pages/ExpenseAdd";
import ExpenseEdit from "./pages/ExpenseEdit";
import Budget from "./pages/Budget";
import Savings from "./pages/Savings";
import SavingsAdd from "./pages/SavingsAdd";
import SavingsDetail from "./pages/SavingsDetail";
import SavingsTransaction from "./pages/SavingsTransaction";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/add" element={<ExpenseAdd />} />
          <Route path="/expenses/:id" element={<ExpenseEdit />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/savings/add" element={<SavingsAdd />} />
          <Route path="/savings/:id" element={<SavingsDetail />} />
          <Route path="/savings/:id/transaction" element={<SavingsTransaction />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
