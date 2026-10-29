import { Link, Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Header from "./components/Header.jsx";
export default function App() {
  return (
    <>
      <main className="container">
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}
