import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DarkModeContext } from "../App";

export default function OAuth() {
  const darkMode = useContext(DarkModeContext);
  const navigate = useNavigate();
  async function onGoogleClick() {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }

      navigate("/");
    } catch (error) {
      toast.error("Could not authorize with Google");
    }
  }
  return (
    <button
      type="button"
      onClick={onGoogleClick}
      className={`flex items-center justify-center w-full bg-white px-7 py-3 text-md font-medium hover:bg-orange-800 hover:text-white active:bg-red-900 shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out rounded ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <FcGoogle className=" bg-white rounded-full mr-2" />
      Sign in with Google
    </button>
  );
}
