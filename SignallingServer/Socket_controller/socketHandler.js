var path = require('path');

module.exports = function(io, streams) {

var Rooms = [];

 var People = function(id, name) {
    this.name = name;
    this.id = id;
  }

function Room(roomname, id, owner) {
  this.name = roomname;
  //this.id = id;
  this.owner = owner;
  this.people = [];
  this.participantCount = 0;
  this.peopleLimit = 4;
  this.status = "available";
  this.private = false;
};


function findRoom(arr, name) { 
     for(var i=0; i<arr.length; i++) {
        if (arr[i].name == name) return arr[i];
    }
    return null;
}


function inRoom(arr, name) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i].name == name) return true;
    }
    return false;
}


/*||||||||||||||||SOCKET|||||||||||||||||||||||*/
//Listen for connection
io.on('connection', function(socket) {
  //Globals
 // var defaultRoom = 'general';
 // var rooms = ["General", "angular", "socket.io", "express", "node", "mongo", "PHP", "laravel"];

  //Emit the rooms array
//  socket.emit('setup', {
  //  rooms: rooms
  //});

  socket.on('Create Room', function(data) {


      var rnew = new Room(data.name,socket.id, data.participant);

      var stream = new People(socket.id, data.participant);
      rnew.people.push(stream);

     // rnew.people.push(data.owner);
      rnew.participantCount++;
      rnew.peopleLimit--;
      if(inRoom(Rooms,data.name) == false)
      {
        socket.emit('Error',"Room already created with similar name");
      }
      Rooms.push(rnew);
      console.log('New room ' + data.name +'created by' + data.participant + 'with id ' + socket.id);
      socket.join(data.name);
      var datainfo = {"membertype" : "owner" , "id" : socket.id , "roomName" : data.name , "membername" : data.participant };
      //data.id = socket.id;
     // data.memberType = "owner";
      //console.log('datainfo sent ' + datainfo);
      socket.emit('id',datainfo);
  });


  //Listens for new user
  socket.on('join room', function(data) {

     if(inRoom(Rooms,data.name) == true)
     {
        var rm  = findRoom(Rooms,data.name);

        var stream = new People(socket.id, data.participant);
        rm.people.push(stream);

       // rm.people.push(data.owner);
        rm.participantCount++;
        rm.peopleLimit--;
        socket.join(data.name);

        console.log(data.participant + 'with id ' + socket.id + ' Joined ' + data.name );
        //Tell all those in the room that a new user joined
        //io.in(rm.name).emit('user joined', data.participant);
        data.from = socket.id;
        var datainfo = {"membertype" : "participant" , "id" : socket.id , "roomName" : data.name , "membername" : data.participant};
       // data.id = socket.id;
        //data.memberType = "participant";
        socket.emit('id',datainfo);
        //socket.broadcast.to(rm.name).emit('user joined', data);
      }
      else
        socket.emit('Error',"No Room exists with the name");
  
  });


   //New Joiner tells room participants to make offer
  socket.on('room offer', function(data) {

     if(inRoom(Rooms,data.name) == true)
     {
        var rm  = findRoom(Rooms,data.name);

        console.log(data.participant + ' is asking room members ' + data.name +'to make offer '  );
        //Tell all those in the room that a new user joined
        //io.in(rm.name).emit('user joined', data.participant);
        data.from = socket.id;
        data.type = "init";
        socket.broadcast.to(rm.name).emit('user joined', data);
      }
      else
        socket.emit('Error',"No Room exists with the name");
  
  });




// this is the relay message to exchange sdp info

socket.on('message', function (details) {
      

      console.log('in message ' + details);

      var socketid = details.to;
      console.log('details.to  ' + details.to);
      delete details.to;
      details.from = socket.id;
      console.log('details.from  ' + details.from);
       // otherClient.emit('message', details);

      socket.broadcast.to(socketid).emit('message', details);
    });



  //Send message
  socket.on('send message', function(data) {

   if(inRoom(Rooms,data.name) == true)
   {
      var rm  = findRoom(Rooms,data.name);
      
      //Tell all those in the room that a new user joined
      //io.in(rm.name).emit('user joined', data.owner);
      socket.broadcast.to(rm.name).emit('message', data.message);
      
    }
    else
      socket.emit('Error',"No Room exists with the name");

  });

  // Leave Room
  socket.on('Leave Room', function(data) {

      var index = 0;
      while(index < Rooms.length && Rooms[index].name != data.name){
        index++;
      }
      Rooms.splice(index, 1);
  });




  /*//Listens for switch room
  socket.on('switch room', function(data) {
    //Handles joining and leaving rooms
    //console.log(data);
    socket.leave(data.oldRoom);
    socket.join(data.newRoom);
    io.in(data.oldRoom).emit('user left', data);
    io.in(data.newRoom).emit('user joined', data);

  });

  //Listens for a new chat message
  socket.on('new message', function(data) {
    //Create message
    var newMsg = new Chat({
      username: data.username,
      content: data.message,
      room: data.room.toLowerCase(),
      created: new Date()
    });
  
  });
*/

});

};