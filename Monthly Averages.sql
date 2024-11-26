SELECT
STRFTIME('%Y-%m', DATETIME(w.date, 'unixepoch')) as _date
, CAST(AVG(averageScore._avg) as int) as averageScore
, ROUND(AVG(CAST(strikes._cnt as float) / allFrames._cnt), 2) as percentStrikes
, ROUND(AVG(CAST(opens._cnt as float) / regularFrames._cnt), 2) as percentOpens
-- , SUM(opens._cnt)
from league l
inner join week w on w.leagueFk = l.pk

inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
-- 	where f.scores & 170 = 170
	where f.scores & 15 = 10
	group by g.weekFk
) as strikes on strikes.weekFk = w.pk
inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.flags & 1 = 1
	and f.scores & 160 <> 160
	and f.frameNum < 10
	group by g.weekFk
) as opens on opens.weekFk = w.pk
inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.flags & 1 = 1
	group by g.weekFk
) as allFrames on allFrames.weekFk = w.pk
inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.flags & 1 = 1
	and f.frameNum < 10
	group by g.weekFk
) as regularFrames on regularFrames.weekFk = w.pk
inner join (
	SELECT
	g.weekFk
	, avg(g.score) as _avg
	from game g
	group by g.weekFk
) as averageScore on averageScore.weekFk = w.pk

where 1=1
and DATETIME(w.date, 'unixepoch') > '2021-01-01'

group by
STRFTIME('%Y-%m', DATETIME(w.date, 'unixepoch'))

order by w.date desc