SELECT
l.name
, DATETIME(w.date, 'unixepoch') as _date
, g.pk

-- , w.*
-- , g.score
-- , g.*
-- , CAST(f.pins as BLOB)
, f.frameNum + 1 as [frame]
, f.pins & 1 as [1]
, case when f.pins & 2 then 1 else 0 end as [2]
, case when f.pins & 4 then 1 else 0 end as [3]
, case when f.pins & 8 then 1 else 0 end as [4]
, case when f.pins & 16 then 1 else 0 end as [5]
, case when f.pins & 32 then 1 else 0 end as [6]
, case when f.pins & 64 then 1 else 0 end as [7]
, case when f.pins & 128 then 1 else 0 end as [8]
, case when f.pins & 256 then 1 else 0 end as [9]
, case when f.pins & 512 then 1 else 0 end as [10]
, case when f.flags & 1 then 1 else 0 end as [flags1] -- Frame was bowled
, case when f.flags & 2 then 1 else 0 end as [flags2] -- Whether 2 balls were thrown (not strike)
, case when f.flags & 4 then 1 else 0 end as [flags3]
, case when f.flags & 8 then 1 else 0 end as [flags4]
, case when f.flags & 16 then 1 else 0 end as [flags5]
, case when f.flags & 32 then 1 else 0 end as [flags6]
, case when f.flags & 64 then 1 else 0 end as [flags7] -- Whether the pins were recorded (not score based)
, case when f.flags & 128 then 1 else 0 end as [flags8] -- Whether the manual record was a spare
-- , f.flags
, case when f.scores & 1 then 1 else 0 end as [scores1]
, case when f.scores & 2 then 1 else 0 end as [scores2]
, case when f.scores & 4 then 1 else 0 end as [scores3]
, case when f.scores & 8 then 1 else 0 end as [scores4]
, case when f.scores & 16 then 1 else 0 end as [scores5]
, case when f.scores & 32 then 1 else 0 end as [scores6]
, case when f.scores & 64 then 1 else 0 end as [scores7]
, case when f.scores & 128 then 1 else 0 end as [scores8]
-- , f.scores
, f.scores >> 4

from league l
inner join week w on w.leagueFk = l.pk
inner join game g on g.weekFk = w.pk
inner join frame f on f.gameFk = g.pk

where 1=1
-- and DATETIME(w.date, 'unixepoch') > '2021-01-01'
and DATETIME(w.date, 'unixepoch') > '2024-09-01'
-- and l.name = 'Suburban 2024'
-- and w.pk = '222'

-- and pins = 0
-- and f.frameNum < g.frame
-- and f.frameNum >= 10
-- and f.frameNum <= 10 -- Regular frames
-- and f.scores <> 0
-- and f.scores = 0
and f.flags & 1 -- Bowled frame
and f.flags & 2 -- Whether 2 balls were thrown

-- and f.scores & 15 = 10 -- Strike
-- and f.scores & 15 = 9 -- 9 pins
-- and f.scores >> 4 = 10 -- Finished with all pins down
-- and f.scores >> 4 < 10 -- Not finished with all pins down
and f.scores & 15 < 10 -- Potential spare

order by w.date desc
, g.pk
, f.frameNum

-- order by f.scores