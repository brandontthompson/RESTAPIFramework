// const socket = require('socket.io')();
const Socket = ((server) => {
    return require('socket.io')(server);
});

module.exports = Socket
// const config = require('../../core/config');
// class Socket {

//     constructor(param, sock) {
//         if (!sock)
//             this.sock = new socket();

//         this.sock.use
//     }

//     Create(socketID) {
//         this.sock.join(socketID);
//     }

//     Destroy(callback) {
//         this.sock.close(callback ? callback : null);
//     }

//     Emit(event, callback) {
//         return this.sock.emit(event, callback);
//     }

//     On(event, callback) {
//         return this.sock.on(event, callback);
//     }

//     Clients() {
//         return this.sock.clients();
//     }

// }

// module.exports = Socket;