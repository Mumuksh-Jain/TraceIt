import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ReportLost from './pages/ReportLost'
import ReportFound from './pages/ReportFound'
import ItemDetail from './pages/ItemDetail'
import MyItems from './pages/MyItems'
import About from './pages/About'

function AnimatedRoutes() {
  const location = useLocation()
  const { loading } = useAuth()

  if (loading) {
    return <div className="loading-container">Loading...</div>
  }

  return (
    <Routes location={location} key={location.pathname}>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/report-lost' element={<ReportLost/>}/>
      <Route path='/report-found' element={<ReportFound/>}/>
      <Route path='/item/:id' element={<ItemDetail/>}/>
      <Route path='/my-items' element={<MyItems/>}/>
      <Route path='/about' element={<About/>}/>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatedRoutes />
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App