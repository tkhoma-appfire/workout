CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE workout (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	date DATE NOT NULL,
	exercise_time INT NOT NULL,
	calories INT,
	puls INT,
	puls_max INT,
	intensive VARCHAR(10),
	aero VARCHAR(10),
	anaero VARCHAR(10),
	tl INT,
	rounds VARCHAR(255),
	comment VARCHAR(555)
);

CREATE TABLE exercise_name (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	value VARCHAR(500) NOT NULL UNIQUE
);

CREATE TABLE exercise (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	name UUID,
	weight INT,
	workout_id UUID,
	
	CONSTRAINT fk_exercise_workout FOREIGN KEY (workout_id)
        REFERENCES workout(id) ON DELETE CASCADE,

    CONSTRAINT fk_exercise_name FOREIGN KEY (name)
        REFERENCES exercise_name(id) ON DELETE CASCADE
);
