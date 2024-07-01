"use client";
import Header from "@/components/header";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import { storage } from "@/Api/services/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { setImageUrl } from "../GlobalRedux/Feature/imageSlice";
import Slider from "@mui/material/Slider";

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

const PoseHome: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [played, setPlayed] = useState<number>(0);
  const [maxSlowDown, setMaxSlowDown] = useState<number>(1);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [sliderMin, setSliderMin] = useState<number>(0);
  const [sliderMax, setSliderMax] = useState<number>(100);
  const videoURL = useSelector((state: any) => state.image.image);
  const videoRef = useRef<HTMLVideoElement>(null);

  const title: string = "Pose Analysis";
  const dispatch = useDispatch();

  useEffect(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      console.log("video duration", videoDuration);
      console.log("video duration", videoDuration / 14);
      const maxSlowDown = Math.floor(videoDuration / 20); // Assuming 20 seconds as the minimum duration for slowed down playback
      setMaxSlowDown(maxSlowDown > 0 ? maxSlowDown : 1);
        setSliderMax(Math.floor(videoDuration)); // Set slider max to video duration
    }
  }, [videoURL]);

  const handleFileUpload = async () => {
    setLoading(true);
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/MOV,video/mp4,video/mov, video/mkv";
    fileInput.style.display = "none";

    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        fileExtension !== "mov" &&
        fileExtension !== "mp4" &&
        fileExtension !== "mov"
      ) {
        toast.error("Please upload a file in mp4 or MOV format.");
        setLoading(false);
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 20) {
          alert("The video duration must be 20 seconds or less.");
          setLoading(false);
          return;
        } else {
          await uploadPhoto(file);
        }
      };

      video.src = URL.createObjectURL(file);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const uploadPhoto = async (file: File) => {
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
      async () => {
        getDownloadURL(imageRef)
          .then(async (downloadUrl) => {
            await dispatch(setImageUrl(downloadUrl));
            setLoading(false);
            alert("Video uploaded successfully");
            if (videoRef.current) {
              videoRef.current.load();
            }
          })
          .catch((error) => {
            setLoading(false);
            console.error("Error getting download URL:", error);
            toast.error("An error occurred while getting download URL");
          });
      }
    );

    await uploadTask;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (rate >= 0.25) {
      setPlaybackRate(rate);
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSliderChange = (event: any, newValue: number | number[]) => {
    if (videoRef.current && typeof newValue === "number" && isFinite(newValue)) {
      videoRef.current.currentTime = newValue;
      setSliderValue(newValue);
    }
  };
  
  
  return (
    <div>
      <ToastContainer />
      <Header title={title} />
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "90vh",
          alignContent: "center",
          alignSelf: "center",
          textAlign: "center",
          marginLeft: "20%",
        }}
      >
        {videoURL && (
          <div>
            <video
              ref={videoRef}
              controls
              onTimeUpdate={(e) =>
                setPlayed(
                  (e.target as HTMLVideoElement).currentTime /
                    (e.target as HTMLVideoElement).duration
                )
              }
              style={{
                width: "80%",
                height: "60%",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <source src={videoURL} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
              Current Slow Down Rate: {playbackRate}x
            </div>
          </div>
        )}
        <div className="box-border h-16 md:w-10/12 p-4 border-4 rounded-xl flex justify-between items-center">
          <button className="hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2">
            {"<"}
          </button>
          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            aria-labelledby="continuous-slider"
            valueLabelDisplay="auto"
            min={sliderMin}
            max={sliderMax}
          />
          <button className="hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2">
            {">"}
          </button>
        </div>

        <Stack
          spacing={2}
          direction="row"
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            alignSelf: "center",
            textAlign: "center",
            marginRight: "20%",
          }}
        >
          <GlassButton
            variant="contained"
            onClick={() => handleFileUpload()}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </GlassButton>
          <GlassButton variant="contained" onClick={() => handlePlayPause()}>
            {isPlaying ? "Pause" : "Play"}
          </GlassButton>
          <GlassButton
            variant="contained"
            onClick={() => handlePlaybackRateChange(playbackRate - 0.1)}
          >
            Slow Down
          </GlassButton>
          <GlassButton
            variant="contained"
            onClick={() => handlePlaybackRateChange(playbackRate + 0.1)}
          >
            Speed Up
          </GlassButton>
          <GlassButton
            variant="contained"
            onClick={() => {
              if (
                videoRef.current &&
                typeof videoRef.current.currentTime === "number"
              ) {
                handleSeek(videoRef.current.currentTime - 2);
              }
            }}
          >
            Backward
          </GlassButton>
          <GlassButton
            variant="contained"
            onClick={() => {
              if (
                videoRef.current &&
                typeof videoRef.current.currentTime === "number"
              ) {
                handleSeek(videoRef.current.currentTime + 2);
              }
            }}
          >
            Forward
          </GlassButton>
        </Stack>
      </div>
    </div>
  );
};

export default PoseHome;
