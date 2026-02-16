// KlypoChat - Full JS (no backend, peer-to-peer sim via fake stream)
let localStream = null;
let recorder = null;
let recordedChunks = [];
let isRecording = false;

// DOM refs
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const chatOutput = document.getElementById('chatOutput');
const chatInput = document.getElementById('chatInput');

// Fake stranger replies (for text mode)
const fakeReplies = [
  "Hey what's up?",
  "Nice to meet you!",
  "Where you from?",
  "This is wild lol",
  "You look chill",
  "Wanna keep going?",
  "Haha yeah same",
  "What's your vibe?",
  "Random but cool",
  "I'm bored, talk to me"
];

// Start video call
function startVideo() {
  document.getElementById('main')?.style.display = 'none';  // hide home if exists
  document.getElementById('videoCall').style.display = 'block';

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      localStream = stream;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.muted = true;
        localVideo.play().catch(e => console.log("Auto-play blocked:", e));
      }

      // Simulate remote stranger (colored pulsing box)
      if (remoteVideo) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        const animate = () => {
          if (!remoteVideo.srcObject) return;
          ctx.fillStyle = `#${Math.floor(Math.random()*16777215).toString(16)}`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '48px Arial';
          ctx.fillText('Stranger', 200, 240);
          requestAnimationFrame(animate);
        };
        remoteVideo.srcObject = canvas.captureStream(15);
        remoteVideo.play();
        animate();
      }
    })
    .catch(err => {
      alert("Camera access denied. Check permissions.");
      console.error("getUserMedia error:", err);
    });
}

// Record video
function startRecord() {
  if (!localStream || isRecording) return;
  recorder = new MediaRecorder(localStream);
  recordedChunks = [];
  recorder.ondataavailable = e => recordedChunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klypo-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    isRecording = false;
    document.getElementById('recordBtn')?.textContent = 'Record';
  };
  recorder.start();
  isRecording = true;
  document.getElementById('recordBtn')?.textContent = 'Stop Recording';
}

// Stop recording (toggle)
function stopRecord() {
  if (recorder && isRecording) recorder.stop();
}

// Hang up video
function hangUp() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (localVideo) localVideo.srcObject = null;
  if (remoteVideo) remoteVideo.srcObject = null;
  document.getElementById('videoCall').style.display = 'none';
  document.getElementById('main')?.style.display = 'block';
  isRecording = false;
  recorder = null;
  recordedChunks = [];
}

// Start text chat
function startText() {
  document.getElementById('main')?.style.display = 'none';
  document.getElementById('textChat').style.display = 'block';
  chatOutput.innerHTML = '<p class="msg stranger">Hey... connected.</p>';
  chatInput.focus();

  // Fake replies every 4-8 seconds
  const replyInterval = setInterval(() => {
    if (document.getElementById('textChat').style.display === 'none') {
      clearInterval(replyInterval);
      return;
    }
    if (Math.random() > 0.6) {
      const msg = fakeReplies[Math.floor(Math.random() * fakeReplies.length)];
      addMessage('stranger', msg);
    }
  }, Math.random() * 4000 + 4000);
}

// Add message to chat
function addMessage(sender, text) {
  const p = document.createElement('p');
  p.className = `msg ${sender}`;
  p.textContent = text;
  chatOutput.appendChild(p);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Send text
function sendText() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage('you', text);
  chatInput.value = '';
}

// Leave text chat
function leaveText() {
  document.getElementById('textChat').style.display = 'none';
  document.getElementById('main')?.style.display = 'block';
  chatOutput.innerHTML = '';
}

// Auto-refresh page every 30 min (prevents stale tabs)
setTimeout(() => location.reload(), 30 * 60 * 1000);

// Hover sound (tiny click)
const hoverSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWVvT19iYXRjaA=='); // short beep
document.querySelectorAll('.btn, .chat-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(() => {});
  });
});
