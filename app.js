function startVideo() {
  const sound = document.getElementById('clickSound');
  sound.currentTime = 0;
  sound.play();
  window.location.href = '/video';
}

function startText() {
  const sound = document.getElementById('clickSound');
  sound.currentTime = 0;
  sound.play();
  window.location.href = '/text';
}
