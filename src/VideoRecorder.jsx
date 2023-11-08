import { useState, useRef, useEffect } from "react";
import Share from "./Share";

const mimeType = 'video/webm; codecs="opus,vp8"';

const VideoRecorder = () => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);
  const liveVideoFeed = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream, setStream] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);
  const [files, setFiles] = useState(null);
  const [devices, setDevices] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const getCameraPermission = async () => {
    console.log("getCameraPermission()");

    //get video and audio permissions and then stream the result media stream to the videoSrc variable
    if ("MediaRecorder" in window) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            aspectRatio: { exact: 16 / 9 },
            height: { max: 360 },
            // width: { max: 640 },
            deviceId: { exact: selectedDevice },
          },
        });

        console.log(videoStream);

        setPermission(true);

        setStream(videoStream);

        //set videostream to live feed player
        liveVideoFeed.current.srcObject = videoStream;

        const settings = videoStream.getVideoTracks()[0].getSettings();

        console.log(settings);
      } catch (err) {
        console.log({ err });
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");

    const media = new MediaRecorder(stream, { mimeType });

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localVideoChunks = [];

    mediaRecorder.current.ondataavailable = (event) => {
      console.log({ event });
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
    };

    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    setPermission(false);
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);

      setRecordedVideo(videoUrl);

      // setVideoChunks([]);
    };
  };

  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log({ devices });
    setDevices(devices);
  };

  useEffect(() => {
    getDevices();
  }, []);

  const fileHandler = (e) => {
    setFiles(e.target.files[0]);
  };

  const handleSharing = async () => {
    const title = "My Web Share Adventures";
    const text = "Hello World! I shared this content via Web Share";

    //upload file
    // console.log({ files });
    // const filePropeties = [
    //   new File([files], files.name, {
    //     type: files.type,
    //   }),
    // ]; //blob:http://localhost:5173/29deeac5-b8e9-42e5-a02f-b7501392f03c

    let file = new File([videoChunks], "video.mp4", { type: mimeType });
    const shareDetails = {
      files: [file],
      title,
      text,
    };

    try {
      await navigator.share(shareDetails);
    } catch (err) {
      console.log(`Oops! I couldn't share to the world because: ${err}`);
    } finally {
      return;
    }
  };

  const slectorHandler = (e) => {
    setSelectedDevice(e.target.value);
  };

  return (
    <div>
      <h2>Video Recorder</h2>
      <main>
        <div className="video-controls">
          {!permission ? (
            <button onClick={getCameraPermission} type="button">
              Get Camera
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <button onClick={startRecording} type="button">
              Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          ) : null}
        </div>
        <select onChange={slectorHandler}>
          {devices &&
            devices.map((data, idx) => {
              if (data.kind === "videoinput") {
                return (
                  <option key={idx} value={data.deviceId}>
                    {data.kind}
                  </option>
                );
              }
            })}
          <option value=""></option>
        </select>
      </main>

      <div className="video-player">
        <canvas
          id="myCanvas"
          width="640"
          height="360"
          style={{ border: "1px solid red" }}
        ></canvas>
        {!recordedVideo ? (
          <video
            ref={liveVideoFeed}
            autoPlay
            muted
            playsInline
            className="live-player"
          ></video>
        ) : null}
        {recordedVideo ? (
          <div className="recorded-player">
            <video className="recorded" src={recordedVideo} controls></video>
            <a download href={recordedVideo}>
              Download Recording
            </a>
          </div>
        ) : null}
      </div>
      <input type="file" onChange={fileHandler} />
      <button className="sharer-button" onClick={handleSharing}>
        <span className="sharer-button-text">Share</span>
      </button>
      {/* <div>
        <Share
          label="Share"
          title="My Web Share Adventures"
          text="Hello World! I shared this content via Web Share"
          file={files}
        />
      </div> */}
    </div>
  );
};

export default VideoRecorder;
