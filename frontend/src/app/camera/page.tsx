"use client";
/* eslint-disable react/no-unescaped-entities */
import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Draggable from "react-draggable";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { storage } from "@/Api/services/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useDispatch } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Header from "@/components/header";
import { gripModel } from "@/Api/services/gripmodel";

// Styled Button with Glass Effect
const GlassButton = styled(Button)(({ theme }) => ({
  "&.MuiButton-contained": {
    transition: "background-color 0.3s ease",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(8px)",
    border: "1px solid transparent",
    color: "black",
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

const Camera = () => {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ballingGrip, setBallingGrip] = useState<string>("");
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [captureenable, setCaptureEnable] = useState(false);
  const [captureloading, setCaptureLoading] = useState(false);
  const [session, setSession] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  let title: string = "Camera";

  // Function to capture photo
  // Function to capture photo
  const capturePhoto = async () => {
    console.log("capturePhoto function called");

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

    // Check if model is null
    if (!model) {
      console.log("Handpose model is not loaded.");
      return;
    }

    // Check which finger is under the glass box
    const glassBoxCenterX = position.x + 10; // Adjust according to your glass box size
    const glassBoxCenterY = position.y + 30; // Adjust according to your glass box size
    let closestFinger: string | null = null;

    const predictions = await model.estimateHands(video);
    if (predictions && predictions.length > 0) {
      predictions.forEach((prediction) => {
        const landmarks = prediction.landmarks;
        if (landmarks && landmarks.length > 0) {
          const distances = landmarks.map((landmark) => {
            const [x, y] = landmark;
            return Math.sqrt(
              (x - glassBoxCenterX) ** 2 + (y - glassBoxCenterY) ** 2
            );
          });
          const closestIndex = distances.indexOf(Math.min(...distances));

          switch (closestIndex) {
            case 0:
              closestFinger = "Thumb";
              break;
            case 1:
              closestFinger = "Thumb";
            case 2:
              closestFinger = "Thumb";
            case 3:
              closestFinger = "Thumb";
            case 4:
              closestFinger = "Thumb";
              break;
            case 5:
              closestFinger = "Index";
              break;
            case 6:
              closestFinger = "Index";
              break;
            case 7:
              closestFinger = "Index";
              break;
            case 8:
              closestFinger = "Index";
              break;
            case 9:
              closestFinger = "Middle";
              break;
            case 10:
              closestFinger = "Middle";
              break;
            case 11:
              closestFinger = "Middle";
              break;
            case 12:
              closestFinger = "Middle";
              break;
            case 13:
              closestFinger = "Ring";
              break;
            case 14:
              closestFinger = "Ring";
              break;
            case 15:
              closestFinger = "Ring";
              break;
            case 16:
              closestFinger = "Ring";
              break;
            case 17:
              closestFinger = "Pinky";
              break;
            case 18:
              closestFinger = "Pinky";
              break;
            case 19:
              closestFinger = "Pinky";
              break;
            case 20:
              closestFinger = "Pinky";
              break;
            default:
              closestFinger = null;
              break;
          }
        }
      });
    }

    if (!closestFinger) {
      alert("Unable to determine closest finger.");
      return;
    }
console.log("closestFinger",closestFinger)
console.log("ballingGrip",ballingGrip)

    if (ballingGrip === "legcutter" && closestFinger !== "Middle") {
      alert("Incorrect grip. Please position the middle finger on the seam.");
      return;
    } else if (ballingGrip === "offcutter" && closestFinger !== "Index") {
      alert("Incorrect grip. Please position the index finger on the seam.");
      return;
    } else if (!closestFinger) {
      alert(
        "Unable to determine closest finger so pls move the glass box to the seam."
      );
      return;
    }

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

    // Call the grip model API
    setLoading(true);
    await gripModel(downloadUrl, ballingGrip)
      .then((response: any) => {
        setLoading(false);
      })
      .catch((error: any) => {
        setLoading(false);
        console.error("Error in grip model API:", error);
        alert("An error occurred in grip analysis. Please try again.");
      });
  };

  // Function to handle camera change
  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(event.target.value);
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setSession(event.target.value as string);
  };

  const handleGripChange = (event: SelectChangeEvent) => {
    setBallingGrip(event.target.value as string);
  };

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

  useEffect(() => {
    if (window.innerWidth <= 1000) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    setCaptureLoading(true);
    setCaptureEnable(false);
    const loadHandposeModel = async () => {
      const handposeModel = await handpose.load();
      setModel(handposeModel);
      setCaptureLoading(false);
    };

    loadHandposeModel();
  }, []);

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

  useEffect(() => {
    if (window.innerWidth <= 1000) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    const loadHandposeModel = async () => {
      const handposeModel = await handpose.load();
      setModelLoaded(true); // Set model loaded state to true
      // alert("Hand detection model loaded successfully!");
    };

    loadHandposeModel();
  }, []);

  useEffect(() => {
    if (modelLoaded && model) {
      // Add a null check for the model
      const detectHands = async () => {
        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4
        ) {
          const video = webcamRef.current.video as HTMLVideoElement;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

              // Detect hands
              const predictions = await model.estimateHands(video);
              if (predictions && predictions.length > 0) {
                // Draw landmarks for each hand prediction
                predictions.forEach((prediction) => {
                  const landmarks = prediction.landmarks;
                  if (landmarks && landmarks.length > 0) {
                    landmarks.forEach((landmark, index) => {
                      const [x, y] = landmark;
                      ctx.beginPath();
                      ctx.arc(x, y, 5, 0, 2 * Math.PI);
                      ctx.fillStyle = "green";
                      ctx.fill();

                      // Draw lines between specific landmarks
                      const connections = [
                        [0, 2],
                        [2, 3],
                        [3, 4],
                        [0, 5],
                        [0, 17],
                        [5, 9],
                        [9, 13],
                        [13, 17],
                        [5, 6],
                        [6, 7],
                        [7, 8],
                        [9, 10],
                        [10, 11],
                        [11, 12],
                        [13, 14],
                        [14, 15],
                        [15, 16],
                        [17, 18],
                        [18, 19],
                        [19, 20],
                      ];
                      ctx.strokeStyle = "blue";
                      ctx.lineWidth = 1;
                      connections.forEach(([start, end]) => {
                        const [startX, startY] = landmarks[start];
                        const [endX, endY] = landmarks[end];
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                      });
                    });
                  }
                });
              }
            }
          }
        }
        requestAnimationFrame(detectHands);
      };

      detectHands();
    }
  }, [modelLoaded, model]);

  return (
    <div>
      <Header title={title} />
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          display: "flex",
          flexDirection: "row",
          width: "10vw",
          height: "6vh",
        }}
      >
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

            zIndex: 10,
          }}
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
            </option>
          ))}
        </select>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={ballingGrip}
          label="Choose Tutorial"
          onChange={handleGripChange}
          sx={{
            marginBottom: "10px",
            backgroundColor: "white",
            color: "black",
          }}
        >
          <MenuItem value={"legcutter"}>Legcutter-Grip</MenuItem>
          <MenuItem value={"offcutter"}>Offcutter-Grip</MenuItem>
        </Select>
      </div>
      <Webcam
        ref={webcamRef}
        videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "140%", // Set width to 100%
          height: "100%",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%", // Set width to 100%
          height: "100%",
        }}
      />
      {isMobile ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Draggable
            onDrag={(e, ui) => {
              setPosition({ x: ui.x, y: ui.y });
            }}
          >
            <GlassBox
              id="glass-box"
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
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Draggable
            onDrag={(e, ui) => {
              setPosition({ x: ui.x, y: ui.y });
            }}
          >
            <GlassBox
              id="glass-box"
              sx={{
                // position: "absolute",
                top: position.y,
                left: position.x,
                width: "5vw",
                height: "120px",
                borderRadius: "10px",
                zIndex: 1,
              }}
            />
          </Draggable>
        </div>
      )}
      <Stack spacing={0} direction="row">
        <GlassButton
          variant="contained"
          onClick={capturePhoto}
          disabled={captureloading || loading}
          sx={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
          }}
        >
          {captureloading || loading ? <CircularProgress /> : "Capture"}
        </GlassButton>
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
};

export default Camera;
