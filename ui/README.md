# K8Z

## Install node_modules

Install `node_modules`:

```bash
yarn
```

### Start project

```bash
local: yarn start               # 本地启动，用于开发使用
dev: yarn start:dev || yarn dev # dev 环境启动
pro: yarn start:pro || yarn pro # pro 环境启动
```

### Start project by electron

```bash
local: yarn estart    # 本地启动，用于开发使用
dev: yarn estart:dev  # dev 环境启动
pro: yarn estart:pro  # pro 环境启动
```

### Build project

```bash
yarn build     # dev 环境
yarn build:pro # pro 环境打包
```

### Build electron project

```bash
# dev 环境
yarn build:win
yarn build:mac
yarn run build:linux

# pro 环境
yarn build:win:pro
yarn build:mac:pro
yarn build:linux:pro
```

### Check code style

```bash
yarn run lint
```

```bash
yarn run lint:fix
```

### Test code

```bash
yarn test
```
