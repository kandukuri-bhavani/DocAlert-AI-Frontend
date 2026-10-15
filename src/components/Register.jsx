import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "https://docalert-ai-backend.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
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
            : data.message || "Registration failed"
        );
        return;
      }

      setMessage("Registration successful!");

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>DocAlert AI</h1>

        <p className="subtitle">
          Keep your important documents and payments organized
        </p>

        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            Register
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <p className="switch-auth">
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;
