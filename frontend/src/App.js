import { Route, Routes, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.js";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js"
const App = () => {
  const { authUser, checkAuth, isCheckingAuth,  onlineUsers  } = useAuthStore();

  const {theme} = useThemeStore();

  console.log({ onlineUsers });
  useEffect(() => {
    checkAuth();  
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div data-theme={theme}> 
 
      <main className="container mx-auto p-4"> 
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
        </Routes>

        <Toaster />
      </main>
    </div>
  );
}

export default App;