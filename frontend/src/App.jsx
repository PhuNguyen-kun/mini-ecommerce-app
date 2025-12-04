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
import CategoryProducts from './pages/CategoryProducts/CategoryProducts'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Checkout from './pages/Checkout/Checkout'
import { CartProvider } from './context/CartContext'
import CartSidebar from './components/Cart/CartSidebar'

function App() {
  return (
    <CartProvider>
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
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/women" element={<ProductListing />} />
              <Route path="/men" element={<ProductListing />} />
              <Route path="/products" element={<CategoryProducts />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Footer />
          <CartSidebar />
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
