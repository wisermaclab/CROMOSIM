{/*
    Video edit page, handling video uploading, preview and trim
    @Author: Liang Xu
* */}

import React from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './VideoEditPage.css';
import {Link, NavLink} from "react-router-dom";
import axios from "axios";
import TextField from '@mui/material/TextField';

//const addr = "192.168.1.20:8080"
const addr = "localhost:8080"
//const addr = "130.113.70.157:8080"
//const addr = "172.18.206.72:8080"

export default class VideoEditPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            start_time: 0,
            end_time: 0,
            complete: false
        };

        this.handleVideoChange = this.handleVideoChange.bind(this)
        this.setStartTime = this.setStartTime.bind(this)
        this.setEndTime = this.setEndTime.bind(this)
        this.setDuration = this.setDuration.bind(this)
        this.processVideo = this.processVideo.bind(this)

        this.video = React.createRef();
        this.fileInput = React.createRef();

        this.props.pageChange(0)
        console.log("enter video")
    }

    /*
        Handling video upload, submit the form automatically
     */
    handleVideoChange(e) {
        e.preventDefault();

        let file = e.target.files[0];
        let new_file = new File([file], 'test.mp4');

        console.log(file)
        console.log(new_file)
        const url = URL.createObjectURL(new_file)
        console.log(url)
        this.props.videoChange(url)

        document.getElementById("input-form1").submit()
    }

    /*
        Set video parameters when a video is ready for preview
     */
    setDuration() {
        let video = document.getElementById("videoPlayer")
        console.log(1)
        this.setState({end_time: video.duration.toFixed(0)})
    }
    setStartTime() {
        let video = document.getElementById("videoPlayer")
        this.setState({start_time: video.currentTime.toFixed(0)})
    }
    setEndTime() {
        let video = document.getElementById("videoPlayer")
        this.setState({end_time: video.currentTime.toFixed(0)})
    }

    /*
        Handling the change of start and end time
    */
    handleStartChange(e) {
        let time = e.target.value
        time = parseInt(time, 10)
        if (time >= this.state.end_time){
            time = this.state.end_time-1
        }
        if (time < 0){
            time = 0.0
        }
        this.setState({start_time: time})
    }
    handleEndChange(e) {
        let time = e.target.value
        time = parseInt(time, 10)
        let video = document.getElementById("videoPlayer")
        if (time > video.duration){
            time = video.duration
        }
        if (time <= this.state.start_time){
            time = this.state.start_time+1
        }
        this.setState({end_time: time})
    }

    /*
        Process video trim action
     */
    async processVideo() {

        const data = {
            'start_time': this.state.start_time,
            'end_time': this.state.end_time,
            'folder_id': this.props.fId
        };
        const response = await axios.post('http://'+addr+'/editVideo', data);

        if (response.data.data === "success"){
            this.setState({complete: true})
            this.props.processComplete(1)
        } else {
            window.alert("Video edit failed, please try again")
        }

    }

    render() {
        return (
            <div id={"not-sign-in"}>
                <iframe id="invisible_iframe" name="invisible_iframe" className={"file"}>11</iframe>
                {this.props.videoSrc === "" ? (
                    /*
                        Video select component
                     */
                <div>
                    <label id={"not-sign-in-content"} htmlFor="file-input1">
                        <CloudUploadIcon/>
                        <span>Please upload a video to continue.</span>
                    </label>
                    <form id="input-form1" action={'http://'+addr+'/uploadVideo'} method="post" encType="multipart/form-data" target="invisible_iframe">
                        <input id="file-input1" className="file" type={"file"} name="file" accept={"video/mp4"} onChange={this.handleVideoChange} />
                        <input className="file" type={"text"} name="id" value={this.props.fId} />
                        <input className="file" type="submit" value="submit" />
                    </form>
                </div>
            ) : (
                /*
                Video preview component
                 */
                <div id={"video"}>
                    <video
                        className="VideoInput_video"
                        width="100%"
                        height="100%"
                        controls
                        src={this.props.videoSrc}
                        ref={this.video}
                        id={"videoPlayer"}
                        onLoadedData={this.setDuration}
                    />
                    <div className={"button-bar"}>
                        <div className={"time-bar"}>
                            {this.state.complete === false ? (
                                <div className={"time-string"}>
                                    <TextField
                                        id="filled-basic"
                                        label="Start time"
                                        type="number"
                                        size="small"
                                        value={this.state.start_time}
                                        inputProps={{
                                            step: "1"
                                        }}
                                        style = {{width: 100, paddingRight:20}}
                                        onChange= {(evt) => this.handleStartChange(evt)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                    <div style = {{paddingRight:20, width:10}} >-</div>
                                    <TextField
                                        id="filled-basic"
                                        label="End time"
                                        type="number"
                                        size="small"
                                        value={this.state.end_time}
                                        inputProps={{
                                            step: "1"
                                        }}
                                        style = {{width: 100}}
                                        onChange= {(evt) => this.handleEndChange(evt)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className={"time-string"}>
                                    Complete!
                                </div>
                            )}
                            <div className={"select-bar"}>
                                <button className={"button"} onClick={this.setStartTime}>
                                    Select Start
                                </button>
                                <button className={"button"} onClick={this.setEndTime}>
                                    Select End
                                </button>
                            </div>
                        </div>
                        <div className={"process-bar"}>
                            <button className={"button"} onClick={this.processVideo}>
                                Process
                            </button>
                            {this.state.complete === true ? (
                                <button className={"button"}>
                                    <NavLink to={'model'}>
                                        Next Step
                                    </NavLink>
                                </button>
                                ) : (
                                <button className={"disabled-button"}>
                                    Next Step
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </div>
        );
    }
}