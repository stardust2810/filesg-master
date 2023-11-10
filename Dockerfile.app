
FROM nexus-docker.ship.gov.sg/node:18.18.1-bullseye as builder

# default NX_BUILD_CONFIGURATION "production" is used for backend api build
# override NX_BUILD_CONFIGURATION to other configuration value to build a different binary output set in NX project.json file
ARG NX_BUILD_CONFIGURATION="production"
ARG SERVICE_NAME

RUN apt-get update && \
    apt-get install -y \
    jq \
    g++ \
    make

WORKDIR /build

COPY ./ .

RUN npm ci --legacy-peer-deps

RUN npm run build service-${SERVICE_NAME} -- --configuration=${NX_BUILD_CONFIGURATION}

# argon2 required compilation which cannot be done with --ignore-scripts

FROM nexus-docker.ship.gov.sg/node:18.18.1-bullseye as consolidator

ARG SERVICE_NAME

USER root
RUN apt-get update && \
    apt-get install -y \
    git \
    jq \
    g++ \
    make

USER node

WORKDIR /home/node

COPY --chown=node scripts ./scripts
COPY --chown=node --from=builder /build/dist/apps/service-${SERVICE_NAME} ./
COPY --chown=node package-lock.json ./

RUN npm ci --omit=dev --legacy-peer-deps

FROM 087814769163.dkr.ecr.ap-southeast-1.amazonaws.com/ecr-commons-prdezapp-node-golden:nodejs-18.18.1-latest-bullseye as app

ARG SERVICE_NAME

USER root
RUN apt-get update && \
    apt-get install -y \
    git=1:2.30.2-1+deb11u2

ENV TZ=Asia/Singapore
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime

USER node

WORKDIR /home/node

COPY --chown=node --from=consolidator /home/node ./

ENTRYPOINT [ "scripts/entry.sh" ]
