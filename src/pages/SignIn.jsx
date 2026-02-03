import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assests/svg/2.png";
import OAuth from "../components/OAuth";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { HiShieldCheck, HiKey, HiOutlineLockClosed, HiOutlineBadgeCheck, HiOutlineCheckCircle, HiOutlineDeviceMobile } from "react-icons/hi";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: professional info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary-600 to-primary-800 p-10 xl:p-14 text-white">
        <div>
          <h2 className="text-xl xl:text-2xl font-semibold tracking-tight mb-2">Sign in</h2>
          <p className="text-white/90 text-sm max-w-sm leading-relaxed mb-6">
            Access your account to manage listings, saved properties, and messages.
          </p>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-4">Your account includes</p>
          <ul className="space-y-3 text-white/90 text-sm">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <HiOutlineBadgeCheck className="w-4 h-4 text-primary-200" />
              </span>
              Save listings and compare properties in one place
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <HiKey className="w-4 h-4 text-primary-200" />
              </span>
              Contact landlords and agents directly
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <HiOutlineLockClosed className="w-4 h-4 text-primary-200" />
              </span>
              Encrypted sign-in — your data stays private
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <HiOutlineDeviceMobile className="w-4 h-4 text-primary-200" />
              </span>
              Access from any device — desktop, tablet, or phone
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <HiShieldCheck className="w-4 h-4 text-primary-200" />
              </span>
              Trusted platform for rent and sale listings
            </li>
          </ul>
          <div className="mt-8 pt-6 border-t border-white/15">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-3">Trust & security</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/85 text-xs">
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-primary-200 shrink-0" />
                Secure login
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-primary-200 shrink-0" />
                Private data
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="w-4 h-4 text-primary-200 shrink-0" />
                No spam
              </span>
            </div>
          </div>
        </div>
        <p className="text-white/50 text-xs pt-6 border-t border-white/10 shrink-0">House Market — Real estate marketplace</p>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="Logo" className="h-10 mx-auto opacity-95" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={onChange}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={onChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <AiFillEyeInvisible className="w-5 h-5" /> : <AiFillEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-600" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">or continue with</span>
                </div>
              </div>
              <OAuth />
            </form>
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link to="/sign-up" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
