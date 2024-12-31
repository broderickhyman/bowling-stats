SELECT
l.name as 'League'
, DATETIME(min(w.date), 'unixepoch') as 'Start Date'
, DATETIME(max(w.date), 'unixepoch') as 'End Date'
, ROUND(avg(g.score), 2) as 'Average'
, SUM(gutters._cnt) as 'Gutters'
, count(g.pk) as 'Games'
, ROUND(CAST(SUM(gutters._cnt) as float) / count(g.pk), 2) as 'Gutter Rate'
FROM league l
inner join week w on w.leagueFk = l.pk
inner join game g on g.weekFk = w.pk
left join (
	SELECT
	f.gameFk
	, count(*) as _cnt
	from frame f
	where f.flags & 1 -- Bowled frame
	and f.scores & 15 = 0 and f.frameNum < 11 -- Gutter
	group by f.gameFk
) as gutters on gutters.gameFk = g.pk


GROUP BY
l.name

ORDER BY
-- l.pk DESC
-- min(w.date) DESC
max(w.date) DESC