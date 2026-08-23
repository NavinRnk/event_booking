import { Link, NavLink, useNavigate } from 'react-router-dom';
import { appRoutes } from '../../routes/routes.config';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleRoutes = appRoutes.filter((route) => {
    if (!route.showInNav) return false;
    if (route.adminOnly && !isAdmin) return false;
    if (route.isProtected && !isLoggedIn) return false;
    if (route.guestOnlyNav && isLoggedIn) return false;
    return true;
  });

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        Event &amp; Ticket System
      </Link>

      <div className="navbar__links">
        {visibleRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
            end={route.path === '/'}
          >
            {route.label}
          </NavLink>
        ))}

        {isLoggedIn && (
          <>
            <span className="navbar__user">
              {user?.user_name} ({user?.role})
            </span>
            <Button size="sm" variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
