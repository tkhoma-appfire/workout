package com.workout.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.workout.entity.Exercise;
import com.workout.entity.ExerciseName;
import com.workout.entity.Flagged;
import com.workout.entity.Workout;
import com.workout.exception.EntityExists;
import com.workout.mapper.SingleWorkoutMapper;
import com.workout.mapstruct.WorkoutMapstructMapper;
import com.workout.model.CalendarEventModel;
import com.workout.model.CurrentPeriodWorkouts;
import com.workout.model.DateRange;
import com.workout.model.ExerciseNameModel;
import com.workout.model.FavoriteWorkout;
import com.workout.model.SingleWorkoutModel;
import com.workout.model.WorkoutModel;
import com.workout.model.WorkoutsPeriod;
import com.workout.model.WorkoutsResponse;
import com.workout.projection.WorkoutCalendarEventProjection;
import com.workout.projection.WorkoutFullProjection;
import com.workout.repository.ExerciseNameRepository;
import com.workout.repository.ExerciseRepository;
import com.workout.repository.FavoriteRepository;
import com.workout.repository.FlaggedRepository;
import com.workout.repository.WorkoutRepository;
import com.workout.util.StatisticsUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutService {
	private final ExerciseRepository exerciseRepository;
	private final WorkoutMapstructMapper mapper;
	private final ExerciseNameRepository nameRepository;
	private final WorkoutRepository workoutRepository;
	private final WorkoutResponseBuilderService workoutResponseBuilderService;
	private final SingleWorkoutMapper singleWorkoutMapper;
	private final FavoriteRepository favoriteRepository;
	private final FlaggedRepository flaggedRepository;

	@Transactional
	public void addWorkout(SingleWorkoutModel payload) {
		var workout = mapper.toEntity(payload);

		var workoutDate = LocalDate.parse(payload.getDate());
		if (workoutRepository.existsByDate(workoutDate)) {
			throw new EntityExists("Workout already is present for: " + payload.getDate());
		}
		
		List<Exercise> exercises = payload.getExercises().stream()
			.map(exercise -> {
				var result = new Exercise();
				result.setName(nameRepository.upsertAndReturnId(exercise.name()));
				result.setWeight(exercise.weight());
				result.setWorkout(workout);
				result.setOrder(exercise.order());
				return result;
			})
			.toList();

		workoutRepository.save(workout);

		if (!exercises.isEmpty()) {
			exerciseRepository.saveAll(exercises);
		}
	}

	@Transactional
	public void editWorkout(SingleWorkoutModel payload) {
		if (payload.getId() == null) {
			throw new NoSuchElementException("Workout id is required");
		}

		Workout workout = workoutRepository.findById(payload.getId())
			.orElseThrow(() -> new NoSuchElementException("Can't find workout"));

		LocalDate workoutDate = LocalDate.parse(payload.getDate());
		if (!workout.getDate().equals(workoutDate) && workoutRepository.existsByDate(workoutDate)) {
			throw new EntityExists("Workout already is present for: " + payload.getDate());
		}

		workout.setDate(workoutDate);
		workout.setExerciseTime(payload.getTime());
		workout.setCalories(payload.getCalories());
		workout.setPuls(payload.getPuls());
		workout.setMaxPuls(payload.getMaxPuls());
		workout.setIntensive(payload.getIntensive());
		workout.setAerobish(payload.getAerobish());
		workout.setAnaerobish(payload.getAnaerobish());
		workout.setTrainingLoad(payload.getTrainingLoad());
		workout.setRounds(payload.getRounds());
		workout.setComment(payload.getComment());

		exerciseRepository.deleteByWorkoutId(workout.getId());
		workoutRepository.save(workout);

		List<Exercise> exercises = payload.getExercises().stream()
			.map(exercise -> {
				var result = new Exercise();
				result.setName(nameRepository.upsertAndReturnId(exercise.name()));
				result.setWeight(exercise.weight());
				result.setWorkout(workout);
				result.setOrder(exercise.order());
				return result;
			})
			.toList();

		if (!exercises.isEmpty()) {
			exerciseRepository.saveAll(exercises);
		}
	}
	
	public WorkoutsResponse<? extends WorkoutModel> getWorkoutsPerPeriod(WorkoutsPeriod period) {
		return workoutResponseBuilderService.generateResponse(period);
	}
	
	public List<ExerciseNameModel> getExcercises(boolean idValue) {
		List<ExerciseName> exercises = nameRepository.findAll();
		if (idValue) {
			return mapper.toNameModelWithId(exercises);
		} else {
			return mapper.toNameModel(exercises);
		}
	}

	public List<CalendarEventModel> getCalendarEvents(DateRange range) {
		List<WorkoutCalendarEventProjection> events = workoutRepository.getCalendarEventProjections(
			range.startDate(), range.endDate());
		return mapper.toCalendarEvents(events);
	}

	public List<SingleWorkoutModel> searchWorkouts(List<String> exercises, boolean onlySelected) {
		List<UUID> workoutIds;
		if (exercises.isEmpty()) {
			workoutIds = workoutRepository.searchWorkoutIds(10);
		} else if (onlySelected) {
			workoutIds = workoutRepository.searchWorkoutIdsOnlySelected(exercises, exercises.size(), 10);
		} else {
			workoutIds = workoutRepository.searchWorkoutIds(exercises, exercises.size(), 10);
		}
		List<WorkoutFullProjection> events = exerciseRepository.findWorkoutsByIds(workoutIds);
		return singleWorkoutMapper.toModels(events);
	}

	public CurrentPeriodWorkouts getCurrentPeriodWorkouts() {
		LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

		List<WorkoutCalendarEventProjection> events = workoutRepository.getCalendarEventProjections(
				startOfWeek, today);
		
		WeekFields wf = WeekFields.of(DayOfWeek.MONDAY, 7); // Choose Monday as start of the week
		// End of previous week (Sunday)
		LocalDate endOfPrevWeek = today.with(wf.dayOfWeek(), 1).minusDays(1);

		// Start of previous week (Monday)
		LocalDate startOfPrevWeek = endOfPrevWeek.minusDays(6);
		List<WorkoutCalendarEventProjection> prevWeekEvents = workoutRepository.getCalendarEventProjections(
				startOfPrevWeek, endOfPrevWeek);
		int monthCalories = workoutRepository.getCurrentMonthCalories();
		return new CurrentPeriodWorkouts(mapper.toCalendarEvents(events),
				mapper.toCalendarEvents(prevWeekEvents),
				StatisticsUtil.calculateFrom(events), monthCalories);
	}

	public String getFirstWorkoutDate() {
		LocalDate firstWorkoutDate = workoutRepository.findFirstWorkoutDate();
		return firstWorkoutDate.toString();
	}

	public void addOrRemoveFavorite(String workout) {
		try {
			favoriteRepository.addOrRemove(UUID.fromString(workout));
		} catch (Exception e) {
			System.out.println(e);
		}
	}

	public List<FavoriteWorkout> getFavoriteIds() {
		return mapper.toFavoriteModels(favoriteRepository.findAll());
	}
	
	public List<SingleWorkoutModel> getFavoriteWorkouts() {
		List<WorkoutFullProjection> workouts
			= exerciseRepository.findFavoriteWorkouts();
		return convertWorkoutProjections(workouts);
	}

	private List<SingleWorkoutModel> convertWorkoutProjections(List<WorkoutFullProjection> workouts) {
		Map<LocalDate, Integer> orderMap = new HashMap<>();
		for (int i = 0; i < workouts.size(); i++) {
			orderMap.put(workouts.get(i).getDate(), i);
		}
		List<SingleWorkoutModel> models = singleWorkoutMapper.toModels(workouts);
		models.sort(Comparator.comparingInt(e -> orderMap.get(LocalDate.parse(e.getDate()))));
		return models;
	}

	public SingleWorkoutModel getWorkout(String date) {
		List<WorkoutFullProjection> workout = exerciseRepository.findWorkout(LocalDate.parse(date));
		List<SingleWorkoutModel> models = singleWorkoutMapper.toModels(workout);
		return models.stream().findFirst().orElseThrow();
	}

	public List<String> upsertFlagged(String date) {
		List<Flagged> flagged = flaggedRepository.findAll();
		List<String> flaggedDays = flagged.stream()
			.map(Flagged::getDay)
			.toList();
		List<String> modifiableList = new ArrayList<>(flaggedDays);

		if (date != null) {
			boolean saved = upsertFlagged(flaggedDays, date);
			if (saved) {
				modifiableList.add(date);
			} else {
				modifiableList.remove(date);
			}	
		}

		Collections.sort(modifiableList);
		return modifiableList;
	}

	private boolean upsertFlagged(List<String> flaggedDays, String date) {
		if (flaggedDays.contains(date)) {
			flaggedRepository.delete(date);
			return false;
		} else {
			Flagged flaggedDay = new Flagged();
			flaggedDay.setDay(date);
			flaggedRepository.save(flaggedDay);
			return true;
		}
	}

    public List<SingleWorkoutModel> getFlaggedDays() {
		List<WorkoutFullProjection> workouts
			= exerciseRepository.findFlaggedWorkouts();
        return convertWorkoutProjections(workouts);
    }
}
