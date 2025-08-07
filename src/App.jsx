import './App.css';
import Chatarea from './pages/Chatarea';
import Header from './pages/Header';
import { BrowserRouter as Router, Routes, Route, Navigate,useNavigate, replace } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { useEffect } from 'react';

function ProtectedRoute({children}){
  let token=localStorage.getItem('userData')
  if(!token){
   return <Navigate to="/login" replace/>
  }
  else{
    return children
  }
}
function OpenRoute({children}){
  let token =localStorage.getItem("userData");
  console.log("this one executed",typeof token)
  let userData=JSON.parse(token);
  if(userData?.token){
    console.log("this one executed")
    return <Navigate to="/home" replace/>
  }
  else{
    return children
  }
}

function App() {

  return (
    <Router>
      {/* <Header/> */}
      <Routes>
        {/* Public routes - only accessible when not logged in */}
        <Route path="/login" element={<OpenRoute><Login /></OpenRoute> }/>

        <Route path="/signup" element={<OpenRoute><Signup /></OpenRoute>}/>

        {/* Protected route - only accessible when logged in */}
        <Route path="/home" element= {<ProtectedRoute><Chatarea/></ProtectedRoute>}/>

        {/* Default route - redirect based on auth status */}
        {/* <Route path="/" element={localStorage.getItem('userData')? <Navigate to="/home" replace />: <Navigate to="/login" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;