import { useState } from "react";

export default function Auth(props) {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  function handleOnchange(event) {
    const { name, value } = event.target;
    setUser((prevValue) => {
      return {
        ...prevValue,
        [name]: value,
      };
    });
  }

  function handleLogin() {
    props.onLogin(user);
  }
  function handleRegister() {
    props.onRegister(user);
  }
  function handleGoogle() {
    props.onGoogle();
  }

  return (
    <form action="post" className="login">
      <div>
        <label htmlFor="user-password">Email</label>
        <input
          type="email"
          id="user-email"
          name="email"
          placeholder="Enter your email"
          value={user.email}
          required
          onChange={handleOnchange}
        />
      </div>
      <div>
        <label htmlFor="user-password">Password</label>
        <input
          type="password"
          id="user-password"
          name="password"
          placeholder="Enter your password"
          value={user.password}
          onChange={handleOnchange}
          required
        />
      </div>
      <button type="button" onClick={handleLogin}>
        Login
      </button>
      <button type="button" onClick={handleRegister}>
        Register
      </button>
      <button type="button" onClick={handleGoogle}>
        Login With Google
      </button>
    </form>
  );
}
