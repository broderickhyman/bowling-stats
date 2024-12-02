SELECT
l.name as 'League'
, DATETIME(min(w.date), 'unixepoch') as 'Start Date'
, DATETIME(max(w.date), 'unixepoch') as 'End Date'
, ROUND(avg(g.score), 2) as 'Average'
FROM league l
inner join week w on w.leagueFk = l.pk
inner join game g on g.weekFk = w.pk


GROUP BY
l.name

ORDER BY
-- l.pk DESC
-- min(w.date) DESC
max(w.date) DESC