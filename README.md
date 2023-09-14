# CROMOSIM
<b> CROMOSim </b> is an open source tool for synthesizing IMU sensor measurements from MoCap and video data. 
![overall](https://github.com/wisermaclab/CROMOSIM/assets/42444950/c9cec2dd-2c02-45c9-9864-ec290d8348e1)

More information on the design of CROMOSIM pipeline can be found:
<ul>
  <li>Hao, Yujiao, Boyu Wang, and Rong Zheng. <a href="https://ieeexplore.ieee.org/abstract/document/9992037">"CROMOSim: A Deep Learning-based Cross-modality Inertial Measurement Simulator."</a> IEEE Transactions on Mobile Computing, 2022 (early access) (<a href="https://arxiv.org/abs/2202.10562">arxiv version</a>)</li>
</ul>

      
## Core features 
CROMOSIM has also been implemented as a web service for ease of use. One caveat is due to the high computation complexity of robust CVD, for videos, users have to run robust CVD separately and provide the results as inputs to CROMOSIM. Details of the implementation can be found [here](https://github.com/wisermaclab/CROMOSIM/blob/main/Report/web%20service%20report.pdf). 

[![See a video demo](https://img.youtube.com/vi/VYCFZWOUkpI/maxresdefault.jpg)](https://youtu.be/VYCFZWOUkpI)
<ul>
  <li><b>Web Frontend:</b> The front-end provides a graphic user interface allowing users to interact with the pipeline and determine sensor placements by maniputing the 3D rendering of SMPL model mesh.</li>
  <li><b>Web Backend:</b> Execute the pre-trained CROMOSIM models and produce the synthetic data.</li>  
</ul>

## Contributors
<ul>
  <li>Yujia Hao and Xijian Luo mainly contribute to the development of the CROMOSIM pipeline.</li>
  <li>Liang Xu is the key contributor to the development of web front and backends.</li>
</ul>

## Citation
Please consider citing this work if you find this repo is useful for your projects.

```
@article{hao2022cromosim,
  title={Cromosim: A deep learning-based cross-modality inertial measurement simulator},
  author={Hao, Yujiao and Lou, Xijian and Wang, Boyu and Zheng, Rong},
  journal={IEEE Transactions on Mobile Computing},
  year={2022},
  publisher={IEEE}
}
```
