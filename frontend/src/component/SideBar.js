import React from "react";
import {
    ProSidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarContent,
    SidebarFooter
} from "react-pro-sidebar";
import { FaGem, FaList, FaGithub } from "react-icons/fa";
import {Link, NavLink} from "react-router-dom";
import {
    AiOutlineHome,
    BiReset, HiOutlineMailOpen,
    MdSkipNext, MdSkipPrevious
} from "react-icons/all";

export default function SideBar(props) {
    const headerStyle = {
        padding: "24px",
        textTransform: "uppercase",
        fontWeight: "bold",
        letterSpacing: "1px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "noWrap"
    };

    return (
        <ProSidebar>
            <SidebarHeader style={headerStyle}>Logo</SidebarHeader>
            <SidebarContent>
                <Menu iconShape="circle">
                    <MenuItem icon={<AiOutlineHome />} onClick={props.handleResetAll}><NavLink to={"/"}>Reset All</NavLink></MenuItem>
                    <MenuItem icon={<BiReset />} onClick={props.handleReset}>Reset Current</MenuItem>
                    <MenuItem icon={<MdSkipPrevious />}><NavLink to={props.prev}>Prev Step</NavLink></MenuItem>
                    <MenuItem icon={<MdSkipNext />}><NavLink to={props.next}>Next Step</NavLink></MenuItem>
                </Menu>
            </SidebarContent>
            <SidebarFooter style={{ textAlign: "center" }}>
                <div
                    className="sidebar-btn-wrapper"
                    style={{
                        padding: "20px 24px"
                    }}
                >
                    <a
                        href="mailto:xul41@mcmaster.ca"
                        target="_blank"
                        className="sidebar-btn"
                        rel="noopener noreferrer"
                    >
                        <HiOutlineMailOpen />
                        <span>Contact Me</span>
                    </a>
                </div>
            </SidebarFooter>
        </ProSidebar>
    );
}