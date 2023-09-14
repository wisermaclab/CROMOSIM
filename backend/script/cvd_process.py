#!/usr/bin/python

from utils import extract_frames, downscale_frames, images_to_video, interp_, coords_trans_face
from filter import kf2d, kf3d
from cvd_utils import *

import subprocess
import shutil
import os, zipfile, sys


def cvd_main_process():
    # =============================================================================
    # downscale video for openpose
    # =============================================================================
    folder_id = sys.argv[1]

    os.environ["KMP_DUPLICATE_LIB_OK"]="TRUE"

    #root_dir = os.getcwd()
    root_dir = ""
    # root_dir = root_dir + '\..'
    print(root_dir)
    # clip_id = 3
    # sub_id = 2
    act = 'walking3'
    # path = '../TC_S'+str(sub_id)+'_'+act+'_cam1/'
    path = root_dir + '/temp/'+folder_id+"/"

    extension = ".zip"
    for item in os.listdir(path): # loop through items in dir
        if item.endswith(extension): # check for ".zip" extension
            file_name = "temp/"+folder_id+"/"+item # get full path of files
            print(file_name)
            zip_ref = zipfile.ZipFile(file_name) # create zipfile object
            zip_ref.extractall(path+'CVD_result/') # extract file to dir
            zip_ref.close() # close file
            os.remove(file_name) # delete zipped file
    
    video_file = path + 'step_1_result.mp4'
    # frame_dir = path + '/clip' + str(clip_id) + '/'
    frame_dir = path + 'clip/'
    ext = 'png'

    if not os.path.exists(frame_dir):  # if not extracted video into frames, do it
        extract_frames(video_file, frame_dir)  # video in frames

    subdir = frame_dir[:-1] + '_downscale'
    if not os.path.exists(subdir):  # if not downscaled, do it
        downscale_frames(
            subdir=subdir, ext=ext, full_subdir=frame_dir
        )

    # output_vid_file = 'clip.mp4'
    output_vid_file = root_dir + '/temp/' + folder_id + '/clip.mp4'
    images_to_video(subdir, output_vid_file)  # frames back into a video

    # if not exist, call openpose with cmd
    # openpose_dir = 'C:/Users/Xulia/Downloads/openpose/'
    openpose_dir = '/openpose/'
    os.chdir(openpose_dir)
    # j2d_dir = 'C:/Users/Xulia/Desktop/maei/az/' + str(clip_id) + '_2dj'
    j2d_dir = root_dir + '/temp/' + folder_id + '/tmp_2dj'
    if not os.path.exists(j2d_dir):
        command = [
            './build/examples/openpose/openpose.bin', '--video', output_vid_file, '--write_json',
            j2d_dir, '--render_pose=0', '--no_gui_verbose', '--display=0', '--cli_verbose=1'
        ]
        print(f'Running \"{" ".join(command)}\"')
        subprocess.call(command)

    frame_count = len(os.listdir(j2d_dir))
    res = []
    for i in range(frame_count):
        full_file = "%s/clip_%012d_keypoints.json" % (j2d_dir, i)
        r = load_torso(full_file)
        res.append(r)

    res = np.array(res).reshape(-1, 3)

    # =============================================================================
    # change back to project dir
    # replace previous subx, suby with openpose detected joints
    # =============================================================================

    # os.chdir('E:/2021_Fall/global_motion/src')
    # os.chdir(root_dir)
    os.chdir("/")
    # delete temporal foler and mp4 file
    shutil.rmtree(frame_dir)
    shutil.rmtree(subdir)
    os.remove(output_vid_file)

    dt_path = root_dir + '/temp/' + folder_id + '/CVD_result/content/family_run_output'
    num_frames = 500
    frame_Path_midas = dt_path + '/R0-' + str(
        num_frames) + '_hierarchical2_midas2/StD100.0_StR1.0_SmD0_SmR0.0/depth_e0000/depth'
    frame_Path_filtered = dt_path + '/R0-' + str(
        num_frames) + '_hierarchical2_midas2/StD100.0_StR1.0_SmD0_SmR0.0/depth_e0000/e0000_filtered/depth'

    # load saved cam_params per frame
    camera_path = dt_path + '/camera_params'

    # =============================================================================
    # 1. downsample dynamic masked img to [1, 384, 224]
    # 2. locate ids of 0 in mask, search corredsponding depth at body center
    # 3. load cam params and calculate 3d motion
    # =============================================================================
    # step1:
    # subdir = dt_path + '/dynamic_mask_downscale'
    # full_subdir = dt_path + '/dynamic_mask'
    # ext = 'png'
    # align = 32
    # if not os.path.exists(subdir):  #downscale dynamic mask if hasn't done yet
    #     downscale_frames(
    #         subdir=subdir, ext=ext, full_subdir=full_subdir
    #     )

    frame_count = min(len(os.listdir(camera_path)), len(res))
    print(frame_count)

    # frame_count = 288
    pos_res, cam = [], []
    d = np.array([0, 0, 0, 1])

    # =============================================================================
    # get raw torso center, filter
    # =============================================================================
    bbox, ratio = [], []
    temp_t_1 = 0
    for i in range(frame_count):
        # for i in range(80,95):
        v = res[i]
        if v[2] <= 0.5:
            print('bad prediction in frame: ', i)
            bbox.append((np.nan, np.nan))
        else:
            bbox.append((v[0], v[1]))

    bcenter = np.array(bbox)
    bx = interp_(bcenter[:, 0])
    by = interp_(bcenter[:, 1])
    bcenter = np.stack((bx, by)).T
    bx, by = kf2d(bcenter)
    # bx,by = jitter(bcenter)
    res = []
    for i in range(frame_count):
        # for i in range(210,220):
        # real depth estimation
        full_file = "%s/frame_%06d.raw" % (frame_Path_filtered, i)
        # full_file = "%s/frame_%06d.raw" % (frame_Path_midas, i)
        depth_real = load_real_depth(full_file).numpy()

        cam_path = "%s/frame_%06d.npz" % (camera_path, i)
        fx, fy, G = load_cam_params(cam_path)
        subx = bx.astype(int)[i]
        suby = by.astype(int)[i]

        mean_depth = take_average_depth(depth_real, subx, suby)

        # #get 3d position(x,y,z) for current frame
        H, W = depth_real.shape
        z = mean_depth
        x = (subx - W / 2) * z / fx  # assume cx,cy is always at img center
        y = (suby - H / 2) * z / fy
        # print(x,y,z)
        # print(pose_distance(G))
        pos_res.append(np.array([x, y, z]))

        # get cam_traj by tracking
        d = np.matmul(G, d)
        # print(d)
        cam.append(d)

        # from P_cam to P_world with cam_extrinsics
        R = G[:3, :3]
        t = G[:3, 3]
        p = np.array([x, y, z])
        # X = np.matmul(R.T,p) - np.matmul(R.T,t)
        X = np.matmul(R.T, (p - t))

        temp = take_average_wp(depth_real, subx, suby, fx, fy, G, subx, suby)
        res.append(temp)

    # p = pos_res[:] - pos_res[0] #translation pred from depth map
    # p = other_p[:] - other_p[0]
    p = res[:] - res[0]
    pfx, pfy, pfz = kf3d(p)
    pf = np.stack((-pfx, pfy, pfz)).T
    traj_file_name = os.path.join(root_dir, 'temp/' + folder_id + '/traj.txt')
    np.savetxt(traj_file_name, pf)
    print("end")

    # =============================================================================
    # p is not displacement, only scale error
    # d = np.array([0,0,0])
    # res = []
    # for i in range(len(other_p)):
    #     d = d + p[i]
    #     res.append(d)
    #
    # p = res[:] - res[0]
    # =============================================================================

    # c = cam[:] - cam[0] #translation pred from cam ego-motion

    # ax.plot3D(c[:,0], c[:,1], c[:,2], 'gray') #the scale is incorrect
    #plot3d(pf)

    pg = coords_trans_face(pf)
    #plot3d(pg)


cvd_main_process()
