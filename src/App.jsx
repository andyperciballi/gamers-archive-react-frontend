import { useState, useContext } from "react";
import "./App.css";
import Navbar from "./components/NavBar/NavBar";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import { Routes, Route } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import SignInForm from "./components/SignInForm/SignInForm";
import HomePage from "./components/HomePage/HomePage";
import Dashboard from "./components/Dashboard/Dashboard";
import { UserContext } from "./contexts/UserContext";
import Library from "./components/Library/Library";

function App() {
  const makeToastMessage = (text) => toast(text);
  const { user } = useContext(UserContext);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <HomePage />} />
        <Route
          path="/sign-up"
          element={<SignUpForm makeToastMessage={makeToastMessage} />}
        />
        <Route path="/sign-in" element={<SignInForm />} />

        <Route path="/library" element={user ? <Library /> : <HomePage />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;


function Container({ children }) {
  return (
    <div
      style={{
        height: "50vh",
        width: "50vw",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "item",
        color: "black",
      }}
    >
      {children}
    </div>
  );
}
