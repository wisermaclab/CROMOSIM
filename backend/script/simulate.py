import sys
import os
import numpy as np
from keras.models import model_from_json
from scipy import signal

def load_acc_model():
    root_dir = os.getcwd()
    # gravity center of 3 triangles
    print("start load")
    json_file = open(root_dir + '/trained_model/video_acc/regress_video_acc.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    print(loaded_model_json)
    model = model_from_json(loaded_model_json)
    # load weights into new model
    model.load_weights(root_dir + '/trained_model/video_acc/regress_video_acc_weights.h5')
    print("Loaded model from disk")
    print(model.summary())
    return model

def load_gyro_model():
    root_dir = os.getcwd()
    # gravity center of 3 triangles
    print("start load")
    json_file = open(root_dir + '/trained_model/video_gyro/regress_video_gyro.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    print(loaded_model_json)
    model = model_from_json(loaded_model_json)
    # load weights into new model
    model.load_weights(root_dir + '/trained_model/video_gyro/regress_video_gyro_weights.h5')
    print("Loaded model from disk")
    print(model.summary())
    return model

def make_context_window(x_raw, L, s):
    root_dir = os.getcwd()
    m, n = x_raw.shape
    res = []
    i = 0
    while i <= m:
        if i == 0:
            ind1 = i*(L-s)
        else:
            ind1 = ind2-2
        ind2 = ind1+L
        if ind1 >= m:
            break
        if ind2 > m and ind1 < m:
            mzeros = np.zeros((ind2-m, n))
            temp = np.vstack((x_raw[ind1:m, :], mzeros))
            res.append(temp)
            break
        temp = x_raw[ind1:ind2, :]
        temp = temp - temp[0]
        res.append(temp)
        i = i+1
    res = np.stack(res, axis=0)
    return res

def convert_list(my_list):
    length = len(my_list)
    if length==0:
        return
    res = my_list[0]
    for i in range(1,length):
        res = np.vstack((res,my_list[i]))
    return res

def butter_lowpass(cutoff, nyq_freq, order=4):
    normal_cutoff = float(cutoff) / nyq_freq
    b, a = signal.butter(order, normal_cutoff, btype='lowpass')
    return b, a

def butter_lowpass_filter(data, cutoff_freq, nyq_freq, order=4):
    b, a = butter_lowpass(cutoff_freq, nyq_freq, order=order)
    y = signal.filtfilt(b, a, np.ravel(data))
    return y

def remove_noise(data, fc_lpf,fs):
    """Remove noise from accelerometer data via low pass filter
    INPUT:
        data -- input accelerometer data Nx3 (x, y, z axis)
        fc_lpf -- low pass filter cutoff frequency
    OUTPUT:
        lpf_output -- filtered accelerometer data Nx3 (x, y, z axis)
    """

    # the number of accelerometer readings
    num_data = data[:,0].shape[0]
    # lpf_output is used to store the filtered accelerometer data by low pass filter
    lpf_output = np.zeros((num_data, 3))

    # compute linear acceleration for x axis
    acc_X = data[:,0]
    butterfilter_output= butter_lowpass_filter(acc_X, fc_lpf, fs/2)
    lpf_output[:,0] = butterfilter_output.reshape(1, num_data)

    # compute linear acceleration for y axis
    acc_Y = data[:,1]
    butterfilter_output= butter_lowpass_filter(acc_Y, fc_lpf, fs/2)
    lpf_output[:,1] = butterfilter_output.reshape(1, num_data)

    # compute linear acceleration for z axis
    acc_Z = data[:,2]
    butterfilter_output= butter_lowpass_filter(acc_Z, fc_lpf, fs/2)
    lpf_output[:,2] = butterfilter_output.reshape(1, num_data)

    return lpf_output

def simulate_process():
    folder_id = sys.argv[1]
    v_filename = sys.argv[2]

    f = open(v_filename, "r")
    selected_input = f.read()
    print(selected_input)

    result = []
    result = np.array(result)
    tmp_input = selected_input.split(';')
    
    for ti in tmp_input:
        v_tmp = ti.split(',')
        v_tmp = list(map(float, v_tmp))
        if result.size == 0:
            result = np.array([v_tmp])
        else:
            result = np.concatenate((result, np.array([v_tmp])), axis=0)

    print(result)
    root_dir = os.getcwd()
    path = root_dir + '/temp/'+folder_id+"/"
    
    m = load_acc_model()
    pw = make_context_window(result, 60, 0)
    n_input = 27
    a_pred = []
    for i in range(pw.shape[0]-1):
        #a = m.predict(pw[i].reshape(1,60,n_input))
        a = m.predict(pw[i].reshape(1,60,n_input))
        a_pred.append(a[0,1:-1,:])
        
    traj_file_name = os.path.join(path, 'acc_result.txt')
    print(a_pred)
    acc_pred = convert_list(a_pred)
    print(acc_pred)
    np.savetxt(traj_file_name, acc_pred)

    gyro_m = load_gyro_model()
    g_pred = []
    for i in range(pw.shape[0]):
        p = pw[i]
        # p = p - p[0,:]
        g = gyro_m.predict(p.reshape(1,60,n_input))
        #g_pred.append(g[0,1:-1,:]*2)
        g_pred.append(g[0,1:-1,:]*10)

    gyro_file_name = os.path.join(path, 'gyro_result.txt')
    gyro_pred = convert_list(g_pred)
    gyro_pred = gyro_pred[:-1]
    gyro_pred_filter = remove_noise(gyro_pred, 10, 60)
    print(gyro_pred_filter)
    np.savetxt(gyro_file_name, gyro_pred_filter)

simulate_process()

import subprocess, json

folder_id = sys.argv[1]
path = '/temp/'+folder_id+"/"
video_path = path+'step_1_result.mp4'
result = subprocess.check_output(f'ffprobe -v quiet -show_streams -select_streams v:0 -of json "{video_path}"',shell=True).decode()
fields = json.loads(result)['streams'][0]

duration = fields['duration']
f = open(path+"video_length.txt", "w")
f.write(duration)
f.close()