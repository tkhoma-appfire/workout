package com.workout.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.ToString;

@Entity
@Data
@ToString
public class Exercise {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	
	@ManyToOne
    @JoinColumn(name = "name")
	private ExerciseName name;
	private Integer weight;
	@ManyToOne
    @JoinColumn(name = "workout_id")
	private Workout workout;
	@Column(name = "ex_order")
	private Integer order;
}