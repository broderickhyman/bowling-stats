SELECT
l.name as 'Name'
, STRFTIME('%m/%d/%Y', DATETIME(w.date, 'unixepoch')) as 'Date'
, ROUND(averageScore._avg, 2) as 'Average Score'
, FORMAT('%2.0f%%', CAST(strikes._cnt as float) / allFrames._cnt * 100) as 'Strikes'
, FORMAT('%2.0f%%', CAST((strikes._cnt + IFNULL(pocketHitsNoStrike._cnt, 0)) as float) / allFrames._cnt * 100) as 'Pocket Hits'
, FORMAT('%2.0f%%', CAST(pickedUpSpares._cnt as float) / potentialSpares._cnt * 100) as 'Spares'
, FORMAT('%2.0f%%', CAST(pickedUpsinglePinSpares._cnt as float) / singlePinSpares._cnt * 100) as 'Single Pin Pickup'
, strikes._cnt as 'Strikes'
-- , allFrames._cnt as 'Frame Count'
-- , potentialSpares._cnt
-- , pickedUpSpares._cnt
, IFNULL(pocketHitsNoStrike._cnt, 0) as 'Pocket Hits No Strike'
-- , framesWithPins._cnt as 'Pin Frames'
from league l
inner join week w on w.leagueFk = l.pk
inner join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.scores & 15 = 10 -- Strike
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
-- inner join (
-- 	SELECT
-- 	g.weekFk
-- 	, count(*) as _cnt
-- 	from game g
-- 	inner join frame f on f.gameFk = g.pk
-- 	where f.flags & 64 = 64 -- Pins were recorded (not score based)
-- 	group by g.weekFk
-- ) as framesWithPins on framesWithPins.weekFk = w.pk
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
left join (
	SELECT
	g.weekFk
	, count(*) as _cnt
	from game g
	inner join frame f on f.gameFk = g.pk
	where f.pins >> 6 > 0 and f.pins & 0x3F = 0 -- Pocket hit without strike
	group by g.weekFk
) as pocketHitsNoStrike on pocketHitsNoStrike.weekFk = w.pk
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