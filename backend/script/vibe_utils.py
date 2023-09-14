"""
Created on Mon Mar  1 14:17:34 2021
pure toolbox, no data instances
@author: hao_y
"""

import os
import numpy as np


def convert_list(my_list):
    length = len(my_list)
    if length == 0:
        return
    res = my_list[0]
    for i in range(1, length):
        if my_list[i] is None or my_list[i].size == 0:
            print('empty array!')
            continue
        res = np.vstack((res, my_list[i]))
    return res


def load_cvd():
    """
    Parameters
    ----------
    sid : subject id
    acting : name of action
    cid : video clip id

    Returns
    -------
    None.

    """
    res = []
    filepath = 'temp/traj.txt'
    if os.path.exists(filepath):
        res.append(np.loadtxt(filepath))
    else:
        print('file not exist')

    res = convert_list(res)
    return res


def coordinates_change(p):
    pos_r = np.zeros_like(p)
    pos_r[:,0] = 1 * p[:,0]
    pos_r[:,1] = -1* p[:,1]
    pos_r[:,2] = -1 * p[:,2]
    return pos_r


def add_global(global_, vibe_): #with a factor 1
    factor = 2
    res = np.zeros_like(vibe_)
    for i in range(9):
        print(global_)
        print(vibe_[:,i*3:(i+1)*3])
        res[:,i*3:(i+1)*3] = global_ + factor * vibe_[:,i*3:(i+1)*3]
    return res
