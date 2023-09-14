#!/usr/bin/python

import os

import joblib
import numpy as np
import sys

def vibe_main_process():
    """ Method:
    Data processing for VIBE results from cmd procedure
    Extract vertexes coordinates of all frames from the pkl file and stored as a text file in temporary folder
    Used by model widget
    :return: None
    """
    
    folder_id = sys.argv[1]
    
    # Load VIBE result
    #vibe_results = joblib.load("temp/" + folder_id + "/VIBE_result/vibe_output.pkl")
    vibe_results = joblib.load("/temp/" + folder_id + "/VIBE_result/vibe_output.pkl")
    ids = []
    # print(vibe_results[1])
    for person_id in vibe_results.keys():
        ids.append(person_id)
    if len(ids) > 1:
        print('more than one person detected!')

    # mesh_color = {k: colorsys.hsv_to_rgb(np.random.rand(), 0.5, 1.0) for k in vibe_results.keys()}
    # only 1 in vibe_results.keys() means person with id:1
    person1 = vibe_results[1]
    frame_verts = person1['verts']  # coords of tri_mesh
    frame_joints = person1['joints3d']
    # print(frame_verts)
    # print(len(frame_verts))
    frame_idx = person1['frame_ids']  # shows the idx of verts, starts from 0
    # print(frame_idx)
    true_idx = np.arange(0, frame_idx.max() + 1, 1)  # don't miss the +1 when generate true idx
    print('Number of total frame is: ', true_idx.shape[0])

    n = true_idx.shape[0]
    m = frame_idx.shape[0]
    # res = findMissing(true_idx, frame_idx, n, m) #missed frame idx are here(has bug!)
    print('The number of missing frame in this prediction is: ', n - m)

    # fill the lost frames with nan,nan,nan
    zeros = np.empty((1, 3))
    zeros[:] = np.nan
    j = 0
    v_number = len(frame_verts[0])

    # load cvd result
    # cvd_result = load_cvd()
    # cvd_result = coordinates_change(cvd_result)  # coords now in accord with the vibe tri_coords
    # cvd_result = 1.2 * cvd_result
    # print(len(cvd_result))
    # print(cvd_result)

    # tmp_v = frame_verts[::2]
    # print(len(tmp_v))
    # print(tmp_v)

    # tri_coords = add_global(cvd_result, frame_verts)
    # print(len(tri_coords))
    # print(tri_coords)

    # Re-construct data format and fill empty frames
    #gen_tri_dir = 'temp/' + folder_id + '/VIBE_result/verts/'
    #gen_joint_dir = 'temp/' + folder_id + '/VIBE_result/joints/'
    gen_tri_dir = '/temp/' + folder_id + '/VIBE_result/verts/'
    gen_joint_dir = '/temp/' + folder_id + '/VIBE_result/joints/'
    os.mkdir(gen_tri_dir)
    os.mkdir(gen_joint_dir)
    for i in true_idx:
        tri_dir = gen_tri_dir + 'tri_coords_frame' + str(i) + '.txt'
        joint_dir = gen_joint_dir + 'joint_coords_frame' + str(i) + '.txt'
        if i != frame_idx[j]:
            v_tmp = []
            for _ in range(v_number):
                v_tmp.append(zeros)
            np.savetxt(tri_dir, v_tmp)

        else:
            v_per_frame = frame_verts[j]
            for v in v_per_frame:
                v[[0, 1, 2]] = v[[0, 2, 1]]
            v_per_frame = np.negative(v_per_frame)
            np.savetxt(tri_dir, v_per_frame)
            #
            j_per_frame = frame_joints[j]
            for v in j_per_frame:
                v[[0, 1, 2]] = v[[0, 2, 1]]
            j_per_frame = np.negative(j_per_frame)
            np.savetxt(joint_dir, j_per_frame)
            #
            j += 1

vibe_main_process()
