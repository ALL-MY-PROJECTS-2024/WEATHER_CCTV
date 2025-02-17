import logo from "./logo.svg";

import "bootstrap/dist/css/bootstrap.css";


import Home from "./deploycomponent/Home";
import Login from "./deploycomponent/Login";
import Logout from "./deploycomponent/Logout";
import "./App.scss"


//ROUTE
// import {BrowserRouter   as Router, Routes, Route } from "react-router-dom";

import {HashRouter   as Router, Routes, Route } from "react-router-dom";

// 전역 설정
import { GlobalContextProvider } from "./contexts/GlobalContextProvider";

function App() {
  return (
    <GlobalContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </GlobalContextProvider>
  );
}

export default App;
