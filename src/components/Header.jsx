import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import logo from "../img/1.png";
import logo2 from "../assests/svg/2.png";
import Avatar from "../assests/svg/avatar.png";
import { FcHome } from "react-icons/fc";
import { FaMoon, FaSun } from "react-icons/fa";
import { TbDiscount2 } from "react-icons/tb";
import "../index.css";

export default function Header(props) {
  const [pageState, setPageState] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState(
          <div>
            <img
              className="w-6 h-6 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
              src={auth.currentUser.photoURL}
              alt="Rounded avatar"
            />
          </div>
        );
      } else {
        setPageState(
          <img
            className="w-6 h-6 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
            src={Avatar}
            alt="Rounded avatar"
          />
        );
      }
    });
  }, [auth]);
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }
  return (
    <div>
      <header className="flex justify-between items-center px-3 max-w-7xl mx-auto">
        <div>
          <img
            src={props.darkMode ? logo2 : logo}
            alt="logo"
            className="h-8 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            <li
              className={`cursor-pointer py-3 text-xl font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/") && "text-black border-b-red-500"
              }`}
              onClick={() => navigate("/")}
            >
              <FcHome className="" />
            </li>
            <li
              className={`cursor-pointer py-3 text-xl font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/offers") && "text-black border-b-red-500"
              }`}
              onClick={() => navigate("/offers")}
            >
              {props.darkMode ? (
                <TbDiscount2 className="stroke-orange-500" />
              ) : (
                <TbDiscount2 />
              )}
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                (pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) &&
                "text-black border-b-red-500"
              }`}
              onClick={() => navigate("/profile")}
            >
              {pageState}
            </li>
            <div className="relative h-30 w-30 ...">
              <div class="absolute top-0 right-0 ...">
                <button
                  onClick={() => props.toggleDarkMode()}
                  className="dark-mode-toggle-btn cursor-pointer py-3  text-lg font-semibold text-gray-400 border-b-[3px] border-b-transparent"
                >
                  {props.darkMode ? <FaMoon /> : <FaSun />}
                </button>
              </div>
            </div>
            {/* <button onClick={props.toggleDarkMode}>Toggle Dark Mode</button> */}
          </ul>
        </div>
      </header>
    </div>
  );
}
