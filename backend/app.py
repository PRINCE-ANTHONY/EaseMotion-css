
from flask import Flask
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'nic_secret'

CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

channels = {
    "tech": [],
    "media": [],
    "content": [],
    "design": [],
    "community": [],
    "hackathon": []
}

pinned_messages = []


# JOIN CHANNEL
@socketio.on('join_channel')
def handle_join(data):

    channel = data['channel']

    join_room(channel)

    emit(
        'previous_messages',
        channels[channel]
    )

    emit(
        'pinned_messages',
        pinned_messages
    )


# SEND MESSAGE
@socketio.on('send_message')
def handle_message(data):

    channel = data['channel']

    message_data = {
        'id': str(uuid.uuid4()),
        'username': data['username'],
        'message': data['message']
    }

    channels[channel].append(message_data)

    emit(
        'receive_message',
        message_data,
        room=channel
    )


# DELETE MESSAGE
@socketio.on('delete_message')
def delete_message(data):

    channel = data['channel']
    message_id = data['id']

    channels[channel] = [

        msg for msg in channels[channel]

        if msg['id'] != message_id
    ]

    emit(
        'message_deleted',
        {
            'id': message_id
        },
        room=channel
    )


# PIN MESSAGE
@socketio.on('pin_message')
def pin_message(data):

    pinned_messages.append(data)

    emit(
        'message_pinned',
        data,
        broadcast=True
    )


if __name__ == '__main__':

    print("NIC Messenger Running...")

    socketio.run(
        app,
        host='0.0.0.0',
        port=5000
    )

