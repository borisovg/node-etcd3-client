NAME = node-etcd3-client-test
REPO = appcelerator/etcd:latest

.PHONY: all
all: test docker-stop

## clean:        delete NPM packages and generated files
.PHONY: clean
clean:
	rm -rf \
		.nyc_output \
		coverage \
		node_modules
	rm -f npm-debug.log

## docker-start: start the Docker etcd container
.PHONY: docker-start
docker-start:
	test -n "$$(sudo docker ps -q -f name=$(NAME))" || \
		sudo docker run \
			--name $(NAME) \
			-p 2379:2379 \
			-p 2380:2380 \
			-dt $(REPO);

## docker-stop:  start the Docker etcd container
.PHONY: docker-stop
docker-stop:
	test -z "$$(sudo docker ps -q -f name=$(NAME))" || ( \
		sudo docker stop $(NAME); \
		sudo docker rm $(NAME); \
	)

.PHONY: wait
wait:
	while [ true ]; do timeout 1 bash -c 'ETCDCTL_API=3 etcdctl endpoint status' && break || sleep 0.5; done

## test:         run the tests (default target)
.PHONY: test
test: node_modules docker-start wait
ifdef FILE
	./node_modules/.bin/mocha $(FILE)
else
	./node_modules/.bin/nyc \
		--all \
		--cwd ../ \
		--exclude "tests/**" \
		--report-dir=./tests/coverage \
		--reporter=html \
		--reporter=text \
		--temp-directory ./tests/.nyc_output \
		node_modules/.bin/mocha spec/*
endif

.PHONY: help
help:
	@sed -n 's/^##//p' Makefile

node_modules: package.json
	npm update || (rm -rf node_modules; exit 1)
	touch node_modules
