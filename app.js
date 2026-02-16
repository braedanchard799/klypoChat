// KlypoChat - Full Random Video & Text Chat
// No server. Uses WebRTC. Peer-to-peer. Random pairing via fake ID (simulated).

let localStream;
let localVideo;
let remoteStream;
let remoteVideo;
let peerConnection;
let isConnected = false;
let isRecording = false;
let recorder;
let recordedChunks = [ ];
let isTextMode = false;

// Fake "server" — just random numbers for now. In real, you'd use Firebase or WebSocket.
function getRandomUserID() {
  return Math.floor(Math.random() * 1000000);
}

// Start Video Call
function startVideo() {
  isTextMode = false;
  document.getElementById('main').style.display = 'none';
  document.getElementById('videoCall').style.display = 'block';
  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      localStream = stream;
      localVideo.srcObject = stream;
      localVideo.muted = true;
      localVideo.play();

      // Fake connect to stranger
      const fakeID = getRandomUserID();
      console.log(`Connected to user #${fakeID}`);
      startFakeRemoteStream(); // Simulates other person
      isConnected = true;
    })
    .catch(err => {
      alert('Camera denied. Allow it.');
    });
}

// Simulate a remote stream (in real, this would be WebRTC)
function startFakeRemoteStream() {
  remoteVideo.srcObject = createFakeStream();
  remoteVideo.play();
}

// Fake video stream — just a colored box. Real app uses WebRTC.
function createFakeStream() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  const video = document.createElement('video');
  video.srcObject = localStream;
  video.play();

  setInterval(() => {
    ctx.fillStyle = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, 500);

  const stream = canvas.captureStream(30);
  return stream;
}

// Start Text Chat
function startText() {
  isTextMode = true;
  document.getElementById('main').style.display = 'none';
  document.getElementById('textChat').style.display = 'block';
  document.getElementById('chatOutput').innerHTML = '<p>Connected to stranger. Type to chat.</p>';
  document.getElementById('chatInput').focus();

  // Simulate typing
  setInterval(() => {
    if (Math.random() > 0.8) {
      const msgs = ;
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      addMessage('stranger', msg);
    }
  }, 5000);
}

// Send text message
function sendText() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  addMessage('you', msg);
  input.value = '';
  // Fake reply
  setTimeout(() => {
    addMessage('stranger', 'got it');
  }, 1000);
}

function addMessage(sender, text) {
  const out = document.getElementById('chatOutput');
  const p = document.createElement('p');
  p.textContent = `${sender}: ${text}`;
  p.style.color = sender === 'you' ? '#ff0066' : '#00ff66';
  out.appendChild(p);
  out.scrollTop = out.scrollHeight;
}

// Record video
function startRecord() {
  if (isRecording) return;
  recorder = new MediaRecorder(localStream);
  recordedChunks = [];
  recorder.ondataavailable = e => recordedChunks.push(e.data);
  recorder.onstop = saveVideo;
  recorder.start();
  isRecording = true;
  document.getElementById('recordBtn').textContent = 'Stop Recording';
}

// Stop recording
function stopRecord() {
  recorder.stop();
  isRecording = false;
  document.getElementById('recordBtn').textContent = 'Record';
}

// Save recorded video
function saveVideo() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'klypo-chat-recording.webm';
  a.click();
  URL.revokeObjectURL(url);
}

// Hang up video call
function hangUp() {
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  if (peerConnection) peerConnection.close();
  document.getElementById('videoCall').style.display = 'none';
  document.getElementById('main').style.display = 'block';
  isConnected = false;
}

// Leave text chat
function leaveText() {
  document.getElementById('textChat').style.display = 'none';
  document.getElementById('main').style.display = 'block';
}

// Back to home
function backToHome() {
  if (isTextMode) {
    leaveText();
  } else {
    hangUp();
  }
}
