from flask import Flask,render_template,request,session,redirect
from flask_socketio import SocketIO,send,emit,join_room

app = Flask(__name__)
app.secret_key='1234'
app.config['SECRET KEY']='secret'
socketio = SocketIO(app,cors_allowed_origins='*')

hash = {}
@app.route('/')
def index():
    return render_template('home.html')

@app.route('/login',methods=['POST','GET'])
def login():
    if(request.method=='POST'):
        print("helllo")
        form = request.form
        username = form['name']
        session['name']=username
        session['roomid']=form['roomid']
        room = form['roomid']
        hash[username]=room
        return render_template('chat.html',name=username,room=room)
    return redirect('/')

@socketio.on('message')
def handleMessage(msg):
    print('Message: ' + msg)
    send(msg,broadcast=True)


@socketio.on('joinned',namespace='/chat')
def joinned(message):
    room = session['roomid']
    join_room(room)
    emit('status',{'msg':session['name']+' has entered the room'},room=room)

@socketio.on('text',namespace='/chat')
def joinned(message):
    room = session['roomid']
    name = session['name']
    emit('message',{'msg':message['msg'],'name':name},room=room)

@socketio.on('left',namespace='/chat')
def joinned(message):
    room = session['roomid']
    name = session['name']
    session.pop('name')
    session.pop('roomid')
    hash.pop(name)
    emit('message',{name:name},room=room)

if __name__=='__main__':
    socketio.run(app)