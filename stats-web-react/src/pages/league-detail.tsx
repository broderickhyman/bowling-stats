import { useParams } from "react-router"

export function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">League Detail</h1>
      <p className="text-muted-foreground mt-2">League ID: {id}</p>
    </div>
  )
}

export default LeagueDetailPage
