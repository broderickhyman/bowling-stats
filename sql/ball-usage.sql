SELECT
b.pk
, b.name as 'Ball'
, count(*) / 10 as 'Games'
, ROUND(avg(f.scores & 15), 2) as 'Average'
, STRFTIME('%m/%d/%Y', DATETIME(min(w.date), 'unixepoch')) as 'Date'
-- , min(w.date)
from ball b
inner join frame f on f.ballFk = b.pk
inner join week w on w.pk = f.weekFk

where b.flags is null
and f.flags & 1
and f.leagueFk > 0
and w.date > 1742248478

group by
b.pk
, b.name

having
count(*) > 50

order by
-- b.pk
avg(f.scores & 15) desc