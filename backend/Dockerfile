# To build: docker -t acedesign/tcf-email-srv .

FROM cwaffles/openpose
#FROM openjdk:16
#COPY --from=python:3.9 / /
WORKDIR /
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ARG GIT_USER
ARG GIT_TOKEN
ARG GIT_COMMIT
ARG SW_VERSION
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A4B469963BF863CC
RUN apt-get update
RUN apt-get -y install git

RUN mkdir /opt/app
RUN mkdir /models
RUN mkdir /temp
RUN mkdir /script
RUN mkdir /trained_model
RUN apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        python3.9 \
        python3-pip \
        python3.9-dev \
        python3-setuptools \
        python3-wheel \
        python3-venv \
        wget \
        ffmpeg
#RUN apk update && apk add --no-cache python3 py3-pip python3-dev python3-setuptools python3-wheel
#RUN apk add  --no-cache ffmpeg
#RUN apk --no-cache add musl-dev linux-headers g++
RUN pip3 install --upgrade pip
RUN pip install numpy
RUN pip install opencv-python
RUN pip install Pillow
RUN pip install supyr_struct
RUN pip install matplotlib
RUN pip install torch
RUN pip install pykalman
RUN pip install scipy
RUN pip install keras==2.1.6

COPY ./VIBE-master /VIBE-master
RUN source /VIBE-master/scripts/install_pip.sh
RUN source /VIBE-master/scripts/prepare_data.sh
#RUN python3 /VIBE-master/demo.py --vid_file /VIBE-master/sample_video.mp4 --output_folder /VIBE-master/output/

COPY ./target/demo-0.0.1-SNAPSHOT.jar /opt/app/demo.jar
COPY ./models /models
COPY ./script /script
COPY ./temp /temp
COPY ./trained_model /trained_model

#CMD ["java", "-jar", "/opt/app/demo.jar"]
