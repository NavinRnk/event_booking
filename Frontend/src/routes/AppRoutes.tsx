import { Routes, Route } from 'react-router-dom';
import { appRoutes } from './routes.config';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {appRoutes.map((route) => {
        const needsGuard = route.isProtected || route.adminOnly;

        const element = needsGuard ? (
          <ProtectedRoute adminOnly={route.adminOnly}>{route.element}</ProtectedRoute>
        ) : (
          route.element
        );

        return <Route key={route.path} path={route.path} element={element} />;
      })}
    </Routes>
  );
};

export default AppRoutes;
