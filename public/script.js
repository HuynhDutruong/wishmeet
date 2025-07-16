const socket = io("https://wishmeet.onrender.com");
const videoGrid = document.getElementById('video-grid');
const votePanel = document.getElementById('vote-panel');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: location.protocol === 'https:' ? 443 : 3000
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
  addVideoStream(myVideo, stream);

  peer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', userId => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });
});

peer.on('open', id => {
  socket.emit('join-room', 'wishmeet-room', id);
});

document.getElementById('btn-raise-hand').onclick = () => {
  socket.emit('raise-hand');
};

socket.on('user-raised-hand', userId => {
  alert(`Người dùng ${userId} xin phát biểu`);
});

document.getElementById('btn-vote').onclick = () => {
  votePanel.hidden = false;
};

document.querySelectorAll('#vote-panel button').forEach(btn => {
  btn.onclick = () => {
    const vote = btn.getAttribute('data-vote');
    socket.emit('vote', vote);
    votePanel.hidden = true;
  };
});

socket.on('receive-vote', ({ userId, vote }) => {
  alert(`Người dùng ${userId} vote: ${vote}`);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.appendChild(video);
}
