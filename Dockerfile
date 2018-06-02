FROM node:9-alpine

LABEL name "project-002_genista"
LABEL version "0.1.0"
LABEL maintainer "iCrawl <icrawltogo@gmail.com>"

WORKDIR /usr/src/genista

COPY package.json yarn.lock .yarnclean ./

RUN apk add --update \
&& apk add --no-cache --virtual .build-deps git curl python g++ make \
\
&& yarn install \
\
&& apk del .build-deps

COPY . .

ENV DISCORD_TOKEN= \
	USER_ID= \
	SHARDS= \
	LAVALINK_WS= \
	LAVALINK_REST= \
	LAVALINK_PASSWORD= \
	RABBITMQ= \
	REDIS= \
	WEEB_SH= \
	WHATANIME= \
	COMMAND_API=

CMD ["node", "src/index.js"]
