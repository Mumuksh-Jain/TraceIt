import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const { isLoggedIn, logOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link className="navbar-brand" to="/">
          <span className="brand-icon">🔍</span>
          Trace<span className="brand-accent">It</span>
        </Link>

        <div className="navbar-links">
          {isLoggedIn ? (
            <>
              <Link className="nav-link" to="/report-lost">Report Lost</Link>
              <Link className="nav-link" to="/report-found">Report Found</Link>
              <Link className="nav-link" to="/my-items">My Items</Link>
              <Link className="nav-link" to="/about">About</Link>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/about">About</Link>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="btn-logout" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar