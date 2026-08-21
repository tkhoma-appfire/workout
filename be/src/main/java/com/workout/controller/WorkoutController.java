package com.workout.controller;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.workout.model.CalendarEventModel;
import com.workout.model.CurrentPeriodWorkouts;
import com.workout.model.DateRange;
import com.workout.model.ExerciseNameModel;
import com.workout.model.FavoriteWorkout;
import com.workout.model.FirstWorkoutDate;
import com.workout.model.SingleWorkoutModel;
import com.workout.model.TimePeriod;
import com.workout.model.WorkoutModel;
import com.workout.model.WorkoutsPeriod;
import com.workout.model.WorkoutsResponse;
import com.workout.service.ExportService;
import com.workout.service.ImportService;
import com.workout.service.WorkoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class WorkoutController {
	private final WorkoutService workoutService;
	private final ExportService exportService;
	private final ImportService importService;

	@PostMapping("/add_workout")
	public ResponseEntity<Void> addWorkout(
		@RequestBody SingleWorkoutModel payload
	) {
		System.out.println(payload);
		workoutService.addWorkout(payload);
		return ResponseEntity.accepted().build();
	}

	@PostMapping("/edit_workout")
	public ResponseEntity<Void> editWorkout(
		@RequestBody SingleWorkoutModel payload
	) {
		workoutService.editWorkout(payload);
		return ResponseEntity.accepted().build();
	}
	
	@PostMapping("/workouts")
	public WorkoutsResponse<? extends WorkoutModel> getWorkoutsPerPeriod(
		@RequestBody WorkoutsPeriod workoutsPeriod
	) {
		if (workoutsPeriod == null) {
			workoutsPeriod = new WorkoutsPeriod(TimePeriod.MONTH, null);
		}
		return workoutService.getWorkoutsPerPeriod(workoutsPeriod);
	}
	
	@GetMapping(value = "/export/csv", produces=MediaType.APPLICATION_OCTET_STREAM_VALUE)
	public ResponseEntity<ByteArrayResource> exportCsv() {
		byte[] content = exportService.exportCsv();
		if (content == null) {
			return ResponseEntity.notFound().build();
		}
		ByteArrayResource resource = new ByteArrayResource(content);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename("workout.zip").build());

        return ResponseEntity.ok()
            .headers(headers)
            .contentLength(content.length)
            .body(resource);
	}
	
	@PostMapping(value = "/import/csv")
	public ResponseEntity<String> importCsv(
		@RequestParam("file") MultipartFile file
	) {
		String response = importService.importCsv(file);
		return ResponseEntity.ok()
			.body(response);
	}
	
	@GetMapping("/exercises")
	public List<ExerciseNameModel> getExcercises(
		@RequestParam(name = "id_value", required = false) boolean idValue
	) {
		return workoutService.getExcercises(idValue);
	}
	
	@PostMapping("/calendar_events")
	public List<CalendarEventModel> getCalendarEvents(
			@RequestBody DateRange range
	) {
		return workoutService.getCalendarEvents(range);
	}
	
	@GetMapping("/search")
	public List<SingleWorkoutModel> searchWorkouts(
		@RequestParam(name = "exercises", required = false) String exercises,
		@RequestParam(name = "onlySelected", defaultValue = "false") boolean onlySelected
	) {
		if (exercises == null || exercises.trim().isEmpty()) {
			return workoutService.searchWorkouts(Collections.emptyList(), false);
		}
		return workoutService.searchWorkouts(
			Arrays.stream(exercises.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.toList(),
			onlySelected);
	}
	
	@GetMapping("/current_period")
	public CurrentPeriodWorkouts getChartData() {
		return workoutService.getCurrentPeriodWorkouts();
	}
	
	@GetMapping("/first_workout_date")
	public FirstWorkoutDate getFirstWorkoutDate() {
		return new FirstWorkoutDate(workoutService.getFirstWorkoutDate());
	}
	
	@PostMapping("/favorites")
	public ResponseEntity<Void> favorites(@RequestBody FavoriteWorkout favorite) {
		workoutService.addOrRemoveFavorite(favorite.workout());
		return ResponseEntity.accepted().build();
	}
	
	@GetMapping("/favorites")
	public List<SingleWorkoutModel> getFavorites() {
		return workoutService.getFavoriteWorkouts();
	}
	
	@GetMapping("/template_workout")
	public SingleWorkoutModel getWorkout(
		@RequestParam(name = "date", required = true) String date
	) {
		return workoutService.getWorkout(date);
	}

	@PostMapping("/add_flagged")
	public List<String> addFlaggedDay(@RequestBody(required = false) String flaggedDay) {
		return workoutService.upsertFlagged(flaggedDay);
	}

	@GetMapping("/flagged")
	public List<SingleWorkoutModel> getFlaggedDays() {
		return workoutService.getFlaggedDays();
	}
	
	@ExceptionHandler
	public ResponseEntity<Map<String, String>> handleException(NoSuchElementException exception) {
		Map<String, String> error = new HashMap<String, String>();
		error.put("error", "Can't find workout");
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
	}
}
