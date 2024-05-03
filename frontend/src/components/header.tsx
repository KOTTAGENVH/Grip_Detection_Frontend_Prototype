import React from "react";
import { Box, Stack, Button, Typography } from "@mui/material";
import Link from "next/link";

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
      <Link href="/">
        <Box sx={{ display: "flex", alignItems: "center" }}>{title}</Box>
      </Link>
      <Box>
        <Typography> @CricBoost 2024</Typography>
      </Box>
    </Box>
  );
};

export default Header;
