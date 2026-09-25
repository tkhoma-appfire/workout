import { App as AntdApp, ConfigProvider } from 'antd';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import MonthPage, { loader as monthDataLoader } from './pages/MonthPage.tsx';
import WeekPage, { loader as weekDataLoader } from './pages/WeekPage.tsx';
import YearPage, { loader as yearDataLoader } from './pages/YearPage.tsx';
import Favorite, { loader as favoriteLoader } from './pages/Favorite.tsx';
import NewWorkoutPage from './pages/new_workout/NewWorkoutPage.tsx';
import { exercisesLoader } from './pages/new_workout/exercisesLoader.ts';
import SearchAndCompare, { loader as searchLoader } from './pages/SearchAndCompare.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/month" replace /> },
      {
        path: 'month',
        element: <MonthPage />,
        loader: monthDataLoader
      },
      {
        path: 'week',
        element: <WeekPage />,
        loader: weekDataLoader,
      },
      {
        path: 'year',
        element: <YearPage />,
        loader: yearDataLoader,
      },
      {
        path: 'favorite',
        element: <Favorite />,
        loader: favoriteLoader,
      },
      {
        path: 'add',
        element: <NewWorkoutPage />,
        loader: exercisesLoader,
      },
      {
        path: 'search',
        element: <SearchAndCompare />,
        loader: searchLoader,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>
);
