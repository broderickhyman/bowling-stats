import { createBrowserRouter, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";

import { PinpalServiceProvider } from "@/contexts/pinpal-service-context";
import { ThemeProvider } from "@/lib/theme-provider";
import RootLayout from "@/components/layout";
import IndexPage, { clientLoader as indexLoader } from "@/pages/index";
import DashboardPage from "@/pages/dashboard";
import UploadPage from "@/pages/upload";
import LeaguesPage from "@/pages/leagues";
import LeagueDetailPage from "@/pages/league-detail";
import BallsPage from "@/pages/balls";
import MonthlyPage from "@/pages/monthly";
import WelcomePage from "./pages/welcome";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <IndexPage />,
        clientLoader: indexLoader,
      } as RouteObject,
      { path: "welcome", element: <WelcomePage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "upload", element: <UploadPage /> },
      { path: "leagues", element: <LeaguesPage /> },
      { path: "league/:id", element: <LeagueDetailPage /> },
      { path: "balls", element: <BallsPage /> },
      { path: "monthly", element: <MonthlyPage /> },
    ],
  },
]);

export function App() {
  return (
    <PinpalServiceProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </PinpalServiceProvider>
  );
}

export default App;
