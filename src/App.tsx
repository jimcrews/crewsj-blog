import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Post from './components/Post';
import Home from './components/Home';

function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<Post />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
