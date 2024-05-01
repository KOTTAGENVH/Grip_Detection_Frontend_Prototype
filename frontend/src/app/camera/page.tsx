/* eslint-disable react/no-unescaped-entities */
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
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { storage } from "@/Api/services/firebase";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { setImageUrl } from "../GlobalRedux/Feature/imageSlice";
import CircularProgress from "@mui/material/CircularProgress";
import { link } from "fs";

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
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
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
  const [loading, setLoading] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState("");
  const dispatch = useDispatch();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Function to capture photo
  const capturePhoto = async () => {
    const video = webcamRef.current?.video;
    if (!video) return toast.error("No Image found");

    // Create a canvas element to draw the image onto
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Draw the current frame from the video onto the canvas
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a data URL representing the image
    const imageDataUrl = canvas.toDataURL("image/jpeg");

    // Convert the data URL to a Blob object
    const blob = await fetch(imageDataUrl).then((res) => res.blob());

    // Create a file from the Blob object
    const timestamp = Date.now();
    const imageFileName = `captured-image-${timestamp}.jpg`;
    const imageFile = new File([blob], imageFileName, { type: "image/jpeg" });

    // Upload the image file to Firebase Storage
    const storageRef = ref(storage, "non-resized-image/");
    const imageRef = ref(storage, `non-resized-image/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Handle upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        // Handle upload error
        setLoading(false);
        console.error("Upload failed:", error);
        alert("An error occurred in uploading");
      },
      () => {
        // Upload completed successfully, get the download URL
        getDownloadURL(imageRef)
          .then(async (downloadUrl) => {
            // Do something with the download URL
            await dispatch(setImageUrl(downloadUrl));
            setLoading(false);
            alert("Image uploaded successfully");
          })
          .catch((error) => {
            // Handle getting download URL error
            setLoading(false);
            console.error("Error getting download URL:", error);
            toast.error("An error occurred while getting download URL");
          });
      }
    );

    // Wait for the upload to complete
    await uploadTask;

    // Get the URL of the uploaded image
    const downloadUrl = await getDownloadURL(imageRef);
  };

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
            onClick={capturePhoto}
            sx={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
            }}
          >
            {loading ? <CircularProgress /> : "Capture"}{" "}
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
                sx={{ marginBottom: "10px" }}
              >
                <MenuItem value={"legcutter"}>Legcutter-Grip</MenuItem>
                <MenuItem value={"offcutter"}>Offcutter-Grip</MenuItem>
                <MenuItem value={"fastballing-action-sideon"}>
                  Fastballing-Action-Sideon
                </MenuItem>
              </Select>
            </FormControl>
            <div>
              {session === "legcutter" ? (
                <>
                  <li>
                    Grip the ball with the index and middle fingers positioned
                    slightly across the seam towards the leg side.
                  </li>
                  <li>
                    Apply pressure with the thumb on the seam's top to generate
                    movement away from the batsman.
                  </li>
                  <li>
                    Maintain a loose grip to allow flexibility and variations in
                    delivery.
                  </li>
                  <Image
                    src="/legcutter.jpg"
                    alt="Legcutter Grip"
                    width={400}
                    height={200}
                    layout="responsive"
                    style={{
                      margin: "10px",
                    }}
                  />
                </>
              ) : session === "offcutter" ? (
                <>
                  <li>
                    Place the index and middle fingers slightly across the seam
                    towards the off side.
                  </li>
                  <li>
                    Apply pressure with the thumb on the seam's bottom to create
                    movement into the batsman.
                  </li>
                  <li>
                    Keep a relaxed grip for control and adaptability in
                    delivery.
                  </li>
                  <Image
                    src="/offcutter.jpg"
                    alt="Offcutter Grip"
                    width={400}
                    height={200}
                    layout="responsive"
                    style={{
                      margin: "10px",
                    }}
                  />
                </>
              ) : session === "fastballing-action-sideon" ? (
                <>
                  <li>
                    Start with a side-on stance, with your non-bowling shoulder
                    facing the batsman.
                  </li>
                  <li>
                    Generate power by driving off the back foot and transferring
                    weight onto the front foot during delivery.
                  </li>
                  <li>
                    Maintain a fluid arm action, accelerating the arm towards
                    the target with a strong follow-through for pace and
                    accuracy.
                  </li>
                  <video
                    src="/fastballer.MOV"
                    controls
                    width="400"
                    height="200"
                    style={{
                      margin: "10px",
                    }}
                  ></video>
                </>
              ) : (
                <Typography variant="h6">Select a tutorial</Typography>
              )}
            </div>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Camera;
