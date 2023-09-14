"""
Created on Mon Sep 20 22:04:17 2021

@author: yujiaohao
"""

import os
import numpy as np
import json
import sys
import cv2
import torch
import struct
import matplotlib.pyplot as plt


# read .json file, get the location and confidence of torso prediction
def load_torso(file_name):
    if not os.path.exists(file_name):
        sys.exit("ERROR: input video file '%s' not found.", file_name)
    with open(file_name) as f:
        data = json.load(f)

    # print(data)
    if not data['people']:
        return np.array([np.nan, np.nan, np.nan])
    data = data['people'][0]
    j2ds = data['pose_keypoints_2d']
    i = 8  # id of mid-hip
    res = j2ds[int(i * 3):int(i * 3 + 3)]
    return res


# Load image from binary file in the same way as read in C++ with
# #include "compphotolib/core/CvUtil.h"
# freadimg(fileName, image);
def load_raw_float32_image(file_name):
    with open(file_name, "rb") as f:
        CV_CN_MAX = 512
        CV_CN_SHIFT = 3
        CV_32F = 5
        I_BYTES = 4
        Q_BYTES = 8

        h = struct.unpack("i", f.read(I_BYTES))[0]
        w = struct.unpack("i", f.read(I_BYTES))[0]

        cv_type = struct.unpack("i", f.read(I_BYTES))[0]
        pixel_size = struct.unpack("Q", f.read(Q_BYTES))[0]
        d = ((cv_type - CV_32F) >> CV_CN_SHIFT) + 1
        assert d >= 1
        d_from_pixel_size = pixel_size // 4
        if d != d_from_pixel_size:
            raise Exception(
                "Incompatible pixel_size(%d) and cv_type(%d)" % (pixel_size, cv_type)
            )
        if d > CV_CN_MAX:
            raise Exception("Cannot save image with more than 512 channels")

        data = np.frombuffer(f.read(), dtype=np.float32)
        result = data.reshape(h, w) if d == 1 else data.reshape(h, w, d)
        return result


def load_image(
        path: str,
        channels_first: bool,
        post_proc_raw=lambda x: x,
        post_proc_other=lambda x: x,
) -> torch.FloatTensor:
    if os.path.splitext(path)[-1] == ".raw":
        im = load_raw_float32_image(path)
        im = post_proc_raw(im)
    else:
        im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        im = post_proc_other(im)
    im = im.reshape(im.shape[:2] + (-1,))

    if channels_first:
        im = im.transpose((2, 0, 1))
    # to torch
    return torch.tensor(im)


def load_color(path: str, channels_first: bool) -> torch.FloatTensor:
    """
    Returns:
        torch.tensor. color in range [0, 1]
    """
    im = load_image(
        path,
        channels_first,
        post_proc_raw=lambda im: im[..., [2, 1, 0]] if im.ndim == 3 else im,
        post_proc_other=lambda im: im / 255,
    )
    return im


def show(img):
    if type(img) is not np.ndarray:
        img = img.numpy()
        plt.imshow(np.transpose(img, (1, 2, 0)), interpolation='nearest')
    else:
        plt.imshow(img)


def load_dynamic_part(path):
    image = cv2.imread(path)
    # show(image)
    return image[:, :, 0]  # values are the same for each channel


def load_real_depth(path):
    image_filtered = load_color(path, channels_first=True)  # [1, 384, 224] shape
    # show(image_filtered)
    real_depth = 1 / image_filtered  # is it in meter or inch?
    # real_depth = image_filtered
    return real_depth[0, :, :] * 0.001


def load_cam_params(path):
    cam_params = np.load(path)
    fx = cam_params['hF']
    fy = cam_params['vF']
    G = cam_params['world2cam']
    return fx, fy, G


def vee(R):
    x1 = R[2, 1] - R[1, 2]
    x2 = R[0, 2] - R[2, 0]
    x3 = R[1, 0] - R[0, 1]
    return np.array([x1, x2, x3])


def pose_distance(G):  # cam_extrinsics
    R, t = G[:3, :3], G[:3, 3]
    r = vee(R)
    dR = np.sqrt(np.sum(r ** 2))
    dt = np.sqrt(np.sum(t ** 2))
    return dR + dt


def take_average_depth(depth_map, cx, cy):
    # take a 10X10 small clip centered by (cx,cy), get avg depth
    minx = int(cx - 5)
    maxx = int(cx + 5)
    miny = int(cy - 5)
    maxy = int(cy + 5)
    depth = depth_map[miny:maxy, minx:maxx]
    # plot_bbox(depth_map, minx, miny)
    return np.mean(depth)


def take_average_wp(depth_map, cx, cy, fx, fy, G, subx, suby):
    # take a 10X10 small clip centered by (cx,cy), get avg depth
    # if it is larger than the torso size, then resize it!
    minx = int(cx - 5)
    maxx = int(cx + 5)
    miny = int(cy - 5)
    maxy = int(cy + 5)

    H, W = depth_map.shape
    other_p = []
    for i in range(minx, maxx):
        for j in range(miny, maxy):
            # get 3d position(x,y,z) for current frame
            if j >= H:
                j = H - 1
            elif i >= W:
                i = W - 1
            z = depth_map[j, i]
            x = (subx - W / 2) * z / fx  # assume cx,cy is always at img center
            y = (suby - H / 2) * z / fy

            # from P_cam to P_world with cam_extrinsics
            R = G[:3, :3]
            t = G[:3, 3]
            p = np.array([x, y, z])
            # X = np.matmul(R.T,p) - np.matmul(R.T,t)
            X = np.matmul(R.T, (p - t))
            other_p.append(X)
    r = np.array(other_p)
    return r.mean(axis=0)


def plot3d(p):
    fig = plt.figure()
    ax = plt.axes(projection='3d')
    ax.plot3D(p[:, 0], p[:, 1], p[:, 2], 'gray')  # the scale is incorrect
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    ax.set_zlabel('z')
    ax.scatter3D(p[0, 0], p[0, 1], p[0, 2], '-')
