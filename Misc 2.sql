SELECT
-- f.*
-- , f.scores & 15
-- , f.scores >> 4
-- sum(f.scores >> 4)
count(*)
, avg(f.scores & 15)
, avg(f.scores >> 4)
from frame f
where f.flags & 1 -- Bowled frame
and f.leagueFk = 22

