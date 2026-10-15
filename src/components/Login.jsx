import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8081/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const text = await response.text();

      let data = text;

      try {
        data = JSON.parse(text);
      } catch {
        // Backend returned plain text
      }

      if (!response.ok) {
        setMessage(
          typeof data === "string"
            ? data
            : data.message || "Login failed"
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);

      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>DocAlert AI</h1>

        <p className="subtitle">
          Your Personal Document & Financial Reminder Assistant
        </p>

        <h2>Welcome Back</h2>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <p className="switch-auth">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;