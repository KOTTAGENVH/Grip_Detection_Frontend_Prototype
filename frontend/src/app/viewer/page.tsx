"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import Header from "@/components/header";
import { Box, Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Draggable from "react-draggable";

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

const GlassBox = styled(Box)(({ theme }) => ({
  transition: "background-color 0.3s ease",
  backgroundColor: "rgba(255, 0, 0, 0.1)",
  backdropFilter: "blur(8px)",
  border: "1px solid transparent",
  transform: "perspective(500px) rotateX(15deg)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "black",
  },
  cursor: "move",
}));

function Viewer() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const image = useSelector((state: any) => state.image.image);

  let title: string = "Viewer";

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  return (
    <div>
      <Header title={title} />
      {image && (
        <div style={{ position: "relative" }}>
          <img
            alt="Camera-image"
            src={image}
            height="70%"
            width="1200vw"
            loading="lazy"
            style={{
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              userSelect: "none",
            }}
          />
          <Draggable>
            <GlassBox
              sx={{
                position: "absolute",
                top: position.y,
                left: position.x,
                width: "5vw",
                height: "120px",
                borderRadius: "10px",
                zIndex: 1,
              }}
              // onMouseDown={handleMouseDown}
              // onMouseUp={handleMouseUp}
              // onMouseMove={handleMouseMove}
            />
          </Draggable>
        </div>
      )}

      <GlassButton
        variant="contained"
        // onClick={capturePhoto}
        sx={{
          position: "absolute",
          bottom: "10px",
          width: "100%",
        }}
      >
        {loading ? <CircularProgress /> : "Upload"}{" "}
      </GlassButton>
    </div>
  );
}

export default Viewer;
