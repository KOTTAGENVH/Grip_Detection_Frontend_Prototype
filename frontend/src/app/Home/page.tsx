"use client";
import Header from "@/components/header";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import React, { useRef, useEffect, useState, use } from "react";
import { styled } from "@mui/material/styles";
import Link from 'next/link';

// Styled Button with Glass Effect
const GlassButton = styled(Button)(({ theme }) => ({
  "&.MuiButton-contained": {
    transition: "background-color 0.3s ease",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(8px)",
    border: "1px solid transparent",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      color: "black",
    },
  },
}));

function HomePage() {
  let title: string = "Home";

  return (
    <div>
      <Header title={title} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "90vh",
          width: "100vw",
        }}
      >
      <Stack spacing={2} direction="row">
          <Link href="/camera">
            <GlassButton variant="contained">Camera</GlassButton>
          </Link>
          <Link href="/photo_uploader">
            <GlassButton variant="contained">Uploader</GlassButton>
          </Link>
        </Stack>
      </div>
    </div>
  );
}

export default HomePage;
