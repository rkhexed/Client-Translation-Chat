import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import socketIO from 'socket.io-client';

const socket = socketIO.connect('http://localhost:4000');

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home socket={socket} />}></Route>
          <Route path="/chat" element={<ChatPage socket={socket} />}></Route>
        </Routes>
    </Router>
  );
}

export default App;