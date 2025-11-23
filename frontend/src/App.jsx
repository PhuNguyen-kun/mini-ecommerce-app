import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import './App.css'
import Landing from './pages/Landing/Landing'
import Search from './pages/Search/Search'
import About from './pages/About/About'
import Stores from './pages/Stores/Stores'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="w-full">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />
            <Route path="/stores" element={<Stores />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
