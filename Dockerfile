# UI build stage
FROM registry-vpc.cn-beijing.aliyuncs.com/shimobase/node:16-alpine3.14 as js-builder

ENV NODE_OPTIONS=--max_old_space_size=8000
WORKDIR /k8z
COPY ui .

RUN yarn install --frozen-lockfile --network-timeout 100000
ENV NODE_ENV production
RUN yarn build


# API build stage
FROM registry-vpc.cn-beijing.aliyuncs.com/shimobase/golang-build:1.18.1-alpine3.15 as go-builder

ENV GOPROXY=https://goproxy.cn,direct
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache make bash git tzdata

WORKDIR /k8z

COPY go.mod go.sum ./
RUN go mod download -x
COPY . .
COPY --from=js-builder /k8z/dist ./internal/ui/dist
RUN ls -rlt ./internal/ui/dist && make build.api


# Fianl running stage
FROM registry-vpc.cn-beijing.aliyuncs.com/shimobase/golang-build:1.18.1-alpine3.15
LABEL maintainer="k8z@gotomicro.com"
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

COPY ./scripts/flamegraph.pl /bin/flamegraph.pl
# install graphivz,perl and set timeZone to Asia/Shanghai
RUN apk add --no-cache graphviz
RUN apk add perl
RUN chmod a+x /bin/flamegraph.pl
RUN apk add --no-cache tzdata bash

WORKDIR /k8z

COPY --from=go-builder /k8z/bin/k8z ./bin/
COPY --from=go-builder /k8z/config ./config

EXPOSE 9001
EXPOSE 9003

RUN apk add --no-cache tzdata

CMD ["sh", "-c", "./bin/k8z"]
