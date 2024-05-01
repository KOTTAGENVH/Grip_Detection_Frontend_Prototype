import React from "react";
import { Box, Stack, Button } from "@mui/material";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        width: "100%",
        height: "60px", // Change the height as needed
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Adjust the transparency as needed
        backdropFilter: "blur(10px)", // Glass effect
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px", // Adjust padding as needed
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>{title}</Box>
      <Box>
        <Stack spacing={2} direction="row">
          <Button variant="contained">Grip</Button>
          <Button variant="contained">Pose</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Header;