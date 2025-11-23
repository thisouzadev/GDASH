import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import RegisterPage from "./pages/register/RegisterPage";
import Example from "./components/examples/card/standard/card-standard-2";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/example",
    element: <Example />,
  },
]);
