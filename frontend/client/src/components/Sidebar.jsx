import React from "react";
import { Box, Typography, Button, List, ListItem, ListItemText } from "@mui/material";

const Sidebar = ({ collections, onSelectRequest }) => {
    return (
        <Box
            sx={{
                width: "280px",
                backgroundColor: "#1a1a1a",
                color: "#fff",
                p: 2,
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>
                Collections
            </Typography>
            <Button
                variant="contained"
                size="small"
                sx={{ backgroundColor: "#6c2bd9", borderRadius: "8px" }}
            >
                + New Collection
            </Button>

            <List sx={{ mt: 2 }}>
                {collections.map((col, idx) => (
                    <Box key={idx}>
                        <Typography variant="body1" sx={{ fontWeight: "bold", mt: 2 }}>
                            {col.name}
                        </Typography>
                        {col.requests.map((req, rIdx) => (
                            <ListItem
                                key={rIdx}
                                button
                                onClick={() => onSelectRequest(req)}
                                sx={{ pl: 2 }}
                            >
                                <ListItemText primary={`${req.method} ${req.name}`} />
                            </ListItem>
                        ))}
                    </Box>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;
