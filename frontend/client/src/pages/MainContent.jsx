import React from "react";
import { Box, Typography, Button, Select, MenuItem, TextField, Tabs, Tab } from "@mui/material";
import { sendRequest } from "../services/apiService";

const MainContent = ({ selectedRequest }) => {
    const [tab, setTab] = React.useState("params");
    const [response, setResponse] = React.useState(null);

    const handleSend = async () => {
        if (!selectedRequest) return;

        const res = await sendRequest({
            method: selectedRequest.method,
            url: selectedRequest.url,
            data: selectedRequest.body || {}, // optional for POST/PUT
        });

        setResponse(res);
        setTab("response"); // auto switch to response tab
    };

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: "#f5f2f2ff", color: "#fff", p: 3 }}>
            {selectedRequest ? (
                <>
                    {/* Request Editor */}
                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <Select
                            value={selectedRequest.method}
                            sx={{ backgroundColor: "#111", color: "#fff" }}
                        >
                            <MenuItem value="GET">GET</MenuItem>
                            <MenuItem value="POST">POST</MenuItem>
                            <MenuItem value="PUT">PUT</MenuItem>
                            <MenuItem value="DELETE">DELETE</MenuItem>
                        </Select>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={selectedRequest.url}
                            sx={{
                                input: { color: "#fff" },
                                backgroundColor: "#111",
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "#6c2bd9" }}
                            onClick={handleSend}
                        >
                            Send
                        </Button>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={tab}
                        onChange={(e, newVal) => setTab(newVal)}
                        textColor="secondary"
                        TabIndicatorProps={{ style: { backgroundColor: "#6c2bd9" } }}
                    >
                        <Tab label="Params" value="params" />
                        <Tab label="Headers" value="headers" />
                        <Tab label="Body" value="body" />
                        <Tab label="Response" value="response" />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {tab === "params" && <Typography>Query Params UI here</Typography>}
                        {tab === "headers" && <Typography>Headers UI here</Typography>}
                        {tab === "body" && (
                            <Typography>Body input UI here (JSON editor later)</Typography>
                        )}
                        {tab === "response" && (
                            <Box sx={{ p: 2, backgroundColor: "#111", borderRadius: "8px" }}>
                                {response ? (
                                    response.success ? (
                                        <pre style={{ color: "#0f0" }}>
                                            {JSON.stringify(response.data, null, 2)}
                                        </pre>
                                    ) : (
                                        <Typography color="error">Error: {response.error}</Typography>
                                    )
                                ) : (
                                    <Typography>No response yet</Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </>
            ) : (
                <Typography>Select a request to begin</Typography>
            )}
        </Box>
    );
};

export default MainContent;
