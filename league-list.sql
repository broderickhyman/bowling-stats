SELECT
l.pk
, l.name
, l.flags
, ROUND(avg(g.score), 2) as 'average'
, count(g.score) as 'count'
, min(w.date) as 'start'
, max(w.date) as 'end'
from league l
inner join game g on g.leagueFk = l.pk
inner join week w on w.pk = g.weekFk

group by
l.pk
, l.name
, l.flags

order by
max(w.date) desc