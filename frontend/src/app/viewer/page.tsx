"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import Header from "@/components/header";
import { Box, Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Draggable from "react-draggable";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
import Image from "next/image";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [handLandmarks, setHandLandmarks] = useState<number[][]>([]);
  const [alertShown, setAlertShown] = useState<boolean>(false);
  const [tfReady, setTfReady] = useState<boolean>(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const image = useSelector((state: any) => state.image.image);

  useEffect(() => {
    if (window.innerWidth <= 1000) {
      setIsMobile(true);
    }
    async function loadTensorFlow() {
      await handpose.load();
      setTfReady(true);
      setLoading(false);
    }
    loadTensorFlow();
  }, []);

  useEffect(() => {
    detectHands();
  }, [tfReady]);

  const detectHands = async () => {
    if (tfReady && imageRef.current) {
      const net = await handpose.load();
      const predictions = await net.estimateHands(imageRef.current);
      if (predictions.length > 0) {
        setHandLandmarks(predictions[0].landmarks);
      } else {
        setHandLandmarks([]);
        if (!alertShown) {
          alert("No hand detected.");
          setAlertShown(true);
        }
      }
    }
  };

  let title: string = "Viewer";

  return (
    <div>
      <Header title={title} />
      {image && (
        <div style={{ position: "relative" }}>
          <Image
            ref={imageRef}
            alt="Camera-image"
            src={image}
            height={800}
            width={1000}
            loading="lazy"
            style={{
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              userSelect: "none",
            }}
          />
          {imageRef.current && handLandmarks.length > 0 && (
            <svg
              style={{
                position: "absolute",
                top: imageRef.current.offsetTop || 0,
                left: imageRef.current.offsetLeft || 0,
                width: imageRef.current.offsetWidth || 0,
                height: imageRef.current.offsetHeight || 0,
              }}
            >
              {handLandmarks.map((landmark, index) => (
                <circle
                  key={index}
                  cx={landmark[0]}
                  cy={landmark[1]}
                  r="5"
                  fill="blue"
                />
              ))}
              {handLandmarks.map(
                (landmark, index) =>
                  index < handLandmarks.length - 1 && (
                    <line
                      key={index}
                      x1={handLandmarks[index][0]}
                      y1={handLandmarks[index][1]}
                      x2={handLandmarks[index + 1][0]}
                      y2={handLandmarks[index + 1][1]}
                      stroke="red"
                      strokeWidth="1"
                    />
                  )
              )}
            </svg>
          )}
          {isMobile ? (
            <Draggable onDrag={(e, ui) => setPosition({ x: ui.x, y: ui.y })}>
              <GlassBox
                sx={{
                  top: position.y,
                  left: position.x,
                  width: "20px",
                  height: "60px",
                  borderRadius: "10px",
                  zIndex: 1,
                }}
              />
            </Draggable>
          ) : (
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
              />
            </Draggable>
          )}
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
