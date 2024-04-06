let io;

module.exports = {
    init: httpServer => {
        const Server = require('socket.io').Server;
        io = new Server(httpServer);
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    },
};