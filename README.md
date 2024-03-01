# @furina/server [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rainbow-dust/server/blob/main/LICENSE)  [![build status](https://github.com/rainbow-dust/server/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/rainbow-dust/server/actions/workflows/build.yml)

## description

this repo is the back-end part of furina, base on nestjs, mongodb... building for SNS server.

related repos:

- [app](https://github.com/rainbow-dust/app)
- [server](https://github.com/rainbow-dust/server)
- [manage](https://github.com/rainbow-dust/manage)

## features

- user
  - register, login, logout
  - modify/query/delete user
  - follow/unfollow user
  - get mutual followings
  - store user preference base on user actions and target tags
- note
  - create/modify/query/delete note
  - like/unlike note
  - get note detail
  - filter base on tags
  - recommend notes base on user preference and note tags
  - ......
- comment
  - create/modify/query/delete comment
  - like/unlike comment

---

- tag
  - create/modify/query/delete tag
  - and base on tag and user info... we have building a simple search and recommendation system
- collect
  - create/modify/query/delete collect
  - it will be used for user to collect note... it will be used for user to organize their own data and also for recommendation system
- notice
  - notice count/list/detail query, isRead modify
  - notice user when someone like, comment, collect, follow, or system notice...
- statistics
  - query statistics info for charts or logs
  - it mainly about two part, one is for reform the server's data, the other is the users' actions, data will be store in 'statistics' and 'statistics_actions'

---

- auth
  - jwt
- upload
  - upload file

## deployment

### docker compose

deploy: [example.yaml](./docker-compose.yml)

backup:

```bash
docker exec -it furina_mongo /bin/bash
mongodump -h localhost -d furina -o /mongo-backup
exit
docker cp furina_mongo:/mongo-backup ./mongo-backup
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
│   ├── modules             # modules, main features of the server, like user, note, comment...
│   ├── common              # middlewares an so on, for handling request and response, like auth, logger, error...
│   ├── providers           # providers, for providing some common services, like database, cache, logger...
│   ├── main.ts             # main file of the server
│   └── bootstrap.ts        # bootstrap file of the server
└── README.md
```
