# server

## description

this repo is the back-end part of the rainbow-dust, base on nestjs, mongodb... building for server.
related projects:

- [app](https://github.com/rainbow-dust/app)
- [server](https://github.com/rainbow-dust/server)
- [manage](https://github.com/rainbow-dust/manage)

## features

- user
  - register, login, logout
  - modify/query/delete user
  - follow/unfollow user

- note
  - create/modify/query/delete note
  - like/unlike note
  - collect/uncollect note
  - ......
- comment
  - create/modify/query/delete comment
  - like/unlike comment
- tag
  - create/modify/query/delete tag
  - and base on tag and user info... we have building a simple search and recommendation system
- collect
  - create/modify/query/delete collect
  - it will be used for user to collect note... it will be used for user to organize their own data and also for recommendation system
- notice
  - create/modify/query/delete note
  - it will be used for notice user when someone like, comment, collect, follow, or system notice...
- statistic
  - query statistic info
  - it mainly about two part, one is the server itself, the other is the user, data will be store in 'statistic' and 'statistic_action'

## deployment

### docker

```bash
docker pull huamurui/furina-server
docker run huamurui/furina-server
```

### docker compose

```yaml
version: '3.8'

services:
  app:
    container_name: furina-server
    image: huamurui/furina-server:latest
    command: node index.js --db_host=furina_mongo --color
    environment:
      - TZ=Asia/Shanghai
      - NODE_ENV=production
    volumes:
      - ./data/furina-server:/root/.furina-server
    ports:
      - '9527:9527'
    depends_on:
      - furina_mongo
    links:
      - furina_mongo
    networks:
      - app-network
    restart: always
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://127.0.0.1:4913/api/v1/ping']
      interval: 1m30s
      timeout: 30s
      retries: 5
      start_period: 30s

  furina_mongo:
    container_name: furina_mongo
    image: mongo
    volumes:
      - ./data/db:/data/db
    ports:
      - '7495:27017'
    networks:
      - app-network
    restart: always

networks:
  app-network:
    driver: bridge
```

### source code

```bash
git clone
cd server
pnpm install
pnpm build
pm2 start dist/main.js
```

## development

### start the project

```bash
pnpm install
pnpm dev
```

### project structure

```yaml
.
├── src
│   ├── modules             # modules, main features of the server, like user, post, comment... each module has its own folder, and contains model, controller, service...
│   ├── common              # middlewares an so on, for handling request and response
│   ├── providers           # providers, for providing some common services, like database, cache, logger...
│   ├── app.config.ts       # config file of the server
│   ├── app.controller.ts   # main controller of the server
│   ├── app.module.ts       # main module of the server
│   ├── main.ts             # main file of the server
│   └── bootstrap.ts        # bootstrap file of the server
└── README.md
```

