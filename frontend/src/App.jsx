import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import './App.css'
import Landing from './pages/Landing/Landing'
import Search from './pages/Search/Search'
import About from './pages/About/About'
import Stores from './pages/Stores/Stores'
import Blog from './pages/Blog/Blog'
import BlogPost from './pages/BlogPost/BlogPost'
import ProductListing from './pages/ProductListing/ProductListing'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog-post" element={<BlogPost />} />
            <Route path="/women" element={<ProductListing />} />
            <Route path="/men" element={<ProductListing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
