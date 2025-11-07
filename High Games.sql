SELECT
l.name as 'League'
, STRFTIME('%m/%d/%Y', DATETIME(w.date, 'unixepoch')) as 'Date'
, g.score as 'Score'
FROM league l
inner join week w on w.leagueFk = l.pk
inner join game g on g.weekFk = w.pk


ORDER BY
-- w.date DESC
g.score desc
;