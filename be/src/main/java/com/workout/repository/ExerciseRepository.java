package com.workout.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.workout.entity.Exercise;
import com.workout.projection.WorkoutFullProjection;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("DELETE FROM Exercise e WHERE e.workout.id = :workoutId")
	void deleteByWorkoutId(@Param("workoutId") UUID workoutId);

	@Query(value = """
		SELECT w.id as id, w.date as date,
			w.exerciseTime as exerciseTime,
		    w.calories as calories, w.puls as puls,
		    w.maxPuls as maxPuls, w.intensive as intensive,
		    w.aerobish as aerobish, anaerobish as anaerobish,
			w.trainingLoad as trainingLoad, w.rounds as rounds,
			w.comment as comment, e.weight as weight,
			e.order as order, n.value as name
		FROM Exercise e
		LEFT JOIN e.workout w
		LEFT JOIN e.name n
		ORDER BY w.date DESC, e.order ASC
	""")
	List<WorkoutFullProjection> getAllWorkouts();
	
	
	@Query(value = """
		SELECT w.id as id, w.date as date,
			w.exercise_time as exerciseTime,
		    w.calories as calories, w.puls as puls,
		    w.puls_max as maxPuls, w.intensive as intensive,
		    w.aero as aerobish, anaero as anaerobish,
			w.tl as trainingLoad, w.rounds as rounds,
			w.comment as comment, e.weight as weight,
			e.ex_order as order, n.value as name,
			CASE
				WHEN f.id IS NOT NULL THEN true
				ELSE false
			END AS favorite
		FROM exercise e
		LEFT JOIN workout w on e.workout_id = w.id
		LEFT JOIN exercise_name n on e.name = n.id
		LEFT JOIN favorite f on f.workout = w.id
		WHERE w.date <= :endDate
			AND w.date >= :startDate
		ORDER BY w.date DESC, e.ex_order ASC
	""", nativeQuery = true)
	List<WorkoutFullProjection> findWorkoutsForPeriod(LocalDate startDate, LocalDate endDate);
	
	@Query(value = """
		SELECT w.id as id, w.date as date,
			w.exercise_time as exerciseTime,
		    w.calories as calories, w.puls as puls,
		    w.puls_max as maxPuls, w.intensive as intensive,
		    w.aero as aerobish, anaero as anaerobish,
			w.tl as trainingLoad, w.rounds as rounds,
			w.comment as comment, e.weight as weight,
			e.ex_order as order, n.value as name,
			true as favorite
		FROM exercise e
		LEFT JOIN workout w on e.workout_id = w.id
		LEFT JOIN exercise_name n on e.name = n.id
		RIGHT JOIN favorite f on f.workout = w.id
		ORDER BY f.fav_order desc
	""", nativeQuery = true)
	List<WorkoutFullProjection> findFavoriteWorkouts();

	@Query(value = """
		SELECT w.id as id, w.date as date,
			w.exercise_time as exerciseTime,
		    w.calories as calories, w.puls as puls,
		    w.puls_max as maxPuls, w.intensive as intensive,
		    w.aero as aerobish, anaero as anaerobish,
			w.tl as trainingLoad, w.rounds as rounds,
			w.comment as comment, e.weight as weight,
			e.ex_order as order, n.value as name
		FROM exercise e
		LEFT JOIN workout w on e.workout_id = w.id
		LEFT JOIN exercise_name n on e.name = n.id
		RIGHT JOIN flagged f on (CAST(f.day AS DATE) + INTERVAL '1 day') = w.date
		ORDER BY w.date
	""", nativeQuery = true)
	List<WorkoutFullProjection> findFlaggedWorkouts();
	
	@Query(value = """
		SELECT w.id as id, w.date as date,
			w.exercise_time as exerciseTime,
		    w.calories as calories, w.puls as puls,
		    w.puls_max as maxPuls, w.intensive as intensive,
		    w.aero as aerobish, anaero as anaerobish,
			w.tl as trainingLoad, w.rounds as rounds,
			w.comment as comment, e.weight as weight,
			e.ex_order as order, n.value as name
		FROM exercise e
		LEFT JOIN workout w on e.workout_id = w.id
		LEFT JOIN exercise_name n on e.name = n.id
		WHERE w.date = :workoutDate
		""", nativeQuery = true)
	List<WorkoutFullProjection> findWorkout(LocalDate workoutDate);


    @Query(value = """
		SELECT w.id as id, w.date as date,
			w.exercise_time as exerciseTime,
		    w.calories as calories, w.puls as puls,
		    w.puls_max as maxPuls, w.intensive as intensive,
		    w.aero as aerobish, anaero as anaerobish,
			w.tl as trainingLoad, w.rounds as rounds,
			w.comment as comment, e.weight as weight,
			e.ex_order as order, n.value as name,
			CASE
				WHEN f.id IS NOT NULL THEN true
				ELSE false
			END AS favorite
		FROM exercise e
		LEFT JOIN workout w on e.workout_id = w.id
		LEFT JOIN exercise_name n on e.name = n.id
		LEFT JOIN favorite f on f.workout = w.id
		WHERE e.workout_id in (:workoutIds)
		""", nativeQuery = true)
    List<WorkoutFullProjection> findWorkoutsByIds(List<UUID> workoutIds);
}
