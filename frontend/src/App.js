{/*
    Main web application page, handling page navigation and global data
    @Author: Liang Xu
* */}

import React from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, Link} from 'react-router-dom'
import VideoEditPage from "./pages/VideoEditPage";
import "./App.css"
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import SideBar from "./component/SideBar";
import axios from 'axios';
import ModelProcessPage from "./pages/ModelProcessPage";
import SensorSelectPage from "./pages/SensorSelectPage";
import MocapPage from "./pages/MocapPage";
import MocapSensorSelectPage from "./pages/MocapSensorSelectPage";

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import GestureIcon from '@mui/icons-material/Gesture';
import HelpIcon from '@mui/icons-material/Help';
import Modal from 'react-modal';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

import pic1_1 from "./image/step1_1.jpg"
import pic1_2 from "./image/step1_2.jpg"
import pic2_1 from "./image/step2_1.jpg"
import pic2_2 from "./image/step2_2.jpg"
import pic3_1 from "./image/step3_1.jpg"
import pic3_2 from "./image/step3_2.jpg"
import background from "./image/background.png"
import video from "./image/video.png"
import model from "./image/model.png"
import select from "./image/select.png"
import arrow from "./image/arrow.png"
import {blue} from "@mui/material/colors";
import {IconButton} from "@mui/material";


export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            start: false,
            isVideo: true,
            folder_id: Math.floor(Math.random() * 1000000),
            tmp_state: 0,
            video_src: "",
            stepComplete1: false,
            fileName1: '',
            fileName2: '',
            fileName3: '',
            uploading: 0,
            inProgress: false,
            stepComplete2: false,
            currentPage: 0,
            isOpen: false,
            pic1Id: 0,

            helpMain: false,
            helpVideo_1: false,
            helpVideo_2: false,
            helpModel_1: false,
            helpModel_2: false,
            helpSelect_1: false,
            helpSelect_2: false,

            cvdWhy:''
        };

        this.handleVideoChange = this.handleVideoChange.bind(this)
        this.handleFileNameChange = this.handleFileNameChange.bind(this)
        this.handleUploadingChange = this.handleUploadingChange.bind(this)
        this.handleProgressChange = this.handleProgressChange.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this)
        this.handleProcessChange = this.handleProcessChange.bind(this)
        this.handleReset1 = this.handleReset1.bind(this)
        this.handleReset2 = this.handleReset2.bind(this)
        this.handleResetAll = this.handleResetAll.bind(this)

    }

    /*
        Handling lifecycle events
     */
    beforeUnload = (e) => {
        const data = {
            'folder_id': this.state.folder_id
        };
        e.preventDefault();
        const response = axios.post('http://localhost:8080/endProcess', data);
    };
    onUnload = async (e) => {
        const data = {
            'folder_id': this.state.folder_id
        };
        const response = axios.post('http://localhost:8080/endProcess', data);
    };
    componentDidMount() {
        window.addEventListener('beforeunload', this.beforeUnload);
        window.addEventListener('unload', this.onUnload);
    }

    /*
        Handling selected video change
        Used in VideoEditPage
        @Param: url Video url generated from upload file
     */
    handleVideoChange(url) {
        this.setState({video_src: url})
    }

    /*
        Handling upload CVD results change
        used in ModelProcessPage
        @Param: name CVD result file name
        @Param: i Indicate which file it is
     */
    handleFileNameChange(name, i) {
        if (i === 1) {
            this.setState({fileName1: name})
        } else if (i === 2) {
            this.setState({fileName2: name})
        } else if (i === 3) {
            this.setState({fileName3: name})
        }
    }

    handleUploadingChange(s) {
        this.setState({uploading: s})
    }

    handleProgressChange() {
        this.setState({inProgress: true})
    }

    handlePageChange(i) {
        this.setState({currentPage: i})
        console.log(this.state.currentPage)
    }

    handleProcessChange(i) {
        if (i === 1) {
            this.setState({stepComplete1: true})
        } else if (i === 2) {
            this.setState({stepComplete2: true})
        }
    }

    /*
        Handling global and local reset
     */
    handleReset1() {
        this.setState({video_src: "", fileName1: "", fileName2: "", fileName3: "", inProgress: false})
    }
    handleReset2() {
        this.setState({fileName1: "", fileName2: "", fileName3: "", inProgress: false})
    }
    handleResetAll() {
        this.setState({inProgress: false, video_src: "", fileName1: "", fileName2: "", fileName3: "", start: false, folder_id: Math.floor(Math.random() * 1000000)})
    }

    render() {
        return (
            <div className="App">

                {this.state.start === false &&
                /*
                    Initial welcome page
                */
                        <div className="welcome" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
                            <div className="heading">CROMOSim</div>
                            <div className="heading2">-CROSS-MODALITY SENSOR SIMULATION</div>
                            <div className="description">CROMOSim is designed to simulate high fidelity virtual IMU sensor data from motion capture systems or monocular RGB cameras. It utilizes a skinned multi-person linear model (SMPL) for 3D body pose and shape representations, to enable simulation from arbitrary on-body positions.</div>
                            <div className="description">
                                To use this simulator, you have two options:
                                <ol>
                                    <li>Start with a input video, you will <a style={{color: "Maroon"}}>need</a> to provide:
                                        <ul>
                                            <li>A <a style={{color: "Maroon"}}>monocular video</a> that include actions of a single person.</li>
                                            <li>Output <a style={{color: "Maroon"}}>archive files</a> from
                                                <a href="https://colab.research.google.com/drive/1XJEYWXvRVqxJavJDnnzWfU5HUJLaxw9s#scrollTo=PFmcymZPEohB"> robust CVD method</a>.&nbsp;&nbsp;&nbsp;
                                                <HelpOutlineIcon color="success" onClick={() => this.setState({helpModel_1: true})}/>
                                            </li>
                                        </ul>
                                    </li>
                                    <br/>
                                    <li>Start with motion capture data, you will <a style={{color: "Maroon"}}>need</a> to provide:
                                        <ul>
                                            <li>A <a style={{color: "Maroon"}}>motion capture data</a> (*.bvh)</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>
                            <Stack spacing={10} direction="row" style={{paddingTop:"30px"}}>
                                <Stack spacing={2} direction="column" style={{paddingTop:"0px"}}>
                                    <Button size="small" variant="contained" endIcon={<VideoFileIcon />} onClick={() => this.setState({start: true})}>Start with Video</Button>
                                    <Button size="small" variant="contained" endIcon={<GestureIcon />} onClick={() => this.setState({start: true, isVideo: false})}>Start with MoCap</Button>
                                </Stack>
                                <Stack spacing={10} direction="row" style={{paddingTop:"0px"}}>
                                    <Button size="small" style={{maxHeight: '30px'}} variant="contained" endIcon={<HelpIcon />} onClick={() => this.setState({helpMain: true})}>User Guide</Button>
                                    <Button size="small" style={{minWidth: '100px', maxHeight: '30px'}} variant="contained" endIcon={<FeedOutlinedIcon />} href={"https://arxiv.org/abs/2202.10562"} target="_blank" rel="noopener noreferrer">Learn More</Button>
                                </Stack>
                            </Stack>
                        </div>}
                {this.state.isVideo === true && this.state.start === true &&
                    /*
                        If start with video, enters following
                     */
                    <div className="main">
                        <Router>
                            <nav className="nav-bar">
                                <div className="title"></div>
                                <div className="title">
                                    {this.state.currentPage === 0 && "Step 1. Select and upload desired video"}
                                    {this.state.currentPage === 1 && "Step 2. Generate mesh model"}
                                    {this.state.currentPage === 2 && "Step 3. Select target sensor location"}
                                </div>
                                <div className="account">
                                    <div className="help" onClick={() => this.setState({helpMain: true})}>
                                        <HelpOutlineIcon/>
                                        Help
                                    </div>
                                </div>
                            </nav>
                            <div className={"router-wrap"}>
                                <div className="sidebar">
                                    {this.state.currentPage === 0 && this.state.stepComplete1 === true &&
                                    <SideBar prev={"/"}
                                             next={"/model"}
                                             handleReset={this.handleReset1}
                                             handleResetAll={this.handleResetAll}/>}
                                    {this.state.currentPage === 0 && this.state.stepComplete1 === false &&
                                    <SideBar prev={"/"}
                                             next={"/"}
                                             handleReset={this.handleReset1}
                                             handleResetAll={this.handleResetAll}/>}
                                    {this.state.currentPage === 1 && this.state.stepComplete2 === true &&
                                    <SideBar prev={"/"}
                                             next={"/select"}
                                             handleReset={this.handleReset2}
                                             handleResetAll={this.handleResetAll}/>}
                                    {this.state.currentPage === 1 && this.state.stepComplete2 === false &&
                                    <SideBar prev={"/"}
                                             next={"/model"}
                                             handleReset={this.handleReset2}
                                             handleResetAll={this.handleResetAll}/>}
                                    {this.state.currentPage === 2 && <SideBar prev={"/model"}
                                                                              next={"/select"}
                                                                              handleResetAll={this.handleResetAll}/>}
                                </div>

                                <Routes>
                                    <Route path="/" element={<VideoEditPage fId={this.state.folder_id}
                                                                            videoChange={this.handleVideoChange}
                                                                            videoSrc={this.state.video_src}
                                                                            pageChange={this.handlePageChange}
                                                                            processComplete={this.handleProcessChange}/>}
                                    />
                                    <Route path="/test" element={<VideoEditPage fId={this.state.folder_id}
                                                                                videoChange={this.handleVideoChange}
                                                                                videoSrc={this.state.video_src}
                                                                                pageChange={this.handlePageChange}
                                                                                processComplete={this.handleProcessChange}/>}
                                    />
                                    <Route path="/model" element={<ModelProcessPage fId={this.state.folder_id}
                                                                                    fileChange={this.handleFileNameChange}
                                                                                    fileName1={this.state.fileName1}
                                                                                    fileName2={this.state.fileName2}
                                                                                    fileName3={this.state.fileName3}
                                                                                    uploadingChange={this.handleUploadingChange}
                                                                                    uploading={this.state.uploading}
                                                                                    progressChange={this.handleProgressChange}
                                                                                    inProgress={this.state.inProgress}
                                                                                    pageChange={this.handlePageChange}
                                                                                    processComplete={this.handleProcessChange}/>}
                                    />
                                    <Route path="/select"
                                           element={<SensorSelectPage pageChange={this.handlePageChange}/>}/>
                                </Routes>
                            </div>
                        </Router>
                    </div>}

                {this.state.isVideo === false && this.state.start === true &&
                /*
                    If start with motion capture data, enters following
                 */
                <div className="main">
                    <Router>
                        <nav className="nav-bar">
                            <div className="title"></div>
                            <div className="title">
                                {this.state.currentPage === 0 && "Step 1. Select and upload Motion Capture Data"}
                                {this.state.currentPage === 2 && "Step 2. Select target sensor location"}
                            </div>
                            <div className="account">
                                <div className="help" onClick={() => this.setState({helpMain: true})}>
                                    <HelpOutlineIcon/>
                                    Help
                                </div>
                            </div>
                        </nav>
                        <div className={"router-wrap"}>
                            <div className="sidebar">
                                {this.state.currentPage === 0 && this.state.stepComplete1 === true &&
                                <SideBar prev={"/"}
                                         next={"/select"}
                                         handleReset={this.handleReset1}
                                         handleResetAll={this.handleResetAll}/>}
                                {this.state.currentPage === 0 && this.state.stepComplete1 === false &&
                                <SideBar prev={"/"}
                                         next={"/"}
                                         handleReset={this.handleReset1}
                                         handleResetAll={this.handleResetAll}/>}
                                {this.state.currentPage === 2 && <SideBar prev={"/"}
                                                                          next={"/select"}
                                                                          handleResetAll={this.handleResetAll}/>}
                            </div>

                            <Routes>
                                <Route path="/" element={<MocapPage fId={this.state.folder_id}
                                                                    pageChange={this.handlePageChange}
                                                                    uploadingChange={this.handleUploadingChange}
                                                                    uploading={this.state.uploading}
                                                                    progressChange={this.handleProgressChange}
                                                                    inProgress={this.state.inProgress}
                                                                    processComplete={this.handleProcessChange}/>}
                                />
                                <Route path="/select"
                                       element={<MocapSensorSelectPage pageChange={this.handlePageChange}/>}/>
                            </Routes>
                        </div>
                    </Router>
                </div>}

                {/*
                    Pop up modal for help feature
                    */}
                <Modal
                    isOpen={this.state.helpMain}
                    onRequestClose={() => this.setState({helpMain: false})}
                    contentLabel="Workflow Overview"
                >
                    <div style={{fontSize: "40px", height:"5%"}}>
                        Workflow Overview
                    </div>

                    <div className={"user-guide"}>
                        <div id="video_div" className={"imgs"}>
                            <img src={video} height="100%" onClick={() => this.setState({helpVideo_1: true})}/>
                        </div>
                        <div className={"arrow"}>
                            <img src={arrow} width="100%"/>
                        </div>
                        <div id="model_div" className={"imgs"}>
                            <img src={model} height="100%" onClick={() => this.setState({helpModel_1: true})}/>
                        </div>
                        <div className={"arrow"}>
                            <img src={arrow} width="100%"/>
                        </div>
                        <div id="select_div" className={"imgs"}>
                            <img src={select} height="100%" onClick={() => this.setState({helpSelect_1: true})}/>
                        </div>
                    </div>

                    <div style={{height:"2%", color: "green", textAlign:"right"}}>
                        Click component for more info
                    </div>
                </Modal>

                <Modal
                    isOpen={this.state.helpVideo_1}
                    onRequestClose={() => this.setState({helpVideo_1: false})}
                    contentLabel="Video Page Overview"
                >
                    <div style={{fontSize: "40px", height:"5%"}}>
                        Video Page Overview
                    </div>

                    <div className={"user-guide"}>
                        <IconButton component="label" size="large">
                            <SkipPreviousIcon />
                        </IconButton>
                        <div style={{paddingTop: "5%", paddingLeft: "5%", paddingRight: "5%", width: "90%"}}>
                            <img src={pic1_1} width="90%" />
                        </div>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpVideo_1: false, helpVideo_2: true})}>
                            <SkipNextIcon />
                        </IconButton>
                    </div>

                </Modal>

                <Modal
                    isOpen={this.state.helpVideo_2}
                    onRequestClose={() => this.setState({helpVideo_2: false})}
                    contentLabel="Video Page Overview"
                >
                    <div style={{fontSize: "40px", height:"5%"}}>
                        Video Page Overview
                    </div>

                    <div className={"user-guide"}>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpVideo_2: false, helpVideo_1: true})}>
                            <SkipPreviousIcon />
                        </IconButton>
                        <div style={{paddingTop: "5%", paddingLeft: "5%", paddingRight: "5%", width: "90%"}}>
                            <img src={pic1_2} width="90%" />
                        </div>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpVideo_2: false, helpModel_1: true})}>
                            <SkipNextIcon />
                        </IconButton>
                    </div>

                </Modal>

                <Modal
                    isOpen={this.state.helpModel_1}
                    onRequestClose={() => this.setState({helpModel_1: false})}
                    contentLabel="Model Generation Page Overview"
                >
                    <div style={{fontSize: "40px", height:"5%"}}>
                        Model Generation Page Overview
                    </div>

                    <div className={"user-guide"}>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpModel_1: false, helpVideo_2: true})}>
                            <SkipPreviousIcon />
                        </IconButton>
                        <div style={{paddingTop: "5%", paddingLeft: "5%", paddingRight: "5%", width: "90%"}}>
                            <img src={pic2_1} width="90%" />
                        </div>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpModel_1: false, helpModel_2: true})}>
                            <SkipNextIcon />
                        </IconButton>
                    </div>

                </Modal>

                <Modal
                    isOpen={this.state.helpModel_2}
                    onRequestClose={() => this.setState({helpModel_2: false})}
                    contentLabel="Model Generation Page Overview"
                >
                    <div style={{fontSize: "40px", height:"5%"}}>
                        Model Generation Page Overview
                    </div>

                    <div className={"user-guide"}>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpModel_2: false, helpModel_1: true})}>
                            <SkipPreviousIcon />
                        </IconButton>
                        <div style={{paddingTop: "5%", paddingLeft: "5%", paddingRight: "5%", width: "90%"}}>
                            <img src={pic2_2} width="90%" />
                        </div>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpModel_2: false, helpSelect_1: true})}>
                            <SkipNextIcon />
                        </IconButton>
                    </div>

                </Modal>

                <Modal
                    isOpen={this.state.helpSelect_1}
                    onRequestClose={() => this.setState({helpSelect_1: false})}
                    contentLabel="Sensor Selection Page Overview"
                >
                    <div style={{fontSize: "40px", height:"5%"}}>
                        Sensor Selection Page Overview
                    </div>

                    <div className={"user-guide"}>
                        <IconButton component="label" size="large" onClick={() => this.setState({helpSelect_1: false, helpModel_2: true})}>
                            <SkipPreviousIcon />
                        </IconButton>
                        <div style={{paddingTop: "5%", paddingLeft: "5%", paddingRight: "5%", width: "90%"}}>
                            <img src={pic3_1} width="90%" />
                        </div>
                        <IconButton component="label" size="large" >
                            <SkipNextIcon />
                        </IconButton>
                    </div>

                </Modal>
            </div>
        );
    }
}
