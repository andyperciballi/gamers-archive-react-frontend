import { useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/NavBar/NavBar';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import GameEdit from './pages/GameEdit';
import SearchGames from './pages/SearchGames';
import GameDetails from './pages/GameDetails';
import { UserContext } from './contexts/UserContext';
import { ToastContainer, toast } from 'react-toastify';

function App() {
  const makeToastMessage = (text) => toast(text);
  const { user } = useContext(UserContext);

  return (
    <>
      <Navbar />

      <Routes>
  {/* Always public */}
  <Route path="/" element={<HomePage />} />

  <Route
    path="/sign-up"
    element={<SignUpForm makeToastMessage={makeToastMessage} />}
  />
  <Route path="/sign-in" element={<SignInForm />} />

  {/* Protected pages */}
  <Route
    path="/dashboard"
    element={user ? <Dashboard /> : <Navigate to="/sign-in" />}
  />
  <Route
    path="/library"
    element={user ? <Library /> : <Navigate to="/sign-in" />}
  />
  <Route
    path="/search"
    element={user ? <SearchGames /> : <Navigate to="/sign-in" />}
  />
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
        height: '50vh',
        width: '50vw',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'item',
        color: 'black',
      }}
    >
      {children}
    </div>
  );
}
