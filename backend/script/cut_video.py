#!/usr/bin/python

import sys
import subprocess
import os

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

video_addr = sys.argv[1]
start_time = int(sys.argv[2])
end_time = int(sys.argv[3])
output_addr = sys.argv[4]

ffmpeg_extract_subclip(video_addr,
                        start_time,
                        end_time,
                        targetname=output_addr)
