SELECT
l.name as 'League'
, DATETIME(w.date, 'unixepoch') as 'Date'
-- , weekBest.score as 'Max'
, best.score as 'Current Best'
FROM league l
inner join week w on w.leagueFk = l.pk
inner join (
	SELECT
	w2.pk
	, max(g2.score) as 'score'
	from week w2
	inner join game g2 on g2.weekFk = w2.pk
	where w2.leagueFk > 0
	group by
	w2.pk
) weekBest on weekBest.pk = w.pk
inner join (
	SELECT
	w2.pk
	, max(g2.score) as 'score'
	from week w2
	inner join week w3 on w3.date <= w2.date
	inner join game g2 on g2.weekFk = w3.pk
	where w2.leagueFk > 0
	and w3.leagueFk > 0
	group by
	w2.pk
) best on best.pk = w.pk

where weekBest.score = best.score

ORDER BY
w.date
;