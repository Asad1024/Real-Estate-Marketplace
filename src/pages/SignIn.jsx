import React, { useState } from "react";
import shareVideo from "../assests/share.mp4";
import logo from "../assests/svg/2.png";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    image: "",
  });
  const { email, password, image } = formData;
  const navigate = useNavigate();
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(e) {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        navigate("/");
      }
    } catch (error) {
      toast.error("Bad user credentials");
    }
  }
  return (
    // <section>
    //   <h1 className="text-3xl text-center mt-6 font-bold">Sign In</h1>
    //   <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
    //     <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
    //       <img
    //         src="https://images.unsplash.com/photo-1573706518886-f90f89c72f14?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGxvY2t8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
    //         alt="key"
    //         className="w-full rounded-2xl"
    //       />
    //     </div>
    //     <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
    //       <form onSubmit={onSubmit}>
    //         <input
    //           type="email"
    //           id="email"
    //           value={email}
    //           onChange={onChange}
    //           placeholder="Email address"
    //           className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
    //         />
    //         <div className="relative mb-6">
    //           <input
    //             type={showPassword ? "text" : "password"}
    //             id="password"
    //             value={password}
    //             onChange={onChange}
    //             placeholder="Password"
    //             className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
    //           />
    //           {showPassword ? (
    //             <AiFillEyeInvisible
    //               className="absolute right-3 top-3 text-xl cursor-pointer"
    //               onClick={() => setShowPassword((prevState) => !prevState)}
    //             />
    //           ) : (
    //             <AiFillEye
    //               className="absolute right-3 top-3 text-xl cursor-pointer"
    //               onClick={() => setShowPassword((prevState) => !prevState)}
    //             />
    //           )}
    //         </div>
    //         <div className="flex justify-between whitespace-nowrap text-sm font-semibold sm:text-lg">
    //           <p className="mb-6">
    //             Don't have a account?
    //             <Link
    //               to="/sign-up"
    //               className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
    //             >
    //               Register
    //             </Link>
    //           </p>
    //           <p>
    //             <Link
    //               to="/forgot-password"
    //               className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
    //             >
    //               Forgot password?
    //             </Link>
    //           </p>
    //         </div>
    //         <button
    //           className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
    //           type="submit"
    //         >
    //           Sign in
    //         </button>
    //         <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
    //           <p className="text-center font-semibold mx-4">OR</p>
    //         </div>
    //         <OAuth />
    //       </form>
    //     </div>
    //   </div>
    // </section>
    <div className="flex justify-start items-center flex-col h-screen">
      <div className=" relative w-full h-full">
        <video
          src={shareVideo}
          type="video/mp4"
          loop
          controls={false}
          muted
          autoPlay
          className="w-full h-full object-cover"
        />

        <div className="absolute flex flex-col justify-center items-center top-0 right-0 left-0 bottom-0    bg-blackOverlay">
          <div className="p-5">
            <img src={logo} width="130px" />
          </div>

          <div className="shadow-2xl">
            <OAuth />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
