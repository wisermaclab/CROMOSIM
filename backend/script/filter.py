"""
Created on Tue Sep 28 09:33:41 2021
1.Kalman filter the bbox center position, it should not change too much between frames
2.estimate scale with height/motion area

@author: hao_y
"""

from pykalman import KalmanFilter
import numpy as np


def kf2d(measurements):
    initial_state_mean = [measurements[0, 0],
                          0,
                          measurements[0, 1],
                          0]

    transition_matrix = [[1, 1, 0, 0],
                         [0, 1, 0, 0],
                         [0, 0, 1, 1],
                         [0, 0, 0, 1]]

    observation_matrix = [[1, 0, 0, 0],
                          [0, 0, 1, 0]]

    kf1 = KalmanFilter(transition_matrices=transition_matrix,
                       observation_matrices=observation_matrix,
                       initial_state_mean=initial_state_mean)

    kf1 = kf1.em(measurements, n_iter=10)

    (smoothed_state_means, smoothed_state_covariances) = kf1.smooth(measurements)

    #plt.figure(1)
    times = range(measurements.shape[0])
    #plt.plot(times, measurements[:, 0], 'bo',
    #         times, measurements[:, 1], 'ro',
    #         times, smoothed_state_means[:, 0], 'b--',
    #         times, smoothed_state_means[:, 2], 'r--', )
    #plt.show()
    return smoothed_state_means[:, 0], smoothed_state_means[:, 2]


def kf3d(measurements):
    initial_state_mean = [measurements[0, 0],
                          0,
                          measurements[0, 1],
                          0,
                          measurements[0, 2],
                          0]

    dt = 1 / 30
    transition_matrix = np.array([[1, dt, 0, 0, 0, 0],
                                  [0, 0, 1, dt, 0, 0],
                                  [0, 0, 0, 0, 1, dt],
                                  [0, 0, 0, 1, 0, 0],
                                  [0, 0, 0, 0, 1, 0],
                                  [0, 0, 0, 0, 0, 1]], np.float32)

    # transition_matrix = np.array([[1,0,0,0,0,0],
    #                               [0,0,1,0,0,0],
    #                               [0,0,0,0,1,0],
    #                               [0,dt,0,0,0,0],
    #                               [0,0,0,dt,0,0],
    #                               [0,0,0,0,0,dt]],np.float32)

    observation_matrix = [[1, 0, 0, 0, 0, 0],
                          [0, 0, 1, 0, 0, 0],
                          [0, 0, 0, 0, 1, 0]]

    kf1 = KalmanFilter(transition_matrices=transition_matrix,
                       observation_matrices=observation_matrix,
                       initial_state_mean=initial_state_mean)

    kf1 = kf1.em(measurements, n_iter=10)
    (smoothed_state_means, smoothed_state_covariances) = kf1.smooth(measurements)

    return smoothed_state_means[:, 0], smoothed_state_means[:, 2], smoothed_state_means[:, 4]


# detect jitter value in measurements and average it out by neighbor, for smooth
def jitter(measurements, thres=5):
    m, n = measurements.shape
    for i in range(1, m - 1):
        for j in range(n):
            if measurements[i, j] - measurements[i - 1, j] > thres * (measurements[i + 1, j] - measurements[i - 1, j]):
                # print('jitter detected!')
                measurements[i, j] = (measurements[i + 1, j] + measurements[i - 1, j]) / 2
    return measurements[:, 0], measurements[:, 1]


# detect wrong size dynamic masks,average out its center
def check_mask(idx, idy):
    idx.max() - idx.min()