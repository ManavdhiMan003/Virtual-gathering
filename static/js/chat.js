var members={};
var mycolor;
function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$(document).ready(function(){
    console.log("hello")
    var socket = io.connect('http://'+document.domain+':'+location.port+'/chat');
    socket.on('connect',function(){
        socket.emit('joinned',{});
        var name = document.getElementsByTagName('meta')[0].getAttribute('name');
        members[name].update();
    });
    socket.on('status',function(data){
        $('#chat').val($('#chat').val()+'<'+data.msg+'>\n');
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    })
    socket.on('message',function(data){
        $('#chat').val($('#chat').val()+'<from '+data.name+' -> '+data.msg+'>\n');
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    })
    socket.on('left',function(data){
        $('#chat').val($('#chat').val()+data.name+' left the room>\n');
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    })
    
});
function f(){
    var socket = io.connect('http://'+document.domain+':'+location.port+'/chat');
    var data = $('#text').val();
    if(data=="" || data==null){
        alert("Empty message");
        return;
    }
    socket.emit('text',{'msg':data});
    $('#text').val("");
}
function leave_room(){
    var socket = io.connect('http://'+document.domain+':'+location.port+'/chat');

    socket.emit('left',{},function(){
        socket.disconnect();
        window.location.href = 'http://'+document.domain+':'+location.port;
    });
}
/*var msg = io.connect('http://127.0.0.1:5000/messages');
function f(){
    console.log($('#myMessage').val());
    var data = $('#myMessage').val();
    msg.emit('fun',data);
} */
// var canvas = document.querySelector('canvas')
// canvas.width = 800;
// canvas.height = 350;
// var c = canvas.getContext('2d');
// c.fillRect(45,45,45,45);
// members[c]
// c.clear(gl.COLOR_BUFFER_BIT);
// c.fillRect(100,100,100,100,100,100,100,100);
function startGame(name, color) {
    members[name] = new component(30, 30, 10, 120,color);
}
function start(){
    // console.log("heoenlenlkenlkelk");
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
    // name = name.getAttribute('name');
    console.log(name);  
    mycolor = generateRandomColor();
    // console.log(mycolor);
    $('#your_color').css({'background-color': mycolor});
    startGame(name, mycolor);
    battlefield.start();
    // setInterval(function(){
    //     battlefield.clear();
    // }, 100);
}
var battlefield ={
    canvas: document.createElement('canvas'),
    start: function(){
        this.canvas.height = 400;
        this.canvas.width = 700;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas,document.body.childNodes[0]);
        this.interval = setInterval(updateBattle, 5);
    },
    clear: function(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
}
class component{
    constructor(widht,height,x,y,color){
        this.width = widht;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speedx = 0;
        this.speedy = 0;
        this.update = function(){
            console.log("inside update");
            var board = battlefield.context;
            board.fillStyle = color;
            board.fillRect(this.x,this.y,this.width,this.height);
        }
        this.newPos = function(){
            if(this.x<0 && this.speedx<0){
                this.speedx=0;
            }
            else if(this.x>680 && this.speedx>0){
                this.speedx=0;
            }
            else if(this.y<1 && this.speedy<0){
                this.speedy=0
            }
            else if(this.y>380 && this.speedy>0){
                this.speedy=0
            }
            else{
                this.x+=this.speedx;
                this.y+=this.speedy;
            }
        }
    }    
}
function updateBattle(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
    members[name].newPos();
}
function moveUp(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
    // console.log(name);
    members[name].speedy-=0.1;
}
function moveDown(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
    members[name].speedy+=0.1;
}
function moveLeft(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
    members[name].speedx-=0.1;
}
function moveRight(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
    members[name].speedx+=0.1;
}