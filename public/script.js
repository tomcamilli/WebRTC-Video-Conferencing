const socket = io.connect('http://localhost:3000');

socket.on('chat-message', data =>{
    console.log(data)
})

const message = document.getElementById('message')
var handle = document.getElementById('handle');
var output = document.getElementById('output');
var button = document.getElementById('button');

const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false    //true if we want audio
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-connected', userId => {
    console.log('User connected: ' + userId)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

// Emit events
button.addEventListener('click', function(e)
{
    e.preventDefault();
    socket.emit('chat', {
        message: message.value,
        handle: handle.value
    })
})

// Listen to events
socket.on('chat', (data)=>{
    output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
})