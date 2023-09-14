{/*
    Model preview page that provides preview of the motion sequence generated from video
    @Author: Liang Xu
* */}

import React, {useEffect, useMemo, useRef, useState} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {BufferAttribute, Vector3} from "three";
import "./SensorSelectPage.css"
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import Slider from '@mui/material/Slider';
import isVideo from "../App"
import {totalVertex, num_frame, totalJoint, folder_id} from "./ModelProcessPage";
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import axios from "axios";
import {Ring} from "react-awesome-spinners";

let selectedP = []
let selectedPid = []
let selectedF = []
let selectedFid = []
let result_file = []
//const addr = "192.168.1.20:8080"
const addr = "localhost:8080"
//const addr = "130.113.70.157:8080"
//const addr = "172.18.206.72:8080"

// Joints index
const all_j = Array.from(Array(49).keys())
const head_j = [0, 1, 15, 16, 17, 18, 37, 38, 42, 43, 44, 45, 46, 47, 48]
const left_arm_j = [5, 6, 7, 34, 35, 36]
const right_arm_j = [2, 3, 4, 31, 32, 33]
const left_leg_j = [12, 13, 14, 19, 20, 21, 29, 30]
const right_leg_j = [9, 10, 11, 22, 23, 24, 25, 26]
const body_j = [8, 27, 28, 39, 40, 41]

// Human body mesh model component
function BufferPoints({setPoint, nframe, setNframe, setPlay, play, checked, setFace, forceUp}) {
    const refPoints = useRef();

    const p = new Float32Array(totalVertex[0].data);
    const points = new BufferAttribute(p, 3);

    const {clickEvent} = Test();

    // Motion sequence action
    useFrame(() => {
        if (nframe === 0){
            const p = new Float32Array(totalVertex[nframe].data);
            const points = new BufferAttribute(p, 3);
            refPoints.current.geometry.setAttribute('position', points);
            refPoints.current.geometry.attributes.position.needsUpdate = true;
        }

        if (play) {
            if (nframe === totalVertex.length-1){
                setPlay(false)
            }
            // manually inject numbers into property. so that it won't trigger re-render.
            const next = () => setNframe(nframe+1)
            setTimeout(next, 50);
            const p = new Float32Array(totalVertex[nframe].data);
            const points = new BufferAttribute(p, 3);
            refPoints.current.geometry.setAttribute('position', points);
            refPoints.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <mesh onDoubleClick={() => clickEvent(setPoint, nframe, checked, setFace, forceUp)} ref={refPoints}>
            <bufferGeometry attach={"geometry"}>
                <bufferAttribute attach={"position"} {...points} />
            </bufferGeometry>
            <meshStandardMaterial wireframe wireframeLinewidth={0.5}/>
        </mesh>
    );
}

// Check if a point is located in a triangle
function insideTest(x1, y1, x2, y2, x3, y3)
{
    return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
}
function isInside(x1, y1, x2, y2, x3, y3, x, y)
{
    let res1 = insideTest(x, y, x1, y1, x2, y2)
    let res2 = insideTest(x, y, x2, y2, x3, y3)
    let res3 = insideTest(x, y, x3, y3, x1, y1)
    return (res1 === res2 && res2 === res3);
}
function ptInTriangle(p_x, p_y, p0, p1, p2) {
    var dX = p_x-p2.x;
    var dY = p_y-p2.y;
    var dX21 = p2.x-p1.x;
    var dY12 = p1.y-p2.y;
    var D = dY12*(p0.x-p2.x) + dX21*(p0.y-p2.y);
    var s = dY12*dX + dX21*dY;
    var t = (p2.y-p0.y)*dX + (p0.x-p2.x)*dY;
    if (D<0) return s<=0 && t<=0 && s+t>=D;
    return s>=0 && t>=0 && s+t<=D;
}

// On click events of the human body mesh model
function Test() {
    let point;
    let p_x
    let p_y
    let dist = []
    let camera
    let min
    let min_point = []
    let min_id = []

    useFrame((state) => {
        camera = state.camera
    })
    useFrame(({ mouse }) => {
        p_x = mouse.x
        p_y = mouse.y
    })
    const clickEvent = (setPoint, nframe, checked, setFace, forceUp) => {
        let n = nframe
        if (nframe >= 1) {
            n = nframe - 1
        }
        point = new Float32Array(totalVertex[n].data);
        min = Infinity
        if (checked === true) {
            for (let i = 0; i < point.length / 3; i++) {
                let tmp_p = new Vector3(point[i * 3], point[i * 3 + 1], point[i * 3 + 2])
                tmp_p.project(camera)
                let tmp_dist = (Math.sqrt(Math.pow(tmp_p.x - p_x, 2) + Math.pow(tmp_p.y - p_y, 2)))
                if (tmp_dist < min) {
                    min = tmp_dist
                    min_point = [[point[i * 3], point[i * 3 + 1], point[i * 3 + 2]]]
                    min_id = i
                }
            }
            for (let i = 0; i < min_id.length; i++) {
                if (selectedPid.includes(min_id)) {
                    const index = selectedPid.indexOf(min_id)
                    selectedPid.splice(index, 1)
                    selectedP.splice(index, 1)
                } else {
                    selectedP = selectedP.concat(min_id)
                    selectedPid = selectedPid.concat(min_id)
                }
            }
            selectedP = selectedP.concat(0)
            setPoint(selectedP)
            selectedP.pop()
            setPoint(selectedP)
        } else {
            for (let i = 0; i < point.length / 9; i++) {
                let tmp_p_1 = new Vector3(point[i * 9], point[i * 9 + 1], point[i * 9 + 2])
                let tmp_p_2 = new Vector3(point[i * 9 + 3], point[i * 9 + 4], point[i * 9 + 5])
                let tmp_p_3 = new Vector3(point[i * 9 + 6], point[i * 9 + 7], point[i * 9 + 8])
                tmp_p_1.project(camera)
                tmp_p_2.project(camera)
                tmp_p_3.project(camera)
                if (true) {
                    //let inside = isInside(tmp_p_1.x, tmp_p_1.y, tmp_p_2.x, tmp_p_2.y, tmp_p_3.x, tmp_p_3.y, p_x, p_y)
                    let inside = ptInTriangle(p_x, p_y, tmp_p_1, tmp_p_2, tmp_p_3)
                    if (inside) {
                        let tmp_min = tmp_p_1.z + tmp_p_2.z + tmp_p_3.z
                        if (tmp_min < min && tmp_min > 0) {
                            min = tmp_min
                            min_id = i
                        }
                    }
                    {/*let tmp_dist = (Math.sqrt(Math.pow(tmp_p_1.x - p_x, 2) + Math.pow(tmp_p_1.y - p_y, 2) + Math.pow(tmp_p_1.z/2, 2))
                                    + Math.sqrt(Math.pow(tmp_p_2.x - p_x, 2) + Math.pow(tmp_p_2.y - p_y, 2) + Math.pow(tmp_p_2.z/2, 2))
                                    + Math.sqrt(Math.pow(tmp_p_3.x - p_x, 2) + Math.pow(tmp_p_3.y - p_y, 2) + Math.pow(tmp_p_3.z/2, 2)))
                    if (tmp_dist < min) {
                        min = tmp_dist
                        min_id = [i]
                    }*/}
                }
            }
            if (selectedFid.includes(min_id)) {
                const index = selectedFid.indexOf(min_id)
                selectedFid.splice(index, 1)
                selectedF.splice(index, 1)
            } else {
                selectedF = selectedF.concat(min_id)
                selectedFid = selectedFid.concat(min_id)
            }
            selectedF = selectedF.concat(0)
            setFace(selectedF)
            selectedF.pop()
            console.log(selectedF)
            setFace(selectedF)
        }
    }
    return { clickEvent };
}

function TestPoint() {

    return (
        <mesh position={[0, 0, 0]} >
            <sphereBufferGeometry attach="geometry" args={[0.005, 16, 16]}/>
            <meshNormalMaterial attach="material"/>
        </mesh>
    );
}

//Highlight selected point in mesh model
function Point({ pt, nframe }) {
    let n = nframe
    if (nframe>=1){
        n = nframe-1
    }

    return (
        <mesh position={[totalVertex[n].data[pt*3], totalVertex[n].data[pt*3+1], totalVertex[n].data[pt*3+2]]} >
            <sphereBufferGeometry attach="geometry" args={[0.005, 16, 16]}/>
            <meshNormalMaterial attach="material"/>
        </mesh>
    );
}

//Highlight joints in mesh model
function Joint({ pt, nframe }) {
    let n = nframe
    if (nframe >= 1) {
        n = nframe - 1
    }

    return (
        <mesh position={[totalJoint[n].data[pt * 3], totalJoint[n].data[pt * 3 + 1], totalJoint[n].data[pt * 3 + 2]]}>
            <sphereBufferGeometry attach="geometry" args={[0.008, 16, 16]}/>
            <meshBasicMaterial color={0x34f205} attach="material" />
        </mesh>
    );
}

function TestFace() {

    const p = new Float32Array([1.382957547903061, 4.615996479988098, 1.0500767827033997, 2.033044844865799, 5.618956089019775, 0.4306671395897865, 1.9783614575862885, 5.651621222496033, 0.5845712497830391]);
    const points = new BufferAttribute(p, 3);

    const vertices = new Float32Array( [
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
    ] );

    return (
        <mesh>
            <bufferGeometry attach="geometry">
                <bufferAttribute attach="attributes-position" array={p} itemSize={3} count={3} />
            </bufferGeometry>
            <meshBasicMaterial attach="material" color="red" />
        </mesh>
    );
}

// Highlight selected face and all three vertices
function Face({ fs, nframe }) {
    let n = nframe
    if (nframe>=1){
        n = nframe-1
    }

    const p = new Float32Array([totalVertex[n].data[fs*9], totalVertex[n].data[fs*9+1], totalVertex[n].data[fs*9+2],
                                        totalVertex[n].data[fs*9+3], totalVertex[n].data[fs*9+4], totalVertex[n].data[fs*9+5],
                                        totalVertex[n].data[fs*9+6], totalVertex[n].data[fs*9+7], totalVertex[n].data[fs*9+8]]);
    console.log(fs)
    return (
        <mesh position={[0,0,0]}>
            <bufferGeometry attach="geometry">
                <bufferAttribute attach="attributes-position" array={p} itemSize={3} count={3} />
            </bufferGeometry>
            <meshBasicMaterial color="gray" attach="material" />
        </mesh>
    );
}
function Face1({ fs, nframe }) {
    let n = nframe
    if (nframe>=1){
        n = nframe-1
    }
    console.log(fs)
    return (
        <mesh position={[totalVertex[n].data[fs*9], totalVertex[n].data[fs*9+1], totalVertex[n].data[fs*9+2]]} >
            <sphereBufferGeometry attach="geometry" args={[0.005, 16, 16]}/>
            <meshBasicMaterial color="red" attach="material" />
        </mesh>
    );
}
function Face2({ fs, nframe }) {
    let n = nframe
    if (nframe>=1){
        n = nframe-1
    }
    console.log(fs)
    return (
        <mesh position={[totalVertex[n].data[fs*9+3], totalVertex[n].data[fs*9+4], totalVertex[n].data[fs*9+5]]} >
            <sphereBufferGeometry attach="geometry" args={[0.005, 16, 16]}/>
            <meshBasicMaterial color="red" attach="material" />
        </mesh>
    );
}
function Face3({ fs, nframe }) {
    let n = nframe
    if (nframe>=1){
        n = nframe-1
    }
    console.log(fs)
    return (
        <mesh position={[totalVertex[n].data[fs*9+6], totalVertex[n].data[fs*9+7], totalVertex[n].data[fs*9+8]]} >
            <sphereBufferGeometry attach="geometry" args={[0.005, 16, 16]}/>
            <meshBasicMaterial color="red" attach="material" />
        </mesh>
    );
}

function PlayEvent() {

    const clickEvent = (setPlay, play, setNframe, nframe) => {
        if (nframe === totalVertex.length && play === false){
            setNframe(0);
        }
        setPlay(!play)
    }
    return { clickEvent };
}

// Page components used by App.js
export default function SensorSelectPage({pageChange}) {
    const [points, setPoints] = useState([]);
    const [joints, setJoints] = useState([]);
    const [faces, setFaces] = useState([]);
    const [nframe, setNframe] = useState(0);
    const [play, setPlay] = useState(false);
    const [n, setN] = useState(-1);
    const [isChecked1, setIsChecked1] = useState(false);
    const [isChecked2, setIsChecked2] = useState(true);
    const [progress, setProgress] = useState(0);
    const [, updateState] = React.useState();

    const forceUpdate = React.useCallback(() => updateState({}), []);

    useEffect(() => {
        pageChange(2)
        console.log("mounted");
    }, []);

    if (totalVertex.length !== n ){
        setN(totalVertex.length)
    }

    const { clickEvent } = PlayEvent();

    const handleChange = (event, newValue) => {
        handleChangeTmp(newValue)
        setNframe(newValue);
        setPlay(false)
    };

    const handleChangeTmp = (newValue) => {
        setNframe(newValue);
        setPlay(true)
    }

    const handleOnChange = () => {
        setIsChecked1(!isChecked1);
        setIsChecked2(!isChecked2);
    };

    // Automatically generated two other triangles based on selection
    const completeSelect = (index) => {
        let selectedTotal = []
        let tmp_p_1 = -1
        let tmp_p_2 = -1
        let point = totalVertex[0].data
        let p1_x = point[index*9], p1_y = point[index*9+1], p1_z = point[index*9+2];
        let p2_x = point[index*9+3], p2_y = point[index*9+4], p2_z = point[index*9+5];
        let p3_x = point[index*9+6], p3_y = point[index*9+7], p3_z = point[index*9+8];
        for (let j = 0; j < point.length/9; j++){
            if (index !== j){
                let tp1_x = point[j*9], tp1_y = point[j*9+1], tp1_z = point[j*9+2];
                let tp2_x = point[j*9+3], tp2_y = point[j*9+4], tp2_z = point[j*9+5];
                let tp3_x = point[j*9+6], tp3_y = point[j*9+7], tp3_z = point[j*9+8];
                if (p1_x === tp1_x && p1_y === tp1_y && p1_z === tp1_z){
                    if (p2_x === tp2_x && p2_y === tp2_y && p2_z === tp2_z){
                        tmp_p_1 = j*9+6
                    } else if (p2_x === tp3_x && p2_y === tp3_y && p2_z === tp3_z){
                        tmp_p_1 = j*9+3
                    } else if (p3_x === tp2_x && p3_y === tp2_y && p3_z === tp2_z){
                        tmp_p_2 = j*9+6
                    } else if (p3_x === tp3_x && p3_y === tp3_y && p3_z === tp3_z){
                        tmp_p_2 = j*9+3
                    }
                } else if (p1_x === tp2_x && p1_y === tp2_y && p1_z === tp2_z){
                    if (p2_x === tp3_x && p2_y === tp3_y && p2_z === tp3_z){
                        tmp_p_1 = j*9
                    } else if (p2_x === tp1_x && p2_y === tp1_y && p2_z === tp1_z){
                        tmp_p_1 = j*9+6
                    } else if (p3_x === tp3_x && p3_y === tp3_y && p3_z === tp3_z){
                        tmp_p_2 = j*9
                    } else if (p3_x === tp1_x && p3_y === tp1_y && p3_z === tp1_z){
                        tmp_p_2 = j*9+6
                    }
                } else if (p1_x === tp3_x && p1_y === tp3_y && p1_z === tp3_z){
                    if (p2_x === tp2_x && p2_y === tp2_y && p2_z === tp2_z){
                        tmp_p_1 = j*9
                    } else if (p2_x === tp1_x && p2_y === tp1_y && p2_z === tp1_z){
                        tmp_p_1 = j*9+3
                    } else if (p3_x === tp2_x && p3_y === tp2_y && p3_z === tp2_z){
                        tmp_p_2 = j*9
                    } else if (p3_x === tp1_x && p3_y === tp1_y && p3_z === tp1_z){
                        tmp_p_2 = j*9+3
                    }
                }
            }
        }
        selectedTotal.push(tmp_p_1)
        selectedTotal.push(index*9)
        selectedTotal.push(index*9+3)
        selectedTotal.push(index*9+3)
        selectedTotal.push(index*9)
        selectedTotal.push(index*9+6)
        selectedTotal.push(tmp_p_2)
        selectedTotal.push(index*9+6)
        selectedTotal.push(index*9)

        return selectedTotal
    };


    // Handling the confirm of selection
    const handleConfirm = async () => {
        setProgress(1)
        forceUpdate()

        {/*let selectedTotal = []

        for (let i = 0; i < selectedF.length; i++) {
            selectedTotal.push(selectedF[i] * 3)
            selectedTotal.push(selectedF[i] * 3 + 1)
            selectedTotal.push(selectedF[i] * 3 + 2)
        }

        let tmpArray = Array.from(new Set(selectedTotal))
        let indexList = [0, 1, 2, 2, 1, 3, 4, 3, 1]
        console.log(tmpArray)*/}
        for (let id = 0; id < faces.length; id++){
            let selectT = completeSelect(faces[id])
            console.log(selectT)
            let result = ""
            for (let i = 0; i < totalVertex.length; i++) {
                for (let j = 0; j < selectT.length; j++) {
                    let point = totalVertex[i].data
                    result = result + point[selectT[j]].toString()
                    result = result + ","
                    result = result + point[selectT[j] + 1].toString()
                    result = result + ","
                    result = result + point[selectT[j] + 2].toString()
                    result = result + ","
                }
                result = result.substring(0, result.length - 1)
                result = result + ";"
            }
            result = result.substring(0, result.length - 1)
            console.log(result)

            const data = {
                'selected_list': result,
                'folder_id': folder_id
            };
            const response = await axios.post('http://'+addr+'/confirmSelect', data);

            if (response.data.data === "error"){
                alert("Error occurs")
                setProgress(0)
            } else {
                console.log(response.data)
                result_file.push(response.data.data)
                console.log(result_file)
                setProgress(2)
            }
        }

        {/*if (tmpArray.length === 5){
            let result = ""
            console.log(totalVertex.length)
            console.log(totalVertex[0].data.length)
            for (let i = 0; i < totalVertex.length; i++) {
                for (let j = 0; j < 9; j++) {
                    let point = totalVertex[i].data
                    result = result + point[tmpArray[indexList[j]] * 3].toString()
                    result = result + ","
                    result = result + point[tmpArray[indexList[j]] * 3 + 1].toString()
                    result = result + ","
                    result = result + point[tmpArray[indexList[j]] * 3 + 2].toString()
                    result = result + ","
                }
                result = result.substring(0, result.length - 1)
                result = result + ";"
            }
            result = result.substring(0, result.length - 1)
            console.log(result)

            const data = {
                'selected_list': result,
                'folder_id': folder_id
            };
            const response = await axios.post('http://'+addr+'/confirmSelect', data);

            if (response.data.data === "error"){
                alert("Unknown error occurs")
                setProgress(0)
            } else {
                console.log(response.data)
                result_file = response.data.data
                console.log(result_file)
                setProgress(2)
            }
        } else if (tmpArray.length === 9){
            let result = ""
            for (let i = 0; i < totalVertex.length; i++) {
                for (let j = 0; j < 9; j++) {
                    let point = totalVertex[i].data
                    result = result + point[tmpArray[j] * 3].toString()
                    result = result + ","
                    result = result + point[tmpArray[j] * 3 + 1].toString()
                    result = result + ","
                    result = result + point[tmpArray[j] * 3 + 2].toString()
                    result = result + ","
                }
                result = result.substring(0, result.length - 1)
                result = result + ";"
            }
            result = result.substring(0, result.length - 1)
            console.log(result)

            const data = {
                'selected_list': result,
                'folder_id': folder_id
            };
            const response = await axios.post('http://'+addr+'/confirmSelect', data);

            if (response.data === "error"){
                alert("Unknown error occurs")
                setProgress(0)
            } else {
                console.log(response.data)
                result_file = response.data.data
                console.log(result_file)
                setProgress(2)
            }
        } else {
            alert("Please selected 3 connecting faces or 5 vertices")
            setProgress(0)
        }*/}
    };

    // Handling csv file download
    const downloadTxtFile = () => {
        console.log(result_file)
        if (result_file === []){
            alert("No result file loaded")
        } else {
            for (let i=0; i<result_file.length; i++) {
                const element = document.createElement("a");
                const file = new Blob([result_file[i]], {
                    type: "text/plain"
                });
                element.href = URL.createObjectURL(file);
                element.download = "IMU_data_p"+i.toString()+".csv";
                document.body.appendChild(element);
                element.click();
            }
        }
    };

    // Clean all selected faces
    const clearAll = () => {
        selectedF = []
        selectedFid = []
        setFaces([])
    }

    // Handling change the type of joints displayed
    const handleJointChange = (event) => {
        let value = event.target.value

        switch (value){
            case "0":
                setJoints([]);
                return;
            case "1":
                setJoints(all_j);
                return;
            case "2":
                setJoints(head_j);
                return;
            case "3":
                setJoints(body_j);
                return;
            case "4":
                setJoints(right_arm_j);
                return;
            case "5":
                setJoints(left_arm_j);
                return;
            case "6":
                setJoints(right_leg_j);
                return;
            case "7":
                setJoints(left_leg_j);
                return;
            default:
                setJoints([]);
                return;
        }
    }

    return (
        <div style={{width: "100%", height: "90%", paddingTop: "10%"}}>
            {totalVertex.length !== 0 ? (
            <div style={{width: "100%", height: "70%"}}>
                <Canvas className="canvas">
                    <BufferPoints setPoint={setPoints} nframe={nframe} setNframe={setNframe} setPlay={setPlay} play={play} checked={isChecked1} setFace={setFaces} forceUp={forceUpdate}/>

                    {points.map(function (p, i) {
                        return <Point id={p.toString()} pt={p} nframe={nframe}/>;
                    })}

                    {faces.map(function (f, i) {
                        return [<Face id={f.toString()+"_f"} fs={f} nframe={nframe}/>,
                         <Face1 id={f.toString()+"_1"} fs={f} nframe={nframe}/>,
                         <Face2 id={f.toString()+"_2"} fs={f} nframe={nframe}/>,
                         <Face3 id={f.toString()+"_3"} fs={f} nframe={nframe}/>];
                    })}

                    {joints.map(function (p, i) {
                        return <Joint pt={p} nframe={nframe}/>;
                    })}

                    <OrbitControls makeDefault/>
                </Canvas>
            </div>
                ) : (
                    <div>no model loaded</div>
            )}
            <div className={"menu-bar"}>
            <div className={"video-slider"}>
                <div className={"video-slider-up"}>
                    {play === false ? (
                        <PlayCircleIcon fontSize="large" onClick={() => clickEvent(setPlay, play, setNframe, nframe)}/>
                    ) : (
                        <PauseCircleIcon fontSize="large" onClick={() => clickEvent(setPlay, play, setNframe, nframe)}/>
                    )}
                    <div>
                        <div>{nframe} / {num_frame}</div>
                    </div>
                </div>
                <div>
                    <Slider
                        aria-label="frame_number"
                        defaultValue={0}
                        valueLabelDisplay="off"
                        value={nframe}
                        min={0}
                        max={num_frame}
                        onChange={handleChange}
                    />
                </div>
            </div>
                {/*<div className={"select-opt"}>
                    <div>
                        <input
                            type="checkbox"
                            value="Point"
                            checked={isChecked1}
                            onChange={handleOnChange}
                        />
                        By point
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            value="Face"
                            checked={isChecked2}
                            onChange={handleOnChange}
                        />
                        By face
                    </div>
                </div>*/}
                <div className={"joint-select-bar"}>
                    <InputLabel variant="standard" htmlFor="uncontrolled-native">
                        Joints Display
                    </InputLabel>
                    <NativeSelect
                        defaultValue={0}
                        inputProps={{
                            name: 'joint',
                            id: 'uncontrolled-native',
                        }}
                        onChange={handleJointChange}
                    >
                        <option value={0}>None</option>
                        <option value={1}>All</option>
                        <option value={2}>Head</option>
                        <option value={3}>Main Body</option>
                        <option value={4}>Right Arm</option>
                        <option value={5}>Left Arm</option>
                        <option value={6}>Right Leg</option>
                        <option value={7}>Left Leg</option>
                    </NativeSelect>
                </div>
                <div className={"button-div"}>
                    <button className={"button-item"} onClick={clearAll}>
                        Clear All
                    </button>
                    <button className={"button-item"} onClick={handleConfirm}>
                        Confirm
                    </button>
                    <button className={"button-item"} onClick={downloadTxtFile}>
                        {progress === 0 && <div>No File</div>}
                        {progress === 1 && <div style={{textAlign: "center", width:"20px", paddingLeft:"30px"}}>
                                                <Ring size={20}/>
                                            </div>}
                        {progress === 2 && <div>Download</div>}
                    </button>
                </div>
            </div>
        </div>
    );
}