IMAGE ?= workout-be-node
CONTAINER ?= be-node
PORT ?= 8081
ROOT ?= ..
NETWORK ?= host

.PHONY: build rebuild run run-detached stop

build:
	docker build -f Dockerfile -t $(IMAGE) $(ROOT)

rebuild:
	docker build --no-cache -f Dockerfile -t $(IMAGE) $(ROOT)

run: build
	docker run --rm --name $(CONTAINER) -p $(PORT):8081 \
		--network $(NETWORK) \
		-e APP_ENV=docker \
		-v $(PWD)/.env:/app/.env:ro \
		-v $(PWD)/.env.docker:/app/.env.docker:ro \
		$(IMAGE)

run-detached: build
	docker run -d --name $(CONTAINER) -p $(PORT):8081 \
		--network $(NETWORK) \
		-e APP_ENV=docker \
		-v $(PWD)/.env:/app/.env:ro \
		-v $(PWD)/.env.docker:/app/.env.docker:ro \
		$(IMAGE)

stop:
	docker stop $(CONTAINER) || true
	docker rm $(CONTAINER) || true
