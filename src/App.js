import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Offers from "./pages/Offers";
import Favorites from "./pages/Favorites";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Listing from "./pages/Listing";
import Category from "./pages/Category";
import { useState, useEffect, createContext } from "react";
import { FavoritesProvider } from "./context/FavoritesContext";

export const DarkModeContext = createContext();

function ConditionalFooter() {
  const location = useLocation();
  const hideFooter = location.pathname === "/sign-in" || location.pathname === "/sign-up";
  if (hideFooter) return null;
  return <Footer />;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
  useEffect(() => {
    const currentMode = localStorage.getItem("darkMode");
    if (currentMode) {
      setDarkMode(JSON.parse(currentMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <DarkModeContext.Provider value={darkMode}>
      <FavoritesProvider>
        <div className={`${darkMode ? "dark-mode" : ""} flex flex-col min-h-screen`}>
          <Router>
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<PrivateRoute />}>
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/category/:categoryName/:listingId" element={<Listing />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/category/:categoryName" element={<Category />} />
                <Route path="create-listing" element={<PrivateRoute />}>
                  <Route path="/create-listing" element={<CreateListing />} />
                </Route>
                <Route path="edit-listing" element={<PrivateRoute />}>
                  <Route path="/edit-listing/:listingId" element={<EditListing />} />
                </Route>
              </Routes>
            </main>
            <ConditionalFooter />
            <BackToTop />
          </Router>
        </div>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </FavoritesProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
