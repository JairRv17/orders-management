import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { ALLOWED_USERS, CUSTOMER_EMAIL, SUPERADMIN_EMAIL } from "~/utils/allowedUsers";
import { PATHS } from "~/utils/constants";
import Swal from "sweetalert2";

export function Welcome() {
  const navigate = useNavigate();

  const [login, setLogin] = React.useState({
    email: "",
    password: ""
  });

  const handleDashboard = () => {
    const isUserAllowed = ALLOWED_USERS.find(user => user.email === login.email && user.password === login.password);

    if (!isUserAllowed) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid credentials",
        confirmButtonColor: "#1f2937",
      });
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", isUserAllowed.email);
    localStorage.setItem("userId", isUserAllowed.id.toString());

    if (isUserAllowed.email === SUPERADMIN_EMAIL) {
      navigate(PATHS.ADD_ITEMS);
    } else if (isUserAllowed.email === CUSTOMER_EMAIL) {
      navigate(PATHS.CUSTOMER);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDashboard();
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userEmail = localStorage.getItem("userEmail");
    const existUser = ALLOWED_USERS.find(user => user.email === userEmail);
    if (isLoggedIn === "true" && existUser && existUser.email === SUPERADMIN_EMAIL) {
      navigate(PATHS.ADD_ITEMS);
    } else if (isLoggedIn === "true" && existUser && existUser.email === CUSTOMER_EMAIL) {
      navigate(PATHS.CUSTOMER);
    }
  }, [navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Demo</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleDashboard}
              className="cursor-pointer w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-gray-400 text-sm mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {ALLOWED_USERS.map((user, index) => (
                <div key={user.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-gray-400 mb-1">{user.email === SUPERADMIN_EMAIL ? "Admin" : "Customer"}</p>
                  <p className="text-white font-mono break-all">{user.email}</p>
                  <p className="text-gray-500 font-mono">{user.password}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Jair Roca Viteri
        </p>
      </div>
    </main>
  );
}
