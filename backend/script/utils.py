def ffmpeg_convert_to_avi(filename, output="tmp.avi"):
    cmd = ['ffmpeg', "-y",
           "-i", filename,
           "-c:v", "libx264",
           "-c:a", "libmp3lame",
           "-b:a", "384K",
           output]

    subprocess.call(cmd)

    return output


# !/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Sep 20 22:04:17 2021

@author: yujiaohao
"""
import cv2
import os.path as osp
import os
from PIL import Image
import numpy as np
import struct
from matplotlib import pyplot as plt
import sys
import subprocess

# plt.rcParams['animation.ffmpeg_path'] = 'E:/2020 summer/TotalCapture_tool/TotalCapture-Toolbox-master/ffmpeg/bin/ffmpeg' #make sure you download FFmpeg files for windows 10 from https://ffmpeg.zeranoe.com/builds/
# #remember to change the video fps here
# FFwriter=animation.FFMpegWriter(fps=60, extra_args=['-vcodec', 'libx264'])

path = '../output'
ffmpeg = 'ffmpeg'
ffprobe = "/usr/local/bin/ffprobe"


def interp_(A):
    ok = ~np.isnan(A)
    xp = ok.ravel().nonzero()[0]
    fp = A[~np.isnan(A)]
    x = np.isnan(A).ravel().nonzero()[0]

    A[np.isnan(A)] = np.interp(x, xp, fp)
    return A


def downsample_video(video_input_path, video_output_path):
    c = 'ffmpeg -y -i ' + video_input_path + ' -r 30 -c:v libx264 -b:v 3M -strict -2 -movflags faststart ' + video_output_path
    subprocess.call(c, shell=True)


# =============================================================================
# coords transform from cam to global_tracking when facing cam
# =============================================================================
def coords_trans_face(p):
    pos_r = np.zeros_like(p)
    pos_r[:, 0] = p[:, 2]
    pos_r[:, 1] = p[:, 1]
    pos_r[:, 2] = -1 * p[:, 0]
    return pos_r


# =============================================================================
# coords transform from cam to global_tracking when back cam
# =============================================================================
def coords_trans_back(p):
    pos_r = np.zeros_like(p)
    pos_r[:, 0] = -1 * p[:, 2]
    pos_r[:, 1] = p[:, 1]
    pos_r[:, 2] = p[:, 0]
    return pos_r


def mkdir_ifnotexists(dir):
    if os.path.exists(dir):
        return
    os.mkdir(dir)


# Reads an image and returns a normalized float buffer (0-1 range). Corrects
# rotation based on EXIF tags.
def load_image(file_name, max_size=None, align=1, suppress_messages=False, short_side_target=False):
    img, angle = load_image_angle(
        file_name, max_size, align=align, suppress_messages=suppress_messages, short_side_target=short_side_target,
    )
    return img


# resizes the image
def resize_to_target(image, max_size, align=1, suppress_messages=False, short_side_target=False):
    if not suppress_messages:
        print("Original size: %d x %d" % (image.shape[1], image.shape[0]))
    H, W = image.shape[:2]
    if short_side_target:
        target_side = float(min(W, H))
    else:
        target_side = float(max(W, H))

    scale = min(1.0, max_size / target_side)
    resized_height = int(H * scale)
    resized_width = int(W * scale)
    if resized_width % align != 0:
        resized_width = align * round(resized_width / align)
        if not suppress_messages:
            print("Rounding width to closest multiple of %d." % align)
    if resized_height % align != 0:
        resized_height = align * round(resized_height / align)
        if not suppress_messages:
            print("Rounding height to closest multiple of %d." % align)

    if not suppress_messages:
        print("Resized: %d x %d" % (resized_width, resized_height))
    image = cv2.resize(
        image, (resized_width, resized_height), interpolation=cv2.INTER_AREA
    )
    return image


def load_image_angle(
        file_name, max_size=None, min_size=None,
        angle=0, align=1, suppress_messages=False,
        short_side_target=False,
):
    with Image.open(file_name) as img:
        if hasattr(img, "_getexif") and img._getexif() is not None:
            # orientation tag in EXIF data is 274
            exif = dict(img._getexif().items())

            # adjust the rotation
            if 274 in exif:
                if exif[274] == 8:
                    angle = 90
                elif exif[274] == 6:
                    angle = 270
                elif exif[274] == 3:
                    angle = 180

        if angle != 0:
            img = img.rotate(angle, expand=True)

        img = np.float32(img) / 255.0

        if max_size is not None:
            if min_size is not None:
                img = cv2.resize(
                    img, (max_size, min_size), interpolation=cv2.INTER_AREA)
            else:
                img = resize_to_target(
                    img, max_size, align=align, suppress_messages=suppress_messages, short_side_target=short_side_target
                )

        return img, angle

    return [[]], 0.0


# Save image to binary file, so that it can be read in C++ with
# #include "compphotolib/core/CvUtil.h"
# freadimg(fileName, image);
def save_raw_float32_image(file_name, image):
    with open(file_name, "wb") as f:
        CV_CN_MAX = 512
        CV_CN_SHIFT = 3
        CV_32F = 5

        dims = image.shape
        h = 0
        w = 0
        d = 1
        if len(dims) == 2:
            h, w = image.shape
            float32_image = np.transpose(image).astype(np.float32)
        else:
            h, w, d = image.shape
            float32_image = np.transpose(image, [2, 1, 0]).astype("float32")

        cv_type = CV_32F + ((d - 1) << CV_CN_SHIFT)

        pixel_size = d * 4

        if d > CV_CN_MAX:
            raise Exception("Cannot save image with more than 512 channels")
        f.write(struct.pack("i", h))
        f.write(struct.pack("i", w))
        f.write(struct.pack("i", cv_type))
        f.write(struct.pack("Q", pixel_size))  # Write size_t ~ uint64_t

        # Set buffer size to 16 MiB to hide the Python loop overhead.
        buffersize = max(16 * 1024 ** 2 // image.itemsize, 1)

        for chunk in np.nditer(
                float32_image,
                flags=["external_loop", "buffered", "zerosize_ok"],
                buffersize=buffersize,
                order="F",
        ):
            f.write(chunk.tobytes("C"))


# downsample img to 384,224
def downscale_frames(
        subdir, ext, max_size=384, align=32, full_subdir="color_full",
        short_side_target=False,
):
    full_dir = osp.join(path, full_subdir)
    print(path)
    print(subdir)
    down_dir = osp.join(path, subdir)

    mkdir_ifnotexists(down_dir)

    frame_count = len(os.listdir(full_dir))
    for i in range(frame_count):
        full_file = "%s/frame_%06d.png" % (full_dir, i)
        down_file = ("%s/frame_%06d." + ext) % (down_dir, i)
        suppress_messages = (i > 0)
        image = load_image(
            full_file, max_size=max_size, align=align,
            suppress_messages=suppress_messages, short_side_target=short_side_target
        )
        # image = image[..., ::-1]  # Channel swizzle

        if ext == "raw":
            save_raw_float32_image(down_file, image)
        else:
            cv2.imwrite(down_file, image * 255)


import matplotlib.patches as patches


def plot_bbox(im, minx, miny):
    # Create figure and axes
    fig, ax = plt.subplots()

    # Display the image
    ax.imshow(im)

    # Create a Rectangle patch
    rect = patches.Rectangle((minx, miny), 10, 10, linewidth=1, edgecolor='r', facecolor='none')

    # Add the patch to the Axes
    ax.add_patch(rect)

    plt.show()


def plot_large_bbox(im, minx, miny, maxx, maxy):
    # Create figure and axes
    fig, ax = plt.subplots()

    # Display the image
    ax.imshow(im)

    w = maxx - minx
    h = maxy - miny
    # Create a Rectangle patch
    rect = patches.Rectangle((minx, miny), w, h, linewidth=1, edgecolor='r', facecolor='none')

    # Add the patch to the Axes
    ax.add_patch(rect)

    plt.show()


def ffmpeg_extract_subclip(filename, t1, t2, targetname=None):
    """ Makes a new video file playing video file ``filename`` between
        the times ``t1`` and ``t2``. """
    name, ext = os.path.splitext(filename)
    if not targetname:
        T1, T2 = [int(1000 * t) for t in [t1, t2]]
        targetname = "%sSUB%d_%d.%s" % (name, T1, T2, ext)

    if t1 == 0:
        t1 = 1

    cmd = ['ffmpeg', "-y",
           "-ss", "%0.2f" % t1,
           "-i", filename,
           "-t", "%0.2f" % (t2 - t1),
           "-map", "0", "-vcodec", "copy", "-acodec", "copy", targetname]

    subprocess.call(cmd)


def extract_frames(video_file, frame_dir):
    # frame_dir = "%s/color_full" % path
    mkdir_ifnotexists(frame_dir)

    if not os.path.exists(video_file):
        sys.exit("ERROR: input video file " + video_file + " not found.")

    cmd = "%s -i %s -start_number 0 -vsync 0 %s/frame_%%06d.png" % (
        ffmpeg,
        video_file,
        frame_dir,
    )
    print(cmd)
    os.popen(cmd).read()


def images_to_video(img_folder, output_vid_file):
    os.makedirs(img_folder, exist_ok=True)

    command = [
        'ffmpeg', '-y', '-threads', '16', '-i', f'{img_folder}/frame_%06d.png', '-profile:v', 'baseline',
        '-level', '3.0', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', '-v', 'error', output_vid_file,
    ]

    print(f'Running \"{" ".join(command)}\"')
    subprocess.call(command)


def projection_matrix(fx, fy, G) -> np.array:
    """
    Compute projection matrix K from intrinsics s.t.,
    [u, v, 1]' = K * [x, y, z]'
    Note that pixel coordinate v is flipped
    Args:
        intr (B, 4): [[fx, fy, cx, cy]]
    Returns:
        K (B, 3, 3)
    """

    o = 1
    z = 0
    K = np.array([
        -fx, z, z,
        z, fy, z,
        z, z, o,
    ]).reshape(3, 3)

    P = np.matmul(K, G[:3, :])

    return P
