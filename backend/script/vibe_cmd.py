#!/usr/bin/python

import os
import shutil
import subprocess
import sys

folder_id = sys.argv[1]
#VIBE_DIR = 'C:/Users/Xulia/Downloads/VIBE'
VIBE_DIR = '/VIBE-master'
#CUR_DIR = os.getcwd() + '/temp/'+folder_id+"/"
CUR_DIR = '/temp/'+folder_id+"/"

def vibe_cmd_process():
    """ Method:
    Execute VIBE demo script with the result video from the previous step
    Store the result of VIBE in a temporary folder
    Used by model widget
    :return: None
    """

    command = 'cd '
    command += VIBE_DIR
    #command += ' && conda.bat deactivate'
    #command += ' && conda.bat activate venv_vibe'
    #command += ' && python demo_alter.py --vid_file ' + CUR_DIR + 'step_1_result.mp4' + ' --output_folder ' + CUR_DIR
    command += ' && python3 demo.py --vid_file ' + CUR_DIR + 'step_1_result.mp4' + ' --output_folder ' + CUR_DIR
    print(command)
    subprocess.call(command, shell=True)
    root_dir = os.getcwd()
    print(command)
    #if os.path.exists('temp/' + folder_id + '/VIBE_result'):
    #    shutil.rmtree('temp/' + folder_id + '/VIBE_result')
    #os.rename('temp/' + folder_id + '/step_1_result', 'temp/' + folder_id + '/VIBE_result')
    if os.path.exists('/temp/' + folder_id + '/VIBE_result'):
        shutil.rmtree('/temp/' + folder_id + '/VIBE_result')
    os.rename('/temp/' + folder_id + '/step_1_result', '/temp/' + folder_id + '/VIBE_result')

vibe_cmd_process()
