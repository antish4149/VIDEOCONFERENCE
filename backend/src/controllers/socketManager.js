import {connections } from 'mongoose';
import { Server, Socket } from 'socket.io';

export  const connectToSocket = (server) => {
    const io = new Server(server,{
        cors: {
            origin:'*',
            methods:['GET', 'POST'],
            allowedHeaders: ['*'],
            credentials:true;
        }
    });
    
    io.on('connection', (socket) => {

        socket.on('join-call', (path)=>{

            if(connections[path] == undefined){
                connections[path] = [];
            }

            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for(let a = 0; a < connections[path].length; i++){
                io.to(connections[path][a]).emit('user-joined', socket.id, connection[path]);
            }

            if(message[path] !=undefined){
                for(let a = 0; a < message[path].length; i++){
                    io.to(socket.id).emit('chat-message', message[path][a]['data'], 
                        message[path][a]['sender'], message[path][a]['socket-id-sender'])
                }
            }


        })

        socket.on('signal', (toId, message) => {
            io.to(toId).emit('signal', socket.id, message);
        })

        socket.on('chat-message', (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomsValue]) => {
                if(!isFound && roomsValue.includes(socket.id)){
                    return [roomKey, true]
                }

                return [room, isFound];
            }, ['', false]);

            if(found === true){
                if(message[matchingRoom] === undefined){
                    message[matchingRoom] = [];
                }

                message[matchingRoom].push({'sender':sender, 'data': data, 'socket-id-sender': socket.id});
                console.log("Message", KeyboardEvent, ":", sender, data);

                connections[matchingRoom].forEach(ele => {
                    io.to(ele).emit("chat-message", data, sender, socket.id);
                });
            }
        })

        socket.on('disconnect', () => {
            
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key;
            for(const[k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){

                for(let a = 0; a < v.length; ++a){
                    if(v[a] === socket.id){
                        key = k;

                        for(let a = 0; a < connections[key].length; ++a){
                            io.to(connections[key][a].emit('user-left', socket.id));
                        }

                        var index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);

                        if(connections[key][length] === 0){
                            delete connections[key];
                        }
                    }
                }
            }
        })
    })
}

