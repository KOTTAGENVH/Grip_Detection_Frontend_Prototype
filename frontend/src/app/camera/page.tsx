"use client";
import Header from "@/components/header";
import Webcam from "react-webcam";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

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

const modalstyle = {
  position: "absolute" as "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: 4,
  color: "black",
  borderRadius: "20px",
};

function Camera() {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  let title: string = "Camera";

  useEffect(() => {
    const fetchCamera = async () => {
      // Fetch available cameras
      const availableCameras = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = availableCameras.filter(
        (device) => device.kind === "videoinput"
      );
      setCameras(videoDevices);
      setSelectedCamera(videoDevices[0]?.deviceId || null);
    };

    fetchCamera();
  }, []);

  // Function to handle camera change
  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(event.target.value);
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setSession(event.target.value as string);
  };

  return (
    <div>
      <Header title={title} />
      <select
        aria-label="Select Camera"
        value={selectedCamera || ""}
        onChange={handleCameraChange}
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "10px",
          borderRadius: "10px",
          margin: "10px",
          position: "absolute",
          zIndex: 10,
        }}
      >
        {cameras.map((camera) => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
          </option>
        ))}
      </select>
      <Webcam
        ref={webcamRef}
        videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
        style={{
          left: 0,
          top: 0,
          width: "100vw",
          height: "90vh",
        }}
      />
      <Stack spacing={0} direction="row">
        <Link href="/camera">
          <GlassButton
            variant="contained"
            sx={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
            }}
          >
            Capture
          </GlassButton>
        </Link>
        <GlassButton
          variant="contained"
          sx={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            width: "fullWidth",
          }}
          onClick={handleOpen}
        >
          View Tutorial
        </GlassButton>
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalstyle}>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Choose Tutorial
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={session}
                label="Choose Tutorial"
                onChange={handleSelectChange}
              >
                <MenuItem value={"legcutter"}>Legcutter-Grip</MenuItem>
                <MenuItem value={"offcutter"}>Offcutter-Grip</MenuItem>
                <MenuItem value={"fastballing-action-sideon"}>
                  Fastballing-Action-Sideon
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Camera;
