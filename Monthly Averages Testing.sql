SELECT

-- STRFTIME('%Y-%m-%d', DATETIME(w.date, 'unixepoch')) as _date
-- , CAST(averageScore._avg as int) as score
-- , CAST(CAST(strikes._cnt as float) / allFrames._cnt * 100 as int) as percentStrikes
-- , strikes._cnt as strikes
-- , allFrames._cnt as frames

sum(strikes._cnt) as strikes
, sum(opens._cnt) as opens
, sum(allFrames._cnt) as frames
-- 58 opens
-- 77 strikes
-- 230 frames
from league l
inner join week w on w.leagueFk = l.pk

inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores & 170 = 170
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
	, avg(g.score) as _avg
	from game g
	group by g.weekFk
) as averageScore on averageScore.weekFk = w.pk

where 1=1
and DATETIME(w.date, 'unixepoch') > '2021-01-01'

and DATETIME(w.date, 'unixepoch') > '2024-09-01'


order by w.date desc