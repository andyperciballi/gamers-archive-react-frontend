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
        <Route path="/" element={user ? <Dashboard /> : <HomePage />} />
        <Route
          path="/sign-up"
          element={<SignUpForm makeToastMessage={makeToastMessage} />}
        />
        <Route path="/sign-in" element={<SignInForm />} />
        <Route path="/library" element={user ? <Library /> : <HomePage />} />
        <Route
          path="/library/:userId"
          element={user ? <Library /> : <HomePage />}
        />
        <Route path="/search" element={user ? <SearchGames /> : <HomePage />} />
        <Route
          path="/games/details/:igdbId"
          element={user ? <GameDetails /> : <HomePage />}
        />
        <Route
          path="/games/:gameId/edit"
          element={user ? <GameEdit /> : <HomePage />}
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
