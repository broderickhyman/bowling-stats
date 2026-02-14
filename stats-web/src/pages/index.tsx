import { useLoaderData } from "react-router";
import type { ClientLoaderFunctionArgs } from "react-router";
import { appDB } from "@/services/db";
import WelcomePage from "./welcome";
import DashboardPage from "./dashboard";

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  try {
    const file = await appDB.databaseFiles.get({ title: 'main' });
    return { hasData: !!file };
  } catch (error) {
    console.error('Error checking for existing data:', error);
    return { hasData: false };
  }
}

export function IndexPage() {
  const { hasData } = useLoaderData<typeof clientLoader>();
  return hasData ? <DashboardPage /> : <WelcomePage />;
}

export default IndexPage;
