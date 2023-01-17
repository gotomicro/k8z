APP_NAME:=k8z
APP_PATH:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SCRIPT_PATH:=$(APP_PATH)/scripts
COMPILE_OUT:=$(APP_PATH)/bin/$(APP_NAME)

TCPDUMP_VERSION=4.9.2
STATIC_TCPDUMP_NAME=static-tcpdump

run:export EGO_DEBUG=true
run:
	@cd $(APP_PATH) && egoctl run
install:export EGO_DEBUG=true
install:
	@cd $(APP_PATH) && go run main.go --config=config/local.toml --job=install

build.server:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making build app<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@make ./bin/static-tcpdump
	@chmod +x $(SCRIPT_PATH)/build/*.sh
	@cd $(APP_PATH) &&  GOOS=$(GOOS) $(SCRIPT_PATH)/build/gobuild.sh $(APP_NAME) $(COMPILE_OUT)
	@cd $(APP_PATH) && mkdir -p ./ui/server && cp ./bin/* ./ui/server/ && cp -r config ./ui/server/ && chmod +x ./bin/*

build.api:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making build app<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@chmod +x $(SCRIPT_PATH)/build/*.sh
	@cd $(APP_PATH) && $(SCRIPT_PATH)/build/gobuild.sh $(APP_NAME) $(COMPILE_OUT)

build.ui:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@git submodule update --init --recursive --remote
	@cd $(APP_PATH)/ui && yarn install --frozen-lockfile && yarn run build
	@cp -r $(APP_PATH)/ui/dist $(APP_PATH)/internal/ui
	@echo -e "\n"


./bin/static-tcpdump:
#	wget http://www.tcpdump.org/release/tcpdump-${TCPDUMP_VERSION}.tar.gz
#	tar -xvf tcpdump-${TCPDUMP_VERSION}.tar.gz
#	cd tcpdump-${TCPDUMP_VERSION} && CFLAGS=-static ./configure --without-crypto && make
#	mv tcpdump-${TCPDUMP_VERSION}/tcpdump ./${STATIC_TCPDUMP_NAME}
#	rm -rf tcpdump-${TCPDUMP_VERSION} tcpdump-${TCPDUMP_VERSION}.tar.gz
	wget https://github.com/eldadru/ksniff/releases/download/v1.6.2/ksniff.zip
	unzip -d ksniff ksniff.zip
	cp ksniff/static-tcpdump artifacts/
	rm -rf ksniff ksniff.zip

build.electron.darwin:
	make build.server GOOS=darwin
	cd ui && yarn electron:build:pro --mac

build.electron.windows:
	make build.server GOOS=windows COMPILE_OUT=$(APP_PATH)/bin/$(APP_NAME).exe
	cd ui && yarn electron:build:pro --win

