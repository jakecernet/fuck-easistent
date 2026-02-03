# Fuck eAsistent

A project for getting eAsistent Plus features for free.

## Why

I started this project because I wanted to see all my grades but eAsistent wont let me since I don't pay for their plus plan.

## Features

- [x] Collect and store grades
- [ ] Show final grades
- [ ] Show homework
- [ ] Show future assessments

## Hosting

Since using this app requires you giving it your eAsistent login info which is sensitive information I decided to make it self-hosted. Hosting it is pretty simple using [Docker](https://docs.docker.com/get-started/get-docker/).

### Using `docker run`

```shell
docker run -d \
--name server \
-p 8080:80 \
-e ADMIN_PASSWORD="testpassword" \
-e CHECK_INTERVAL_SECONDS=60 \
-e CHECK_FULL_INTERVAL_SECONDS=3600 \
-v fea_data:/app/data \
anzlc/fuck-easistent
```

### Using `docker compose`

1. Download the [compose.yml](https://github.com/Anzlc/fuck-easistent/blob/main/compose.yml) file.
2. And then run `docker compose up` in the directory where you have downloaded the **compose.yml** file.
3. The app is now running on localhost:8080 or whatever you set the port to.

## Issues

If you encounter any issues, please submit them on GitHub.

## FAQ

### Q: Why can't I see all my grades?

Since the app can only see the last grade reported by eAsistent unless you've been using the app from the start of the school year. However if you have an active eAsistent plus trial (which they occasionally offer) the app will in that case fetch all grades and then it will be up to date. Regardless, you can always see your real average grade directly from the app.

### Q: Why are some subjects missing?

At the moment, the app only checks for new grades for subjects you have during current week. This means some subjects may not appear initially but will be added when a new week comes.
