import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamRecorder = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (webcamRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          webcamRef.current.srcObject = stream;
          mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setRecordedChunks([...recordedChunks, event.data]);
            }
          };
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });
    }
  }, []);

  const startRecording = () => {
    setRecordedChunks([]);
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  // const stopRecording = () => {
  //   if (mediaRecorderRef.current.state === 'recording') {
  //     mediaRecorderRef.current.stop();
  //     setRecording(false);
  //   }
  // };

  const stopRecording = async () => {
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob, 'recorded-video.webm');

      try {
        // Upload video data to the server
        await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Video uploaded successfully');
      } catch (error) {
        console.error('Error uploading video:', error);
      }
    }
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recorded-video.webm';
    document.body.appendChild(a);
    a.click();
  };

  return (
    <div>
      <Webcam ref={webcamRef} />
      <div>
        {recording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
        {recordedChunks.length > 0 && (
          <button onClick={downloadRecording}>Download Recording</button>
        )}
      </div>
    </div>
  );
};

export default WebcamRecorder;
