SELECT
l.name
, DATETIME(w.date, 'unixepoch') as _date
, CAST(averageScore._avg as int) as averageScore
, CAST(CAST(strikes._cnt as float) / allFrames._cnt * 100 as int) as percentStrikes
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

where 1=1
and DATETIME(w.date, 'unixepoch') > '2021-01-01'


order by w.date desc