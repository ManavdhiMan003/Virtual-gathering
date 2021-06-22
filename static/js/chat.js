var members={};
var mycolor;
var socket;
function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$(document).ready(function(){
    
    socket = io.connect('http://'+document.domain+':'+location.port+'/chat');
    socket.on('connect',function(){
        socket.emit('joinned',{color:mycolor});
    });
    socket.on('position_change',function(data){
        //correct
        // var other = data.name;
        // if(typeof members[other] == 'undefined'){  
        //     return;
        // }
        // var newx = data.newx;
        // var newy = data.newy;
        // members[other].x=newx;
        // members[other].y=newy;
        // var name = document.getElementsByTagName('meta')[0].getAttribute('name');
        // members[other].update();
        
        
        // console.log(data.hash);
        var other = (JSON.parse(data.hash));
        // battlefield.clear();
        // console.log("hllll");
        // console.log(other)
        battlefield.clear();
        for (const key in other) {
            // console.log(key);
            // console.log(members[key],key);
            if(typeof members[key] == 'undefined'){
                // console.log("oh no")
                continue;
            }
            var newx = other[key].x;
            var newy = other[key].y;
            // console.log(newx,newy);
            members[key].x=newx;
            members[key].y=newy;
            members[key].update();
            // console.log("hehe")
        }
        

    });
    socket.on('status',function(data){
        $('#chat').val($('#chat').val()+'<'+data.msg+'>\n');
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    })
    socket.on('status_join',function(data){
        $('#chat').val($('#chat').val()+'<'+data.msg+'>\n');
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
        var name = document.getElementsByTagName('meta')[0].getAttribute('name');
        if(data.name!=name){
            members[data.name] = new component(30,30,data.x,data.y,data.color);
        }
        // console.log("done")
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
    socket = io.connect('http://'+document.domain+':'+location.port+'/chat');
    var data = $('#text').val();
    if(data=="" || data==null){
        alert("Empty message");
        return;
    }
    socket.emit('text',{'msg':data});
    $('#text').val("");
}
function leave_room(){
    socket = io.connect('http://'+document.domain+':'+location.port+'/chat');

    socket.emit('left',{},function(){
        socket.disconnect();
        window.location.href = 'http://'+document.domain+':'+location.port;
    });
}


function startGame(name, color) {
    members[name] = new component(30, 30, 10, 120,color);
}
function start(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');  
    mycolor = generateRandomColor();
    $('#your_color').css({'background-color': mycolor});
    startGame(name, mycolor);
    battlefield.start();
    // setInterval(function(){
    //     battlefield.clear();  
    //     // members[name].update();
    // }, 100);
    setInterval(updateBattle2,5);
}
var battlefield ={
    canvas: document.createElement('canvas'),
    start: function(){
        this.canvas.height = 400;
        this.canvas.width = 700;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas,document.body.childNodes[0]);
        this.interval = setInterval(updateBattle, 10);
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
            // console.log("inside update");
            var board = battlefield.context;
            // battlefield.clear();
            board.fillStyle = color;
            // console.log(this.x,this.y, "  ");
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
    socket.emit('change',{'newx':members[name].x,'newy':members[name].y});
}
function updateBattle2(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
    // console.log("hello");
    socket.emit('get_location',{'name':name});

}
function moveUp(){
    var name = document.getElementsByTagName('meta')[0].getAttribute('name');
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