import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Offers from "./pages/Offers";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Listing from "./pages/Listing";
import ListingItem from "./components/ListingItem";
import Category from "./pages/Category";
import { useState, useEffect, createContext } from "react";
export const DarkModeContext = createContext();
function App() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
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
      <div className={`${darkMode ? "dark-mode" : ""}`}>
        <Router>
          <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/" element={<ListingItem darkMode={darkMode} />} />
            <Route path="/profile" element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/category/:categoryName/:listingId"
              element={<Listing darkMode={darkMode} />}
            />
            <Route path="/offers" element={<Offers />} />
            {<Route path="/category/:categoryName" element={<Category />} />}
            <Route path="create-listing" element={<PrivateRoute />}>
              <Route path="/create-listing" element={<CreateListing />} />
            </Route>
            <Route path="edit-listing" element={<PrivateRoute />}>
              <Route
                path="/edit-listing/:listingId"
                element={<EditListing />}
              />
            </Route>
          </Routes>
        </Router>
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
      </div>
    </DarkModeContext.Provider>
  );
}

export default App;
