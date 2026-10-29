import { useNavigate } from "react-router";
import Auth from "../components/Auth";
export default function Login() {
  const navigate = useNavigate();

  const handleLoginSubmit = async (userData) => {
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.email,
          password: userData.password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        navigate("/home");
      } else {
        alert("الإيميل أو الباسورد خطأ يا صاحبي!");
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const handleRegisterSubmit = async (userData) => {
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        navigate("/home");
      } else {
        alert("فشل التسجيل، الإيميل ربما مستخدم مسبقاً!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleGoogle = () => {
    // ده بيخلي المتصفح يفتح رابط السيرفر مباشرة، فالسيرفر يحوله لجوجل فوراً
    window.location.href = "/auth/google";
  };

  return (
    <Auth
      onLogin={handleLoginSubmit}
      onRegister={handleRegisterSubmit}
      onGoogle={handleGoogle}
    />
  );
}
