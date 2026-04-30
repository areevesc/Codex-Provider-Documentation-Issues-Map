import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { GraphHomePage } from '@/pages/GraphHomePage';
import { IssueLibraryPage } from '@/pages/IssueLibraryPage';
import { ProviderDetailPage } from '@/pages/ProviderDetailPage';
import { ProviderIssueDetailPage } from '@/pages/ProviderIssueDetailPage';
import { SettingsPage } from '@/pages/SettingsPage';

const basename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL;

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <GraphHomePage /> },
        { path: 'issues', element: <IssueLibraryPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'providers/:providerId', element: <ProviderDetailPage /> },
        {
          path: 'providers/:providerId/issues/:providerIssueId',
          element: <ProviderIssueDetailPage />,
        },
      ],
    },
  ],
  { basename },
);
