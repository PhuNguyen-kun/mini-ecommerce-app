import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import './App.css'
import Landing from './pages/Landing/Landing'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="w-full">
        <Landing />
      </main>
      <Footer />
    </div>
  )
}

export default App
