# workout-be-node

Node.js/Express backend for the workout app. Uses PostgreSQL with Flyway-compatible SQL migrations.
---

## API

Base path for workout routes: `/api`

### `GET /health`

Health check with database connectivity.

**Response `200`**

```json
{ "status": "ok" }
```

**Response `503`** (database unreachable)

```json
{ "status": "error", "database": "unavailable" }
```

---

### `POST /api/workouts`

Returns workouts for a given time period.

**Request body**

```json
{
  "timePeriod": "MONTH",
  "startOfPeriod": "Sep 2025"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timePeriod` | `"WEEK"` \| `"MONTH"` \| `"YEAR"` \| `"ALL"` | No | Defaults to `"MONTH"` |
| `startOfPeriod` | `string` \| `number` | Depends on period | Period anchor (see formats below) |

**`startOfPeriod` formats**

| `timePeriod` | Format | Example |
|--------------|--------|---------|
| `MONTH` | `MMM yyyy` (English month) | `"Sep 2025"` |
| `WEEK` | `dd.MM.yy - dd.MM.yy` | `"15.09.25 - 21.09.25"` |
| `YEAR` | year number or string | `2025` |
| `ALL` | ignored | — |

If `startOfPeriod` is omitted for `MONTH`, the current month is used.

**Response `200`**

```json
{
  "content": [ /* workout items */ ],
  "statistics": {
    "calories": 12345,
    "exerciseTime": "12:30:00"
  },
  "totalElements": 42
}
```

- `statistics.exerciseTime` — total time as `HH:MM:00`
- `totalElements` — number of distinct workout days in the period

#### `MONTH` / `WEEK` — `content` items

```json
{
  "id": "uuid",
  "date": "2025-09-15",
  "time": 60,
  "calories": 500,
  "puls": 140,
  "maxPuls": 165,
  "intensive": "medium",
  "aero": "yes",
  "anaero": "no",
  "trainingLoad": 120,
  "rounds": "24кг, 01:00/вправа, 1. 10р - 4к",
  "comment": "felt good",
  "favorite": false,
  "xaxisLabel": "15.09",
  "exercises": [
    { "exercise": "swing", "weight": 24, "order": 0 }
  ]
}
```

#### `YEAR` — `content` items (monthly aggregates)

```json
{
  "date": "2025-09-15",
  "calories": 5000,
  "time": 1200,
  "trainings": 12,
  "trainingLoad": 1440,
  "xaxisLabel": "09"
}
```

**Response `400`** (invalid period format)

```json
{ "error": "Invalid month format: ..." }
```

**Example**

```bash
curl -X POST http://localhost:8081/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"timePeriod":"MONTH","startOfPeriod":"Sep 2025"}'
```

---

### `POST /api/calendar_events`

Returns workout summary events for a date range (used by the calendar view).

**Request body**

```json
{
  "startDate": "2025-09-01",
  "endDate": "2025-09-30"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | `string` | Yes | Range start (`yyyy-MM-dd`) |
| `endDate` | `string` | Yes | Range end (`yyyy-MM-dd`) |

**Response `200`**

```json
[
  {
    "id": "uuid",
    "date": "2025-09-15",
    "trainingLoad": 120,
    "calories": 500
  }
]
```

**Response `400`** (missing dates)

```json
{ "error": "startDate and endDate are required" }
```

**Example**

```bash
curl -X POST http://localhost:8081/api/calendar_events \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2025-09-01","endDate":"2025-09-30"}'
```

---

### `GET /api/current_period`

Returns dashboard data for the current and previous ISO weeks (Monday–Sunday), plus month-to-date calories.

**Response `200`**

```json
{
  "currentWeek": [
    {
      "id": "uuid",
      "date": "2025-09-15",
      "trainingLoad": 120,
      "calories": 500
    }
  ],
  "prevWeek": [],
  "statistics": {
    "calories": 2500,
    "exerciseTime": "05:30:00"
  },
  "monthCalories": 12000
}
```

- `currentWeek` — Monday of the current week through today
- `prevWeek` — full previous Monday–Sunday week
- `statistics` — totals for `currentWeek` only
- `monthCalories` — sum of calories in the current calendar month

**Example**

```bash
curl http://localhost:8081/api/current_period
```

---

### `GET /api/first_workout_date`

Returns the date of the earliest workout in the database. If there are no workouts, returns `2000-01-01`.

**Response `200`**

```json
{ "firstDate": "2020-01-15" }
```

**Example**

```bash
curl http://localhost:8081/api/first_workout_date
```

---

### `POST /api/import/csv`

Imports workouts from a ZIP file containing `workouts.csv` (same format as export).

**Request:** `multipart/form-data` with field `file` (`.zip`)

**Response `200`** (plain text)

```
Imported 42 workouts from ZIP
```

Skips workouts whose date already exists in the database.

**Example**

```bash
curl -X POST http://localhost:8081/api/import/csv \
  -F "file=@workouts.zip"
```

---

### `POST /api/favorites`

Toggles a workout as favorite (add if missing, remove if already favorited).

**Request body**

```json
{ "workout": "uuid" }
```

**Response `202`** — empty body

---

### `GET /api/favorites`

Returns all favorite workouts as `SingleWorkoutModel[]`, ordered by most recently favorited first.

**Response `200`**

```json
[
  {
    "id": "uuid",
    "date": "2025-09-15",
    "favorite": true,
    "exercises": []
  }
]
```

---

### `POST /api/add_flagged`

Toggles a flagged calendar day, or returns all flagged days when no date is sent.

**Request body**

- Empty / omitted — return all flagged days (no toggle)
- Date string — toggle flag for that day (`yyyy-MM-dd`)

The frontend sends the date as a plain string body (not a JSON object), matching the Java backend.

**Response `200`**

```json
["2025-09-10", "2025-09-15"]
```

Sorted list of all flagged days after the operation.

**Example — list all flagged days**

```bash
curl -X POST http://localhost:8081/api/add_flagged \
  -H "Content-Type: application/json"
```

**Example — toggle a day**

```bash
curl -X POST http://localhost:8081/api/add_flagged \
  -H "Content-Type: application/json" \
  -d "2025-09-15"
```
