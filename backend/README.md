# Backend

## Setup

1) Install dependencies

```
npm install
```

2) Configure environment

- Copy `.env.example` to `.env`
- Fill in `DATABASE_URL`
- Configure Firebase Admin credentials (either JSON path or env vars)

## Seed

```
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

## Run

```
npm run dev
```

## Prisma schema (frozen)

`prisma/schema.prisma` is the source of truth. Update it only via migrations and keep changes intentional.
