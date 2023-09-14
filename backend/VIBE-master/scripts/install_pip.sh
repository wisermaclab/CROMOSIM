#!/usr/bin/env bash

#echo "Creating virtual environment"
#python3.7 -m venv vibe-env
#echo "Activating virtual environment"

#source $PWD/vibe-env/bin/activate

pip install --upgrade pip
pip install numpy==1.17.5 torch==1.4.0 torchvision==0.5.0
pip install git+https://github.com/giacaglia/pytube.git --upgrade
pip install -r /VIBE-master/requirements.txt
