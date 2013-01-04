APP_DIR = $(shell pwd)
JS_FILES = $(wildcard $(APP_DIR)/test/*.js) $(wildcard $(APP_DIR)/lib/*.js)
JSON_FILES = $(wildcard $(APP_DIR)/config/*.json) $(wildcard $(APP_DIR)/*.json)

test:
	@NODE_ENV=test ./node_modules/.bin/mocha

test-s:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter spec

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	  --growl \
	  --watch

doc:
	@./node_modules/.bin/docker -o doc -c monokai -s yes -I -u -x node_modules -w --extras fileSearch

jshint:
	@./node_modules/.bin/jshint $(JS_FILES) $(JSON_FILES) --config config/jshint.json

.PHONY: test test-w doc jshint
