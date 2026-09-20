CREATE TABLE favorite (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	workout UUID NOT NULL UNIQUE
);