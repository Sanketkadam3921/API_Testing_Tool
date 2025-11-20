import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Folder, Public, History } from "@mui/icons-material";

const MainSidebar = ({ activeTab, setActiveTab }) => {
    return (
        <Box
            sx={{
                width: "70px",
                backgroundColor: "#111",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 2,
            }}
        >
            <Tooltip title="Collections" placement="right">
                <IconButton
                    sx={{ color: activeTab === "collections" ? "#6c2bd9" : "#aaa" }}
                    onClick={() => setActiveTab("collections")}
                >
                    <Folder />
                </IconButton>
            </Tooltip>

            <Tooltip title="Environments" placement="right">
                <IconButton
                    sx={{ color: activeTab === "environments" ? "#6c2bd9" : "#aaa" }}
                    onClick={() => setActiveTab("environments")}
                >
                    <Public />
                </IconButton>
            </Tooltip>

            <Tooltip title="History" placement="right">
                <IconButton
                    sx={{ color: activeTab === "history" ? "#6c2bd9" : "#aaa" }}
                    onClick={() => setActiveTab("history")}
                >
                    <History />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default MainSidebar;
