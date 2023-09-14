{/*
    Motion data page, handling motion capture data uploading and smpl model generation
    @Author: Liang Xu
* */}

import React from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './MocapPage.css';
import {Link, NavLink} from "react-router-dom";
import axios from "axios";
import {Ring} from "react-awesome-spinners";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {pink} from "@mui/material/colors";

export let totalVertex_mocap = []
export let totalJoint_mocap = []
export let num_frame_mocap = 0
export let folder_id_mocap = 0

//const addr = "192.168.1.20:8080"
const addr = "localhost:8080"
//const addr = "130.113.70.157:8080"
//const addr = "172.18.206.72:8080"

export default class MocapPage extends React.Component {

    constructor(props) {
        super(props);

        this.state={
            processState:{
                process1:1,
                process2:0,
                process3:0,
                process4:0
            },
            complete:false
        }

        this.props.pageChange(0)
        console.log("enter mocap")
        this.handleDataChange = this.handleDataChange.bind(this)
    }

    // Handling the upload motion data change
    handleDataChange(e) {
        e.preventDefault();

        let file = e.target.files[0];
        let new_file = new File([file], 'test.npz');

        console.log(file)
        document.getElementById("input-form1").submit()
        this.forceUpdate()
        this.moveToProcess()
    }

    // Control the model generation process, includes
    //      Data upload
    //      SMPL model generation procee
    //      Load model data
    async moveToProcess() {
        this.props.uploadingChange(1)
        this.forceUpdate()
        const data = {
            'folder_id': this.props.fId
        };

        this.props.progressChange()
        this.props.uploadingChange(0)
        this.forceUpdate()
        const response = await axios.get('http://'+addr+'/mocap/fileNumber_'+this.props.fId);
        console.log(response)
        if (response.data === 1){
            const newProcess = {
                process1: 2,
                process2: 1,
                process3: 0
            }
            this.setState({processState: newProcess})
            this.forceUpdate()
            const response = await axios.post('http://'+addr+'/mocap/process', data);

            if (response.data.data === "success"){
                const newProcess = {
                    process1: 2,
                    process2: 2,
                    process3: 1
                }
                this.setState({processState: newProcess})
                this.forceUpdate()
                const data = {
                    'folder_id': this.props.fId
                };
                const response = await axios.post('http://'+addr+'/mocap/modelFrame', data);
                num_frame_mocap = response.data.frame
                if (num_frame_mocap > 0) {
                    for (let i = 0; i < num_frame_mocap; i++) {
                        const data = {
                            'n_frame': i,
                            'folder_id': this.props.fId
                        };
                        console.log(i+"/"+num_frame_mocap)
                        const response = await axios.post('http://'+addr+'/mocap/modelPoints', data);
                        const response_j = await axios.post('http://'+addr+'/mocap/modelJoints', data);
                        if (response.data.frame_n !== i && response_j.data.frame_n !== i) {
                            const newProcess = {
                                process1: 2,
                                process2: 2,
                                process4: 3
                            }
                            this.setState({
                                processState: newProcess,
                            })
                            window.alert("Model points loading failed")
                            break;
                        }
                        totalVertex_mocap = totalVertex_mocap.concat(response.data)
                        totalJoint_mocap = totalJoint_mocap.concat(response_j.data)
                    }
                    const newProcess1 = {
                        process1: 2,
                        process2: 2,
                        process3: 2
                    }
                    this.setState({
                        processState: newProcess1,
                        complete: true
                    })
                    folder_id_mocap = this.props.fId
                    this.props.processComplete(2)
                } else {
                    const newProcess = {
                        process1: 2,
                        process2: 2,
                        process4: 3
                    }
                    this.setState({
                        processState: newProcess,
                    })
                    window.alert("Model points loading failed")
                }
            } else {
                const newProcess = {
                    process1: 2,
                    process2: 3,
                    process3: 0
                }
                this.setState({processState: newProcess})
                this.forceUpdate()
                window.alert("Model Generation Process Failed")
            }
        } else {
            const newProcess = {
                process1: 3,
                process2: 0,
                process3: 0
            }
            this.setState({processState: newProcess})
            this.forceUpdate()
            window.alert("Motion Data Upload Failed")
        }
    }

    render() {
        return (
            <div style={{height: "100%", width: "100%"}}>
                <iframe id="invisible_iframe" name="invisible_iframe" className={"file"}>11</iframe>
            {this.props.inProgress === false ? (
                // Motion data upload comonent
            <div id={"not-sign-in"}>
                <div>
                    <label id={"not-sign-in-content"} htmlFor="file-input1">
                        <CloudUploadIcon/>
                        <span>Please upload motion capture data (*.npz) to continue.</span>
                    </label>
                    <form id="input-form1" action={'http://'+addr+'/mocap/uploadResult'} method="post" encType="multipart/form-data" target="invisible_iframe">
                        <input id="file-input1" className="file" type={"file"} name="file" accept={".npz"} onChange={this.handleDataChange} />
                        <input className="file" type={"text"} name="id" value={this.props.fId} />
                        <input className="file" type="submit" value="submit" />
                    </form>
                </div>
            </div>
        ) : (
            // Model generation component
            <div style={{height: "70%"}}>
                <div id={"top-wrap-2"}>
                    <div className={"process-wrap"}>
                        1. Uploading MoCap data&nbsp;
                        <div className={"ring"} style={{display: this.state.processState.process1 === 1 ? "inline" : "none"}}>
                            <Ring size={50}/>
                        </div>
                        <TaskAltIcon color="success" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process1 === 2 ? "inline" : "none"}}/>
                        <MoreHorizIcon color="secondary" sx={{ fontSize: "50px" }} style={{display: "none"}}/>
                        <RemoveCircleOutlineIcon sx={{ fontSize: "50px", color: pink[500] }} style={{display: this.state.processState.process1 === 3 ? "inline" : "none"}}/>
                    </div>
                    <div className={"process-wrap"}>
                        2. Generating SMPL Model
                        <div className={"ring"} style={{display: this.state.processState.process2 === 1 ? "inline" : "none"}}>
                            <Ring size={50}/>
                        </div>
                        <TaskAltIcon color="success" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process2 === 2 ? "inline" : "none"}}/>
                        <MoreHorizIcon color="secondary" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process2 === 0 ? "inline" : "none"}}/>
                        <RemoveCircleOutlineIcon sx={{ fontSize: "50px", color: pink[500] }} style={{display: this.state.processState.process2 === 3 ? "inline" : "none"}}/>
                    </div>
                    <div className={"process-wrap"}>
                        3. Loading mesh model data&nbsp;
                        <div className={"ring"} style={{display: this.state.processState.process3 === 1 ? "inline" : "none"}}>
                            <Ring size={50}/>
                        </div>
                        <TaskAltIcon color="success" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process3 === 2 ? "inline" : "none"}}/>
                        <MoreHorizIcon color="secondary" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process3 === 0 ? "inline" : "none"}}/>
                        <RemoveCircleOutlineIcon sx={{ fontSize: "50px", color: pink[500] }} style={{display: this.state.processState.process3 === 3 ? "inline" : "none"}}/>
                    </div>
                    <div className={"next-button"}
                         style={{display: this.state.complete ? "inline" : "none"}}
                    >
                        <NavLink to={'/select'}>
                            Next Step
                        </NavLink>
                    </div>
                </div>
            </div>
        )}
            </div>
        )
    }
}