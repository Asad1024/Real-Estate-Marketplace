import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import logo from "../img/1.png";
import Avatar from "../assests/svg/avatar.png";
import { FcHome } from "react-icons/fc";
import { TbDiscount2 } from "react-icons/tb";

export default function Header() {
  const [pageState, setPageState] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState(
          <img
            className="w-6 h-6 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
            src={auth.currentUser.photoURL}
            alt="Rounded avatar"
          />
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
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            src={logo}
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
              <TbDiscount2 />
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
          </ul>
        </div>
      </header>
    </div>
  );
}
