-- Legacy flagged rows were stored one calendar day before the workout date
-- (GET /api/flagged used day + 1 = workout.date). Align flagged.day with workout.date.
UPDATE flagged f
SET day = to_char((CAST(f.day AS DATE) + INTERVAL '1 day')::date, 'YYYY-MM-DD')
WHERE EXISTS (
  SELECT 1
  FROM workout w
  WHERE CAST(w.date AS DATE) = (CAST(f.day AS DATE) + INTERVAL '1 day')
)
AND NOT EXISTS (
  SELECT 1
  FROM workout w
  WHERE CAST(w.date AS DATE) = CAST(f.day AS DATE)
);
