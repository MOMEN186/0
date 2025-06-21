![logo.png](logo.png)

Watch your favourite anime anywhere, anytime. No Ads.

4RB ANIME is an Arabic anime streaming website. It is built using the [Next Js](https://nextjs.org/) framework, [Shadcn/ui](https://ui.shadcn.com), and [Tailwind CSS](https://tailwindcss.com/).

_4RB ANIME is an evolving platform that aims to provide the best anime streaming experience for Arabic viewers._

## Features

- **No Ads** - No ads, no popups, no redirects, no bullshit.
- **PWA Support** - 4RB ANIME is a PWA, which means you can install it on your phone.

## Contributing

```
fork the repo

git clone <forked-repo>
git checkout -b <new-feature>
git add <changed-file>
git commit -m "New feature"
git push origin <new-feature>

then submit a pull request
```

## Local Development

### Prerequisite

- Node js
- Golang (if you wish to use my proxy server)
- [Pocketbase](https://pocketbase.io)

### Proxy Server

Head over to [Proxy-M3U8](https://github.com/Dovakiin0/proxy-m3u8) and follow the instruction to setup. or if you wish to use your own proxy server, feel free.

### Pocketbase

Follow the instruction from the official website. Setup initial superadmin credentials. Once inside dashboard, go to settings > Import Collections and paste the content from [collection-JSON](https://github.com/Dovakiin0/Kitsune/blob/master/docs/pb.json) and click import.

You will need discord client secret if you wish to use login from discord feature.

### Frontend

Clone the repo and `cd 4rb-anime/`.  
Open `.env` file and change the port. if you are using the above proxy and pocketbase then you are good to go. Then,

```
npm install
npm run dev
```

### Using Docker

There is a `docker-compose.yaml` file which you can use to run the both frontend and server.  
Simply run `docker compose up -d`.

## Support

Join the Discord server: <https://discord.gg/6yAJ3XDHTt>
