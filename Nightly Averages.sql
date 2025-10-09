SELECT
l.name
, STRFTIME('%m/%d/%Y', DATETIME(w.date, 'unixepoch')) as 'Date'
, ROUND(averageScore._avg, 2) as averageScore
, ROUND(CAST(strikes._cnt as float) / allFrames._cnt, 2) as percentStrikes
, ROUND(CAST(pickedUpSpares._cnt as float) / potentialSpares._cnt, 2) as pickedUpSpares
, ROUND(CAST(pickedUpsinglePinSpares._cnt as float) / singlePinSpares._cnt, 2) as pickedUpSinglePins
-- , potentialSpares._cnt
-- , pickedUpSpares._cnt
from league l
inner join week w on w.leagueFk = l.pk
inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.pins = 0
	group by g.weekFk
) as strikes on strikes.weekFk = w.pk
inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores <> 0
	group by g.weekFk
) as allFrames on allFrames.weekFk = w.pk
inner join (
	SELECT
	g.weekFk
	, avg(g.score) as _avg
	from game g
	group by g.weekFk
) as averageScore on averageScore.weekFk = w.pk
inner join (
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
inner join (
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
inner join (
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
inner join (
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

where 1=1
and DATETIME(w.date, 'unixepoch') > '2021-01-01'


order by w.date desc