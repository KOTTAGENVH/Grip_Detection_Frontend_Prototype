/* eslint-disable react/no-unescaped-entities */
"use client";
import Header from "@/components/header";
import React, { useRef, useState } from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { setImageUrl } from "../GlobalRedux/Feature/imageSlice";
import { ToastContainer, toast } from "react-toastify";
import Webcam from "react-webcam";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Image from "next/image";
import { storage } from "@/Api/services/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

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

function PhotoUploader() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const webcamRef = useRef<Webcam>(null);

  let title: string = "Uploader";

  const handleSelectChange = (event: SelectChangeEvent) => {
    setSession(event.target.value as string);
  };

  const dispatch = useDispatch();

  // Function to handle file upload
  const handleFileUpload = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/jpeg,image/jpg";
    fileInput.style.display = "none";
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'jpg' && fileExtension !== 'jpeg') {
        toast.error("Please upload a file in JPEG or JPG format.");
        return;
      }
      uploadPhoto(file);
    };
  
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };
  

  // Function to upload photo
  const uploadPhoto = async (file: File) => {
    // Upload the image file to Firebase Storage
    const storageRef = ref(storage, "non-resized-image/");
    const imageRef = ref(storage, `non-resized-image/${file.name}`);
    const uploadTask = uploadBytesResumable(imageRef, file);

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
        toast.error("An error occurred in uploading");
      },
      () => {
        // Upload completed successfully, get the download URL
        getDownloadURL(imageRef)
          .then(async (downloadUrl) => {
            // Do something with the download URL
            await dispatch(setImageUrl(downloadUrl));
            setLoading(false);
            alert("Image uploaded successfully");
            window.location.href = "/viewer";
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
        <GlassButton variant="contained" onClick={() => handleFileUpload()}>
  Upload
</GlassButton>
          <GlassButton variant="contained" onClick={handleOpen}>
            View Tutorial
          </GlassButton>
        </Stack>
      </div>
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

export default PhotoUploader;
