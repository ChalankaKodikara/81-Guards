import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Cookies from "js-cookie";
import Login_Right from "../../../assets/login-logo.png";
import LoginImg from "../../../assets/LOGIN.jpg";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/v1/hris/user/userLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // Sending email as the username
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const {
          user_token,
          permissions,
          supervisorId,
          currency,
          symbol,
          user_type,
          ...userDetails
        } = data;

        // Save permissions as a comma-separated string in a cookie named "token"
        const permissionsString = permissions.join("-");
        Cookies.set("token", permissionsString);

        // Save user details in cookies
        Cookies.set("employee_no", userDetails.employee_no);
        Cookies.set("employee_fullname", userDetails.employee_fullname);
        Cookies.set(
          "employee_name_initial",
          userDetails.employee_name_initial || ""
        );
        Cookies.set(
          "employee_calling_name",
          userDetails.employee_calling_name || ""
        );
        Cookies.set("username", userDetails.username);
        Cookies.set("user_token", user_token);
        Cookies.set("supervisorId", supervisorId);
        Cookies.set("user_type", user_type); // Save user_type in cookies
        Cookies.set("currency", currency); // Save user_type in cookies
        Cookies.set("symbol", symbol); // Save user_type in cookies

        // Navigate to the emp-dashboard page
        navigate("/emp-dashboard");
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex gap-[10px] items-center overflow-y-hidden">
      <div className="w-1/2">
        <div className="ml-[15%]">
          <img src={Login_Right} alt="Logo" className="w-[350px] h-[350px]" />
        </div>

        <div className="ml-[20%]">
          <h2 className="text-[35px] font-semibold text-gray-800 mb-4">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div className="flex flex-col w-fit static">
              <label
                htmlFor="email"
                className="text-md font-semibold relative top-2 ml-[7px] px-[3px] bg-gray-100 rounded-[20px] w-fit"
              >
                Email
              </label>
              <input
                id="email"
                placeholder="Enter your email /ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Set email state
                className="border-black px-[10px] py-[11px] text-ml bg-white border-2 rounded-xl h-[56px] w-[512px] focus:outline-none placeholder:text-black/25"
              />
            </div>
            <div className="flex flex-col w-fit static">
              <label
                htmlFor="password"
                className="text-md font-semibold relative top-2 ml-[7px] px-[3px] bg-gray-100 rounded-[20px] w-fit z-50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-black px-[10px] py-[11px] text-ml bg-white border-2 rounded-xl h-[56px] w-[512px] focus:outline-none placeholder:text-black/25"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-[10px] focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-[#252C58] h-[20px] w-[20px]" />
                  ) : (
                    <FiEye className="text-[#252C58] h-[20px] w-[20px]" />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-[20px] text-red-500">
              {loginError && <p>{loginError}</p>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
            </div>
            <div className="mt-[80px]">
              <button
                type="submit"
                className="w-[512px] bg-[#001F3F] text-[25px] text-white font-bold py-2 focus:outline-none rounded-xl mt-10"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex justify-end w-1/2  h-screen overflow-y-hidden">
        <img
          src={LoginImg}
          alt="Login"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}

export default Login;
