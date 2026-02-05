import { createBrowserRouter } from "react-router"
import { RouterProvider } from "react-router/dom"

import RootLayout from "@/components/layout"
import HomePage from "@/pages/home"
import UploadPage from "@/pages/upload"
import LeaguesPage from "@/pages/leagues"
import LeagueDetailPage from "@/pages/league-detail"
import BallsPage from "@/pages/balls"
import MonthlyPage from "@/pages/monthly"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true,        element: <HomePage /> },
      { path: "upload",     element: <UploadPage /> },
      { path: "leagues",    element: <LeaguesPage /> },
      { path: "league/:id", element: <LeagueDetailPage /> },
      { path: "balls",      element: <BallsPage /> },
      { path: "monthly",    element: <MonthlyPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}

export default App