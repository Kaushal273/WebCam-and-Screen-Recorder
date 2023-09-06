import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ScreenRecorder = () => {
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Clean up the media stream when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      mediaRecorderRef.current = new MediaRecorder(screenStream, { mimeType: 'video/webm;codecs=vp9,opus' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks([...recordedChunks, event.data]);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Upload video data to the server and add it to the database
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, 'recorded-screen.webm');

        axios
          .post('http://localhost:5000/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(() => {
            console.log('Video uploaded successfully');
            setRecording(false); // Set recording state to false after upload
          })
          .catch((error) => {
            console.error('Error uploading video:', error);
          });
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setStream(screenStream);
    } catch (error) {
      console.error('Error accessing screen:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recorded-screen.webm';
    document.body.appendChild(a);
    a.click();
  };

  return (
    <div>
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

export default ScreenRecorder;



