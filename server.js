const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
//const PORT = process.env.PORT || 4000;
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect('/${uuidV4()}')
    res.sendFile(__dirname + "/room.ejs")
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

//app.listen(PORT, () => {
//    console.log("listening on port " + PORT)
//})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
        
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
    socket.on('chat', (data) => {
        io.sockets.emit("chat", data)
    })
})

server.listen(3000)