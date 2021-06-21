from flask import Flask,render_template,request,session,redirect
from flask_socketio import SocketIO,send,emit,join_room,leave_room
from nodeclass import *
# import multiprocessing
import time,json
app = Flask(__name__)
app.secret_key='1234'
app.config['SECRET KEY']='secret'
socketio = SocketIO(app,cors_allowed_origins='*')

# hash = multiprocessing.Manager().dict()
hash = {}
def dist(key,name):
    x1 = hash[name].x
    y1 = hash[name].y
    x2 = hash[key].x
    y2 = hash[key].y
    return (x2-x1)**2 + (y2-y1)**2

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/login',methods=['POST','GET'])
def login():
    if(request.method=='POST'):
        form = request.form
        username = form['name']
        session['name']=username
        return render_template('chat.html',name=username)
    return redirect('/')



@socketio.on('joinned',namespace='/chat')
def joinned(message):
    name = session['name']
    join_room(name)
    color = message['color']
    obj = node(30,30,color)
    hash[name]=obj
    # print(hash[name])
    # print(hash[name].x)
    # print(hash[name].y)
    # print(hash)
    for key in hash:
        emit('status_join', {'msg': key + ' has entered the room.', 'name': key, 'color': hash[key].color,'x':hash[key].x,'y':hash[key].y}, room = name)
    for key in hash:
        if key!=name:
            emit('status_join',{'msg':session['name']+' has entered the room','name':name,'color':color,'x':10,'y':120},room=key)

@socketio.on('change',namespace='/chat')
def change(message):
    name = session['name']
    # print(name)
    hash[name].x = message['newx'] 
    hash[name].y = message['newy']
    # print(hash[name].x,hash[name].y) 
    # # print("hello")    
    # json_object = json.dumps(hash, indent = len(hash))
    # emit('position_change',{'data':json_object},room=name)
    # emit('position_change',{'name':session['name'],'newx':hash[name].x,'newy':hash[name].y},room=name)
    for key in hash:
        emit('position_change',{'name':name,'newx':hash[name].x,'newy':hash[name].y},room=key)

def send_location():
    while(1):
        # time.sleep(10)
        # print(hash)
        for key in hash:
            emit('position_change',{"hash": hash},room=key)



@socketio.on('text',namespace='/chat')
def send_messgae(message):
    name = session['name']
    emit('message',{'msg':message['msg'],'name':name},room=name)
    for key in hash:
        if key!=name:
            if(dist(key,name)<10000):
                emit('message',{'msg':message['msg'],'name':name},room=key)

@socketio.on('left',namespace='/chat')
def left(message):
    name = session['name']
    session.pop('name')
    leave_room(name)
    hash.pop(name)
    for key in hash:
        emit('status',{'msg':name+' has left the room'},room=key)

# def socket_start():
#     socketio.run(app)


if __name__=='__main__':
    # p2 = multiprocessing.Process(target=socket_start)
    # p1 = multiprocessing.Process(target=send_location)
    # p1.start()
    # p2.start()
    # p1.join()
    # p2.join()
    socketio.run(app)