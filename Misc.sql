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
, f.pins & 2 as [2]
, f.pins & 4 as [3]
, f.pins & 8 as [4]
, f.pins & 16 as [5]
, f.pins & 32 as [6]
, f.pins & 64 as [7]
, f.pins & 128 as [8]
, f.pins & 256 as [9]
, f.pins & 512 as [10]
, f.flags & 1 as [flags1]
, f.flags & 2 as [flags2]
, f.flags & 4 as [flags3]
, f.flags & 8 as [flags4]
, f.flags & 16 as [flags5]
, f.flags & 32 as [flags6]
, f.flags & 64 as [flags7]
, f.flags & 128 as [flags8]
, f.scores & 1 as [scores1]
, f.scores & 2 as [scores2]
, f.scores & 4 as [scores3]
, f.scores & 8 as [scores4]
, f.scores & 16 as [scores5]
, f.scores & 32 as [scores6]
, f.scores & 64 as [scores7]
, f.scores & 128 as [scores8]
-- , f.*
from league l
inner join week w on w.leagueFk = l.pk
inner join game g on g.weekFk = w.pk
inner join frame f on f.gameFk = g.pk

where 1=1
and DATETIME(w.date, 'unixepoch') > '2021-01-01'
-- and l.name = 'Suburban 2024'
-- and w.pk = '222'

-- and pins = 0
-- and f.frameNum < g.frame
-- and f.scores <> 0

order by w.date desc
, g.pk
, f.frameNum

-- order by f.scores