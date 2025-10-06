import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input.jsx";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext.jsx";

const Login = ({setCurrentPage}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if(!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      });

      const { token } = response.data;

      if(token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      } else {
        setError("Login failed. No token returned.");
      }
    } catch (err) {
      if(err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  }

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Welcome Back!</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">
        Please enter your credentials to log in to your account.
      </p>
      <form className="w-full max-w-md flex flex-col gap-3" onSubmit={handleLogin}>
        <Input
          label="Email Address"
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={({target}) => setEmail(target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={({target}) => setPassword(target.value)}
        />
        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
        <button
          type="submit"
          className="btn-primary">
          LOGIN
        </button>
      </form>

      <p className="text-[13px] text-slate-800 mt-3">
        Don't have an account?{" "}
        <button
          className="text-primary font-medium cursor-pointer underline"
          onClick={() => setCurrentPage("signup")}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
