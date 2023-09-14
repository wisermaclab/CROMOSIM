{/*
    Model generation page that takes the CVD results from user and generate and load SMPL model
    @Author: Liang Xu
* */}

import React from 'react'
import './ModelProcessPage.css';
import { Ring, Roller, DualRing } from 'react-awesome-spinners'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import axios from "axios";
import {NavLink} from "react-router-dom";
import {pink} from "@mui/material/colors";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";
import {num_frame_mocap} from "./MocapPage";

export let totalVertex = []
export let totalJoint = []
export let num_frame = 0
export let folder_id = 0
//const addr = "192.168.1.20:8080"
const addr = "localhost:8080"
//const addr = "130.113.70.157:8080"
//const addr = "172.18.206.72:8080"

export default class ModelProcessPage extends React.Component {
    constructor(props) {
        super(props);

        this.state={
            inProgress:false,
            likeList1:'',
            likeList2:'',
            likeList3:'',
            fileName1:'',
            fileName2:'',
            fileName3:'',
            fileUrl1:'',
            fileUrl2:'',
            fileUrl3:'',
            processState:{
                process1:1,
                process2:0,
                process3:0,
                process4:0
            },
            complete:false
        }

        this.props.pageChange(1)
        console.log("enter model")
        this.renderLikeList = this.renderLikeList.bind(this)
        this.handleLeave = this.handleLeave.bind(this)
        this.handleHover = this.handleHover.bind(this)
        this.handleFileChange = this.handleFileChange.bind(this)
        this.handleFileDelete = this.handleFileDelete.bind(this)
        this.moveToProcess = this.moveToProcess.bind(this)
    }

    //Handling the render of file hints, includes when mouse enters and leaves
    renderLikeList(i){
        if (i === 1){
            return <div className="likes-list" >
                <div className={"likes-list-text"}>
                    Archive file contains the camera parameter output from CVD.
                </div>
                <div className={"likes-list-text"}>
                    e.g. cam.zip
                </div>
            </div>
        } else if (i === 2){
            return <div className="likes-list" >
                <div className={"likes-list-text"}>
                    Archive file contains the dynamic mask output from CVD.
                </div>
                <div className={"likes-list-text"}>
                    e.g. dynamic_mask.zip
                </div>
            </div>
        } else if (i === 3){
            return <div className="likes-list" >
                <div className={"likes-list-text"}>
                    Archive file contains the depth output from CVD.
                </div>
                <div className={"likes-list-text"}>
                    e.g. output.zip
                </div>
            </div>
        }
    }
    handleLeave(i){
        if (i === 1){
            return this.setState({likeList1:''})
        } else if (i === 2){
            return this.setState({likeList2:''})
        } else if (i === 3){
            return this.setState({likeList3:''})
        }
    }
    handleHover(i){
        if (i === 1){
            return this.setState({likeList1:this.renderLikeList(i)})
        } else if (i === 2){
            return this.setState({likeList2:this.renderLikeList(i)})
        } else if (i === 3){
            return this.setState({likeList3:this.renderLikeList(i)})
        }
    }

    //Handling the selected CVD result file change and deletion
    handleFileChange(e, i) {
        e.preventDefault();

        let file = e.target.files[0];

        const url = URL.createObjectURL(file)

        if (i === 1){
            this.props.fileChange(file.name, 1)
            this.setState({fileUrl1: url})
            document.getElementById("input-form-1").submit()
        } else if (i === 2){
            this.props.fileChange(file.name, 2)
            this.setState({fileUrl2: url})
            document.getElementById("input-form-2").submit()
        } else if (i === 3){
            this.props.fileChange(file.name, 3)
            this.setState({fileUrl3: url})
            document.getElementById("input-form-3").submit()
        }
    }
    async handleFileDelete(i) {
        if (i === 1) {
            const data = {
                'file_name': this.props.fileName1,
                'folder_id': this.props.fId
            };
            const response = await axios.post('http://'+addr+'/deleteFile', data);

            if (response.data.data === "success"){
                this.props.fileChange("", 1)
                this.setState({fileUrl1: ""})
            } else {
                window.alert("File delete failed")
            }

        } else if (i === 2) {
            const data = {
                'file_name': this.props.fileName2,
                'folder_id': this.props.fId
            };
            const response = await axios.post('http://'+addr+'/deleteFile', data);

            if (response.data.data === "success"){
                this.props.fileChange("", 2)
                this.setState({fileUrl2: ""})
            } else {
                window.alert("File delete failed")
            }

        } else if (i === 3) {
            const data = {
                'file_name': this.props.fileName3,
                'folder_id': this.props.fId
            };
            const response = await axios.post('http://'+addr+'/deleteFile', data);

            if (response.data.data === "success"){
                this.props.fileChange("", 3)
                this.setState({fileUrl3: ""})
            } else {
                window.alert("File delete failed")
            }
        }
    }

    // Control the model generation process, includes
    //      CVD results extract
    //      VIBE command procee
    //      VIBE results extract
    //      Load model data
    async moveToProcess() {
        this.props.uploadingChange(1)
        this.forceUpdate()
        const response = await axios.get('http://'+addr+'/fileNumber_'+this.props.fId);
        const data = {
            'folder_id': this.props.fId
        };

        if (this.props.fileName1 !== '' && this.props.fileName2 !== '' && this.props.fileName3 !== '') {
            this.props.progressChange()
            this.props.uploadingChange(0)
            console.log(this.props.inProgress)
            this.forceUpdate()
            const response = await axios.post('http://'+addr+'/cvdProcess', data);
            console.log(response)
            if (response.data.data === "success"){
                const newProcess = {
                    process1: 2,
                    process2: 1,
                    process3: 0,
                    process4: 0
                }
                this.setState({processState: newProcess})
                this.forceUpdate()
                const response = await axios.post('http://'+addr+'/vibeCmd', data);

                if (response.data.data === "success"){
                    const newProcess = {
                        process1: 2,
                        process2: 2,
                        process3: 1,
                        process4: 0
                    }
                    this.setState({processState: newProcess})
                    this.forceUpdate()
                    const response = await axios.post('http://'+addr+'/vibeProcess', data);

                    if (response.data.data === "success"){
                        const newProcess = {
                            process1: 2,
                            process2: 2,
                            process3: 2,
                            process4: 1
                        }
                        this.setState({
                            processState: newProcess,
                        })
                        const data = {
                            'folder_id': this.props.fId
                        };
                        const response = await axios.post('http://'+addr+'/modelFrame', data);
                        num_frame = response.data.frame
                        if (num_frame > 0) {
                            for (let i = 0; i < num_frame; i++) {
                                const data = {
                                    'n_frame': i,
                                    'folder_id': this.props.fId
                                };
                                console.log(i+"/"+num_frame)
                                const response = await axios.post('http://'+addr+'/modelPoints', data);
                                const response_j = await axios.post('http://'+addr+'/modelJoints', data);
                                if (response.data.frame_n !== i && response_j.data.frame_n !== i) {
                                    const newProcess = {
                                        process1: 2,
                                        process2: 2,
                                        process3: 2,
                                        process4: 3
                                    }
                                    this.setState({
                                        processState: newProcess,
                                    })
                                    window.alert("Model points loading failed")
                                    break;
                                }
                                totalVertex = totalVertex.concat(response.data)
                                totalJoint = totalJoint.concat(response_j.data)
                            }
                            const newProcess1 = {
                                process1: 2,
                                process2: 2,
                                process3: 2,
                                process4: 2
                            }
                            this.setState({
                                processState: newProcess1,
                                complete: true
                            })
                            folder_id = this.props.fId
                            this.props.processComplete(2)
                        } else {
                            const newProcess = {
                                process1: 2,
                                process2: 2,
                                process3: 2,
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
                            process2: 2,
                            process3: 3,
                            process4: 0
                        }
                        this.setState({processState: newProcess})
                        this.forceUpdate()
                        window.alert("Vibe main process failed")
                    }
                } else {
                    const newProcess = {
                        process1: 2,
                        process2: 3,
                        process3: 0,
                        process4: 0
                    }
                    this.setState({processState: newProcess})
                    this.forceUpdate()
                    window.alert("Vibe cmd process failed")
                }
            } else {
                const newProcess = {
                    process1: 3,
                    process2: 0,
                    process3: 0,
                    process4: 0
                }
                this.setState({processState: newProcess})
                this.forceUpdate()
                window.alert("CVD main process failed")
            }

        } else {
            alert("Please select all required files");
        }

    }

    render() {
        return (
            <div style={{height: "70%", marginLeft: "20%"}}>
                <iframe id="invisible" name="invisible" style={{display: "none"}}>11</iframe>
                {this.props.inProgress === false ? (
                    <div id={"top-wrap"} >
                        <div className={"model-title"}>Upload CVD Result:</div>
                        <Button variant="contained" style={{marginLeft: "70%"}} endIcon={<SendIcon />} href="https://colab.research.google.com/drive/1XJEYWXvRVqxJavJDnnzWfU5HUJLaxw9s#scrollTo=PFmcymZPEohB" target="_blank" rel="noopener noreferrer">Get CVD</Button>

                        <ol>
                            <div className={"file-instruct"}>
                                <li>Camera Parameters: </li>
                                <div className={"file-tips"} onMouseOver={() => this.handleHover(1)} onMouseLeave={() => this.handleLeave(1)}>?</div>
                            </div>
                            {this.state.likeList1}
                            {this.props.fileName1 === '' ? (
                                <div className={"file-input-wrap"}>
                                    <label htmlFor="file-input-1">
                                        <div className={"input-button"}><AddCircleIcon />&nbsp;&nbsp;&nbsp;Choose file</div>
                                    </label>
                                    <form id="input-form-1" action={'http://'+addr+'/uploadResult'} method="post" encType="multipart/form-data" target="invisible">
                                        <input id="file-input-1" className={"invisible-input"} type={"file"} name="file" accept={"application/zip"} onChange={(e) => this.handleFileChange(e, 1)}/>
                                        <input className="file" type={"text"} name="id" value={this.props.fId} />
                                        <input className="file" type="submit" value="submit" />
                                    </form>
                                </div>
                            ) : (
                                <div className={"file-name"}>{this.props.fileName1}<CancelIcon onClick={()=>this.handleFileDelete(1)}/></div>
                            )}

                            <hr style={{position: "relative", width: "150%", left: "auto"}}/>

                            <div className={"file-instruct"}>
                                <li>Dynamic Mask: </li>
                                <div className={"file-tips"} onMouseOver={() => this.handleHover(2)} onMouseLeave={() => this.handleLeave(2)}>?</div>
                            </div>
                            {this.state.likeList2}
                            {this.props.fileName2 === '' ? (
                                <div className={"file-input-wrap"}>
                                    <label htmlFor="file-input-2">
                                        <div className={"input-button"}><AddCircleIcon />&nbsp;&nbsp;&nbsp;Choose file</div>
                                    </label>
                                    <form id="input-form-2" action={'http://'+addr+'/uploadResult'} method="post" encType="multipart/form-data" target="invisible">
                                        <input id="file-input-2" className={"invisible-input"} type={"file"} name="file" accept={"application/zip"} onChange={(e) => this.handleFileChange(e, 2)}/>
                                        <input className="file" type={"text"} name="id" value={this.props.fId} />
                                        <input className="file" type="submit" value="submit" />
                                    </form>
                                </div>
                            ) : (
                                <div className={"file-name"}>{this.props.fileName2}<CancelIcon onClick={()=>this.handleFileDelete(2)}/></div>
                            )}

                            <hr style={{position: "relative", width: "150%", left: "auto"}}/>

                            <div className={"file-instruct"}>
                                <li>MiDas Output: </li>
                                <div className={"file-tips"} onMouseOver={() => this.handleHover(3)} onMouseLeave={() => this.handleLeave(3)}>?</div>
                            </div>
                            {this.state.likeList3}
                            {this.props.fileName3 === '' ? (
                                <div className={"file-input-wrap"}>
                                    <label htmlFor="file-input-3">
                                        <div className={"input-button"}><AddCircleIcon />&nbsp;&nbsp;&nbsp;Choose file</div>
                                    </label>
                                    <form id="input-form-3" action={'http://'+addr+'/uploadResult'} method="post" encType="multipart/form-data" target="invisible">
                                        <input id="file-input-3" className={"invisible-input"} type={"file"} name="file" accept={"application/zip"} onChange={(e) => this.handleFileChange(e, 3)}/>
                                        <input className="file" type={"text"} name="id" value={this.props.fId} />
                                        <input className="file" type="submit" value="submit" />
                                    </form>
                                </div>
                            ) : (
                                <div className={"file-name"} >{this.props.fileName3}<CancelIcon onClick={()=>this.handleFileDelete(3)}/></div>
                            )}

                            <hr style={{position: "relative", width: "150%", left: "auto"}}/>

                        </ol>
                        <div className={"process-button"} onClick={()=>this.moveToProcess()}>
                            {this.props.uploading===1 ? (
                                <div style={{paddingLeft:"30%"}}>
                                    <DualRing size={20}/>
                                </div>
                            ) : (
                                <div style={{paddingLeft:"15%", paddingTop: "5%"}}>
                                    Process
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div id={"top-wrap-2"}>
                        <div className={"process-wrap"}>
                            1. Extract data from CVD result&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <div className={"ring"} style={{display: this.state.processState.process1 === 1 ? "inline" : "none"}}>
                                <Ring size={50}/>
                            </div>
                            <TaskAltIcon color="success" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process1 === 2 ? "inline" : "none"}}/>
                            <MoreHorizIcon color="secondary" sx={{ fontSize: "50px" }} style={{display: "none"}}/>
                            <RemoveCircleOutlineIcon sx={{ fontSize: "50px", color: pink[500] }} style={{display: this.state.processState.process1 === 3 ? "inline" : "none"}}/>
                        </div>
                        <div className={"process-wrap"}>
                            2. Processing VIBE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <div className={"ring"} style={{display: this.state.processState.process2 === 1 ? "inline" : "none"}}>
                                <Ring size={50}/>
                            </div>
                            <TaskAltIcon color="success" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process2 === 2 ? "inline" : "none"}}/>
                            <MoreHorizIcon color="secondary" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process2 === 0 ? "inline" : "none"}}/>
                            <RemoveCircleOutlineIcon sx={{ fontSize: "50px", color: pink[500] }} style={{display: this.state.processState.process2 === 3 ? "inline" : "none"}}/>
                        </div>
                        <div className={"process-wrap"}>
                            3. Extract data from VIBE result&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <div className={"ring"} style={{display: this.state.processState.process3 === 1 ? "inline" : "none"}}>
                                <Ring size={50}/>
                            </div>
                            <TaskAltIcon color="success" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process3 === 2 ? "inline" : "none"}}/>
                            <MoreHorizIcon color="secondary" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process3 === 0 ? "inline" : "none"}}/>
                            <RemoveCircleOutlineIcon sx={{ fontSize: "50px", color: pink[500] }} style={{display: this.state.processState.process3 === 3 ? "inline" : "none"}}/>
                        </div>
                        <div className={"process-wrap"}>
                            4. Loading mesh model data&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <div className={"ring"} style={{display: this.state.processState.process4 === 1 ? "inline" : "none"}}>
                                <Ring size={50}/>
                            </div>
                            <TaskAltIcon color="success" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process4 === 2 ? "inline" : "none"}}/>
                            <MoreHorizIcon color="secondary" sx={{ fontSize: "50px" }} style={{display: this.state.processState.process4 === 0 ? "inline" : "none"}}/>
                            <RemoveCircleOutlineIcon sx={{ fontSize: "50px", color: pink[500] }} style={{display: this.state.processState.process4 === 3 ? "inline" : "none"}}/>
                        </div>
                        <div className={"next-button"}
                             style={{display: this.state.complete ? "inline" : "none"}}
                        >
                            <NavLink to={'/select'}>
                                Next Step
                            </NavLink>
                        </div>
                    </div>
                )}

            </div>
        );
    }
}