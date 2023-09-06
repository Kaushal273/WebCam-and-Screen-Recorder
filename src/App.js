import logo from './logo.svg';
import './App.css';
import WebcamRecorder from './Components/WebcamRecorder';
import ScreenRecorder from './Components/ScreenRecorder';

function App() {
  return (
    <div className="App">
      <h1>Webcam Recorder</h1>
      <WebcamRecorder/>

      <h1>Screen Recorder</h1>
      <ScreenRecorder/>
    </div>
  );
}

export default App;
