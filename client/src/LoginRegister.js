import React, { useState } from "react";
import "./Auth.css"; // <-- Add this import

const LoginRegister = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = () => {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (isLogin) {
      if (users[username] === password) {
        onLogin(username);
      } else {
        alert("Invalid credentials");
      }
    } else {
      if (users[username]) {
        alert("Username already exists");
      } else {
        users[username] = password;
        localStorage.setItem("users", JSON.stringify(users));
        alert("Registration successful");
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleAuth}>{isLogin ? "Login" : "Register"}</button>
        <div className="auth-toggle">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => setIsLogin(false)}>Register</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
