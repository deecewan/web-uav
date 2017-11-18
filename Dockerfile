FROM node:latest
MAINTAINER David Buchan-Swanson <david.buchanswanson@gmail.com>

RUN echo "deb http://packages.ros.org/ros/ubuntu jessie main" > /etc/apt/sources.list.d/ros-latest.list
RUN apt-key adv --keyserver hkp://ha.pool.sks-keyservers.net:80 --recv-key 421C365BD9FF1F717815A3895523BAEEB01FA116
RUN apt-get update -y
RUN apt-get install -y \
  cmake \
  build-essential \
  ros-kinetic-ros-base \
  ros-kinetic-image-common \
  ros-kinetic-image-transport-plugins \
  ros-kinetic-cv-camera \
  ros-kinetic-video-stream-opencv \
  ros-kinetic-nav-msgs

RUN npm install -g yarn

# cache package.json changes
ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn -p
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

ENV CMAKE_PREFIX_PATH=/opt/ros/kinetic

WORKDIR /opt/app
ADD . /opt/app

EXPOSE 3000

RUN ["yarn", "build:server"]

CMD ["yarn", "launch:server"]

