FROM node:18
WORKDIR /usr/app
COPY package.json /usr/app/package.json
COPY yarn.lock /usr/app/yarn.lock

ARG DATABASE_URL=${DATABASE_URL}
ENV DATABASE_URL=${DATABASE_URL}

ARG ASTROAUTH_SECRET=${ASTROAUTH_SECRET}
ENV ASTROAUTH_SECRET=${ASTROAUTH_SECRET}

ARG ASTROAUTH_URL=${ASTROAUTH_URL}
ENV ASTROAUTH_URL=${ASTROAUTH_URL}

RUN if [ -z "$DATABASE_URL" ]; then echo 'Environment variable DATABASE_URL must be specified. Exiting.'; exit 1; fi
RUN if [ -z "$ASTROAUTH_SECRET" ]; then echo 'Environment variable ASTROAUTH_SECRET must be specified. Exiting.'; exit 1; fi
RUN if [ -z "$ASTROAUTH_URL" ]; then echo 'Environment variable ASTROAUTH_URL must be specified. Exiting.'; exit 1; fi
RUN yarn

COPY . .
RUN yarn build
RUN yarn gen
EXPOSE 3000
CMD [ "yarn", "server" ]