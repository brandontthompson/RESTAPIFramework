const Log = require('../logger/Log');
class SocketManager {
    constructor(server) {
        this.Log = Log;
        this.server = server;
        this.socket = require('./Socket')(server);
        this.connectedClients = [];
        this.index = 0;
        this.Init(this.socket);
    }

    Init(socket) {
        this.Log.writeLog("Socket listening...");
        socket.on('connection', ((socket) => {
            this.OnConnect(socket);
            this.Load
            this.onDisconnect(socket);
        }));
    }

    OnConnect(socket, callback) {
        this.Connect(socket);
        return callback;
    }

    onDisconnect(socket, callback) {
        socket.on('disconnect', (() => {
            this.Disconnect(socket.id);
        }));
        console.log(this.connectedClients);
        return callback;
    }

    Connect(socket) {
        this.connectedClients.push(socket.id)
        socket.emit('connected', { message: 'OK' });
        this.Log.writeLog("connected to socket! ID: {0}", socket.id);
    }

    Disconnect(socketID) {
        const index = this.connectedClients.findIndex((client) => client === socketID);
        if (index !== -1)
            return this.connectedClients.splice(index, 1)[0];
    }

    ResolveConnection(socketID) {
        return this.connectedClients.findIndex((client) => client === socketID);
    }

    Destroy(socket) {
        socket.clo
    }

    GetClient(socketID) {
        return this.connectedClients.find((client) => client.id === socketID);
    }

}

module.exports = SocketManager;