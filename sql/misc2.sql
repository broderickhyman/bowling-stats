SELECT
l.name
, DATETIME(w.date, 'unixepoch') as 'Date'
, g.pk
, g.score
, g.singlePinSpareScore

-- , w.*
-- , g.*
, case when g.flags & 1 then 1 else 0 end as [flags1]
, case when g.flags & 2 then 1 else 0 end as [flags2]
, case when g.flags & 4 then 1 else 0 end as [flags3] -- Clean game
, case when g.flags & 8 then 1 else 0 end as [flags4]
, case when g.flags & 16 then 1 else 0 end as [flags5]
, case when g.flags & 32 then 1 else 0 end as [flags6]
, case when g.flags & 64 then 1 else 0 end as [flags7]
, case when g.flags & 128 then 1 else 0 end as [flags8]
-- , g.flags

from league l
inner join week w on w.leagueFk = l.pk
inner join game g on g.weekFk = w.pk

where 1=1
-- and DATETIME(w.date, 'unixepoch') > '2021-01-01'
and DATETIME(w.date, 'unixepoch') > '2025-09-01'

order by w.date desc
, g.pk
