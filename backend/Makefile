# SAM invokes: make build-SmartCartFunction with ARTIFACTS_DIR set.
.PHONY: build-SmartCartFunction

SHARP_VER := $(shell node -p "require('./package-lock.json').packages['node_modules/sharp'].version")
ORT_VER := $(shell node -p "require('./package-lock.json').packages['node_modules/onnxruntime-node'].version")

build-SmartCartFunction:
	set -e
	npm ci
	npx esbuild src/lambda.ts --bundle --platform=node --target=es2020 --format=cjs \
		--outfile="$(ARTIFACTS_DIR)/lambda.js" \
		--external:sharp --external:onnxruntime-node \
		--minify
	rm -rf "$(ARTIFACTS_DIR)/node_modules" "$(ARTIFACTS_DIR)/.native-install"
	mkdir -p "$(ARTIFACTS_DIR)/.native-install"
	printf '%s\n' '{"private":true,"dependencies":{"sharp":"$(SHARP_VER)","onnxruntime-node":"$(ORT_VER)"}}' > "$(ARTIFACTS_DIR)/.native-install/package.json"
	cd "$(ARTIFACTS_DIR)/.native-install" && \
		npm_config_platform=linux npm_config_arch=x64 npm install --omit=dev
	mv "$(ARTIFACTS_DIR)/.native-install/node_modules" "$(ARTIFACTS_DIR)/node_modules"
	rm -rf "$(ARTIFACTS_DIR)/.native-install"
