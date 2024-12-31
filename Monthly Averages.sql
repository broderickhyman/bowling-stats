SELECT
STRFTIME('%Y-%m', DATETIME(w.date, 'unixepoch')) as 'Date'
, CAST(AVG(averageScore._avg) as int) as averageScore
, ROUND(CAST(SUM(strikes._cnt) as float) / SUM(allFrames._cnt), 2) as percentStrikes
, ROUND(CAST(SUM(opens._cnt) as float) / SUM(allFrames._cnt), 2) as percentOpens
, ROUND(CAST(SUM(pickedUpSpares._cnt) as float) / SUM(potentialSpares._cnt), 2) as pickedUpSpares
, ROUND(CAST(SUM(pickedUpsinglePinSpares._cnt) as float) / SUM(singlePinSpares._cnt), 2) as pickedUpSinglePins
, SUM(gutters._cnt) as 'Gutters'
-- , SUM(strikes._cnt)
-- , SUM(allFrames._cnt)
-- , SUM(opens._cnt)
-- , SUM(pickedUpSpares._cnt)
-- , SUM(potentialSpares._cnt)
-- , SUM(pickedUpsinglePinSpares._cnt)
-- , SUM(singlePinSpares._cnt)
from league l
inner join week w on w.leagueFk = l.pk

left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores & 15 = 10
	group by g.weekFk
) as strikes on strikes.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.flags & 1 = 1  -- Bowled frame
	and f.scores >> 4 < 10 -- Not finished with all pins down
	and f.flags & 2 -- Whether 2 balls were thrown
	group by g.weekFk
) as opens on opens.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.flags & 1 = 1
	group by g.weekFk
) as allFrames on allFrames.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, avg(g.score) as _avg
	from game g
	group by g.weekFk
) as averageScore on averageScore.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores & 15 < 10
	and f.frameNum <= 10 -- Regular frames
	and f.flags & 1 -- Bowled frame
	and f.flags & 2 -- Whether 2 balls were thrown
	group by g.weekFk
) as potentialSpares on potentialSpares.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores & 15 < 10
	and f.flags & 1 -- Bowled frame
	and f.flags & 2 -- Whether 2 balls were thrown
	and f.scores >> 4 = 10 -- Finished with all pins down
	group by g.weekFk
) as pickedUpSpares on pickedUpSpares.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores & 15 = 9
	and f.flags & 1 -- Bowled frame
	and f.flags & 2 -- Whether 2 balls were thrown
	group by g.weekFk
) as singlePinSpares on singlePinSpares.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores & 15 = 9
	and f.flags & 1 -- Bowled frame
	and f.flags & 2 -- Whether 2 balls were thrown
	and f.scores >> 4 = 10 -- Finished with all pins down
	group by g.weekFk
) as pickedUpsinglePinSpares on pickedUpsinglePinSpares.weekFk = w.pk
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.flags & 1 -- Bowled frame
	and f.scores & 15 = 0 and f.frameNum < 11 -- Gutter
	group by g.weekFk
) as gutters on gutters.weekFk = w.pk

where 1=1
and DATETIME(w.date, 'unixepoch') > '2021-01-01'

group by
STRFTIME('%Y-%m', DATETIME(w.date, 'unixepoch'))

order by w.date desc