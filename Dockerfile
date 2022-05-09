FROM node:slim

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git && \
    mkdir -p /data
WORKDIR /data
RUN git clone https://github.com/mailsvb/vcs.git . && npm install
ENV HOME=/data
ENV TZ=Europe/Berlin
