export default function Home() {
  return <h1>OpenMoCapBiomech - Motion Capture is Live</h1>;
}

import { useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [jointAngles, setJointAngles] = useState([]);
  const recordingRef = useRef(false);

  useEffect(() => {
    async function loadModel() {
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      async function detectPose() {
        if (!recordingRef.current) return;

        const poses = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;

          // Draw key points
          keypoints.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
          });

          // Calculate joint angles
          const angles = {
            leftKnee: calculateAngle(keypoints[5], keypoints[11], keypoints[13]),
            rightKnee: calculateAngle(keypoints[6], keypoints[12], keypoints[14]),
            leftElbow: calculateAngle(keypoints[5], keypoints[7], keypoints[9]),
            rightElbow: calculateAngle(keypoints[6], keypoints[8], keypoints[10])
          };

          setJointAngles(prev => [...prev, angles]);
        }

        requestAnimationFrame(detectPose);
      }

      detectPose();
    }

    loadModel();
  }, []);

  function calculateAngle(A, B, C) {
    let radians = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
    let angle = Math.abs(radians * (180 / Math.PI));
    return angle > 180 ? 360 - angle : angle;
  }

  function startRecording() {
    recordingRef.current = true;
  }

  function stopRecording() {
    recordingRef.current = false;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Biomechanics Motion Capture</h1>
      <video ref={videoRef} autoPlay playsInline width="640" height="480" style={{ border: "1px solid black" }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute", top: 0, left: 0 }} />
      <div>
        <button onClick={startRecording} style={{ margin: "10px", padding: "10px" }}>Start Tracking</button>
        <button onClick={stopRecording} style={{ margin: "10px", padding: "10px" }}>Stop Tracking</button>
      </div>
    </div>
  );
}
