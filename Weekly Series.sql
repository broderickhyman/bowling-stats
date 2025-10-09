SELECT
l.name as 'League'
, STRFTIME('%m/%d/%Y', DATETIME(w.date, 'unixepoch')) as 'Date'
, sum(g.score) as 'Series'
FROM league l
inner join week w on w.leagueFk = l.pk
inner join game g on g.weekFk = w.pk

where w.leagueFk > 0

group by
l.name
, w.pk

having count(g.score) = 3

order by w.date desc
;