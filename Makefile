VERSION := ${shell node -pe "require('./package.json').version"}

install:
	docker run --rm -v "${PWD}":/usr/src/app -w /usr/src/app node:9-alpine npm install
build:
	docker build -t navikt/nais-testapp -t navikt/nais-testapp:$(VERSION) .
push:
	docker push navikt/nais-testapp:$(VERSION)
run-local:
	docker run --rm -ti -p 8080:8080 nais-testapp
