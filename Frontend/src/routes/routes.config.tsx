import { ReactNode } from 'react';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Events from '../pages/Events';
import MyTickets from '../pages/MyTickets';
import CreateEvent from '../pages/CreateEvent';
import NotFound from '../pages/NotFound';

export interface AppRoute {
  path: string;
  element: ReactNode;
  label: string;
  isProtected?: boolean;
  adminOnly?: boolean;
  showInNav?: boolean;
  guestOnlyNav?: boolean;
}

export const appRoutes: AppRoute[] = [
  {
    path: '/',
    element: <Events />,
    label: 'Events',
    showInNav: true,
  },
  {
    path: '/my-tickets',
    element: <MyTickets />,
    label: 'My Tickets',
    isProtected: true,
    showInNav: true,
  },
  {
    path: '/admin/create-event',
    element: <CreateEvent />,
    label: 'Create Event',
    isProtected: true,
    adminOnly: true,
    showInNav: true,
  },
  {
    path: '/login',
    element: <Login />,
    label: 'Login',
    showInNav: true,
    guestOnlyNav: true,
  },
  {
    path: '/register',
    element: <Register />,
    label: 'Register',
    showInNav: true,
    guestOnlyNav: true,
  },
  {
    path: '*',
    element: <NotFound />,
    label: 'Not Found',
  },
];
