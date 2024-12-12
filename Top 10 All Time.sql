SELECT
l.name as 'League'
, DATETIME(w.date, 'unixepoch') as 'Date'
, weekBest.score as 'Max'
-- , best.score as 'Current Best'
, (count(best.date) + 1) * -1
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
left join (
	SELECT
	w2.date
	, max(g2.score) as 'score'
	from week w2
	inner join game g2 on g2.weekFk = w2.pk
	where w2.leagueFk > 0
	group by
	w2.date
) best on best.date <= w.date and best.score > weekBest.score

-- where weekBest.score = best.score

group by
l.name
, w.date
, weekBest.score

having
count(best.date) + 1 <= 10

ORDER BY
w.date
;

-- SELECT
-- l.name as 'League'
-- , DATETIME(w.date, 'unixepoch') as 'Date'
-- , weekBest.score as 'Max'
-- , count(*) 
-- FROM league l
-- inner join week w on w.leagueFk = l.pk
-- inner join (
-- 	SELECT
-- 	w2.pk
-- 	, sum(g2.score) as 'score'
-- 	from week w2
-- 	inner join game g2 on g2.weekFk = w2.pk
-- 	where w2.leagueFk > 0
-- 	group by
-- 	w2.pk
-- ) weekBest on weekBest.pk = w.pk
-- left join (
-- 	SELECT
-- 	w2.pk
-- 	, DATETIME(w2.date, 'unixepoch')
-- 	, series.score as 'score'
-- 	from week w2
-- 	inner join week w3 on w3.date < w2.date
-- 	inner join (
-- 		select
-- 		w3.pk
-- 		, sum(g2.score) as 'score'
-- 		from week w3
-- 		inner join game g2 on g2.weekFk = w3.pk
-- 		group by
-- 		w3.pk
-- 	) series on series.pk = w3.pk
-- 	where w2.leagueFk > 0
-- 	and w3.leagueFk > 0
-- -- 	group by
-- -- 	w2.pk
-- ) bestPlace on bestPlace.pk = w.pk and bestPlace.score > weekBest.score
-- 
-- -- where weekBest.score = best.score
-- 
-- group by
-- l.name
-- , w.date
-- , weekBest.score
-- 
-- ORDER BY
-- w.date
-- ;


-- SELECT
-- l.name as 'League'
-- , DATETIME(w.date, 'unixepoch') as 'Date'
-- , weekBest.score as 'Max'
-- , count(*) 
-- FROM league l
-- inner join week w on w.leagueFk = l.pk
-- inner join (
-- 	SELECT
-- 	w2.pk
-- 	, sum(g2.score) as 'score'
-- 	from week w2
-- 	inner join game g2 on g2.weekFk = w2.pk
-- 	where w2.leagueFk > 0
-- 	group by
-- 	w2.pk
-- ) weekBest on weekBest.pk = w.pk
-- left join (
-- 	SELECT
-- 	w2.pk
-- 	, DATETIME(w2.date, 'unixepoch')
-- 	, series.score as 'score'
-- 	from week w2
-- 	inner join week w3 on w3.date < w2.date
-- 	inner join (
-- 		select
-- 		w3.pk
-- 		, sum(g2.score) as 'score'
-- 		from week w3
-- 		inner join game g2 on g2.weekFk = w3.pk
-- 		group by
-- 		w3.pk
-- 	) series on series.pk = w3.pk
-- 	where w2.leagueFk > 0
-- 	and w3.leagueFk > 0
-- -- 	group by
-- -- 	w2.pk
-- ) bestPlace on bestPlace.pk = w.pk and bestPlace.score > weekBest.score
-- 
-- -- where weekBest.score = best.score
-- 
-- group by
-- l.name
-- , w.date
-- , weekBest.score
-- 
-- ORDER BY
-- w.date
-- ;