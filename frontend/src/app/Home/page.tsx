"use client";
import Header from "@/components/header";
import Webcam from "react-webcam";
import React, { useRef, useEffect, useState } from "react";

function HomePage() {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const webcamRef = useRef<Webcam>(null);
  let title: string = "Home";

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
    </div>
  );
}

export default HomePage;
