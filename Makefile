# Docker-based tooling for the Wyrdness site.
# All Node and tooling commands run inside ephemeral containers — the host needs
# only Docker. Anything that would normally `npm install` on the host runs inside
# node:20-alpine with a named volume caching node_modules.

SHELL := /bin/bash

# Parent of this repo holds the 516 phenomenon repos, so aggregate-local.js needs it mounted.
SITE_DIR    := $(shell pwd)
PARENT_DIR  := $(shell cd .. && pwd)
NODE_IMAGE  := node:24-alpine
NGINX_IMAGE := nginx:alpine
AJV_IMAGE   := node:24-alpine

# Random 8-char suffix for --name on every ephemeral container launch.
RAND_SUFFIX = $$(tr -dc 'a-z0-9' </dev/urandom | head -c8)

# Mount the parent so the site has both itself and the sibling phenomenon repos.
# Working directory inside the container is /work/wyrdness.github.io.
DOCKER_RUN = docker run --rm --name wyrdness-$(RAND_SUFFIX) \
  -v $(PARENT_DIR):/work \
  -v wyrdness-node-modules:/work/wyrdness.github.io/node_modules \
  -w /work/wyrdness.github.io \
  $(NODE_IMAGE)

DOCKER_RUN_IT = docker run --rm -it --name wyrdness-$(RAND_SUFFIX) \
  -v $(PARENT_DIR):/work \
  -v wyrdness-node-modules:/work/wyrdness.github.io/node_modules \
  -w /work/wyrdness.github.io \
  $(NODE_IMAGE)

.PHONY: help install aggregate aggregate-local categories stats pages build dev shell clean validate-schema validate-html normalize-categories normalize-categories-apply research research-batch repo-docs

help:
	@echo "Wyrdness site — Docker-only tooling"
	@echo ""
	@echo "Data pipeline:"
	@echo "  make install          Install npm deps inside the node container"
	@echo "  make aggregate        Fetch api.json from all org repos via GitHub API (needs GITHUB_TOKEN)"
	@echo "  make aggregate-local  Aggregate from sibling phenomenon repos on disk"
	@echo "  make categories       Regenerate api/v1/categories.json and categories/<slug>/index.html"
	@echo "  make stats            Regenerate api/v1/stats.json"
	@echo "  make pages            Regenerate phenomena/<id>/index.html"
	@echo "  make build            aggregate-local + categories + stats + pages"
	@echo ""
	@echo "Dev / verification:"
	@echo "  make dev              Serve the site at http://localhost:8000 (nginx in Docker)"
	@echo "  make shell            Drop into the node container shell"
	@echo "  make validate-schema  Validate every sibling repo's api.json against the org schema"
	@echo "  make validate-html    Run html5validator inside Docker"
	@echo "  make clean            Remove the node_modules volume"
	@echo ""
	@echo "Content authoring:"
	@echo "  make research ID=<id> [APPLY=1]   Draft a populated api.json via API; output to drafts/<id>.json"
	@echo "  make research-batch [APPLY=1] [LIMIT=N] [ONLY=ids] [CONCURRENCY=N]   Batch mode"
	@echo "  make repo-docs [FORCE=1]          Regenerate README.md + SOURCES.md from api.json"

install:
	$(DOCKER_RUN) sh -c 'npm ci || npm install'

aggregate: install
	$(DOCKER_RUN) -e GITHUB_TOKEN=$$GITHUB_TOKEN node scripts/aggregate-api.js

aggregate-local: install
	$(DOCKER_RUN) node scripts/aggregate-local.js

categories: install
	$(DOCKER_RUN) node scripts/generate-categories.js

stats: install
	$(DOCKER_RUN) node scripts/generate-stats.js

pages: install
	$(DOCKER_RUN) node scripts/generate-pages.js

build: aggregate-local categories stats pages

dev:
	@echo "Serving site at http://localhost:8000 (Ctrl-C to stop)"
	docker run --rm --name wyrdness-$(RAND_SUFFIX) -p 8000:80 \
	  -v $(SITE_DIR):/usr/share/nginx/html:ro \
	  $(NGINX_IMAGE)

shell:
	$(DOCKER_RUN_IT) sh

normalize-categories:
	$(DOCKER_RUN) node ../.github/scripts/normalize-categories.js

normalize-categories-apply:
	$(DOCKER_RUN) node ../.github/scripts/normalize-categories.js --apply

# Wrapper script — path is glob-resolved so the Makefile doesn't have to
# literally name the vendor. See scripts/ for the wrapper.
RESEARCH_WRAPPER := $(wildcard ../.github/scripts/c*-research.sh)

# Populate one repo's api.json. Usage: make research ID=<id> [APPLY=1]
research: install
	@if [ -z "$(ID)" ]; then echo "usage: make research ID=<repo-id> [APPLY=1]"; exit 2; fi
	$(DOCKER_RUN) -e API_KEY="$$API_KEY" \
	  sh $(RESEARCH_WRAPPER) single $(ID) $(if $(APPLY),--apply,)

# Populate all skeleton repos via the API. Usage:
#   make research-batch APPLY=1 LIMIT=5 ONLY=bigfoot,mothman CONCURRENCY=2
research-batch: install
	$(DOCKER_RUN) -e API_KEY="$$API_KEY" \
	  sh $(RESEARCH_WRAPPER) batch \
	  $(if $(APPLY),--apply,) \
	  $(if $(LIMIT),--limit=$(LIMIT),) \
	  $(if $(ONLY),--only=$(ONLY),) \
	  $(if $(CONCURRENCY),--concurrency=$(CONCURRENCY),) \
	  $(if $(FORCE),--force,)

# Regenerate README.md and SOURCES.md for every populated repo from api.json.
# Usage:   make repo-docs
#          make repo-docs FORCE=1
#          make repo-docs ONLY=bigfoot,mothman
repo-docs:
	$(DOCKER_RUN) node ../.github/scripts/generate-repo-docs.js \
	  $(if $(FORCE),--force,) \
	  $(if $(ONLY),--only=$(ONLY),)

validate-schema:
	@docker run --rm --name wyrdness-$(RAND_SUFFIX) \
	  -v $(PARENT_DIR):/work \
	  -w /work/.github/scripts \
	  $(AJV_IMAGE) sh -c '\
	    npm install --no-save --silent --no-audit --no-fund ajv@8 ajv-formats@3 >/dev/null && \
	    node validate-schemas.js'

validate-html:
	docker run --rm --name wyrdness-$(RAND_SUFFIX) \
	  -v $(SITE_DIR):/data \
	  --entrypoint sh \
	  ghcr.io/validator/validator:latest \
	  -c 'java -jar /vnu.jar --skip-non-html --Werror --filterpattern ".*phenomena/.*/index\.html" /data'

clean:
	docker volume rm wyrdness-node-modules 2>/dev/null || true
