FROM mhart/alpine-node:base-8
MAINTAINER Johnny Horvi <johnny.horvi@nav.no> 

WORKDIR /src
COPY . .

EXPOSE 8080

CMD ["node", "./src/server.js"]
