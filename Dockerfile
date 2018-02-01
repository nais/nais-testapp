FROM mhart/alpine-node:base-9
MAINTAINER Johnny Horvi <johnny.horvi@nav.no> 

WORKDIR /src
COPY . .

EXPOSE 8080

CMD ["node", "./src/server.js"]
