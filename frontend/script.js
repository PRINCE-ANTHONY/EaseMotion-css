const socket = io("http://localhost:5000");

let currentChannel = "tech";

const username =
    prompt("Enter your username:") || "Anonymous";

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const channels = document.querySelectorAll(".channel");


// JOIN DEFAULT CHANNEL
joinChannel(currentChannel);


// CHANNEL SWITCHING
channels.forEach(channel => {

    channel.addEventListener("click", () => {

        channels.forEach(c =>
            c.classList.remove("active")
        );

        channel.classList.add("active");

        currentChannel = channel.dataset.channel;

        document.getElementById("channel-title")
            .innerText =
            "# " + channel.innerText.replace("# ", "");

        messagesDiv.innerHTML = "";

        document.getElementById(
            "pinnedMessages"
        ).innerHTML = "";

        joinChannel(currentChannel);

    });

});


// JOIN CHANNEL
function joinChannel(channel) {

    socket.emit("join_channel", {
        username: username,
        channel: channel
    });

}


// SEND MESSAGE
sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        sendMessage();
    }

});


function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "") return;

    socket.emit("send_message", {
        username: username,
        channel: currentChannel,
        message: message
    });

    messageInput.value = "";
}


// RECEIVE MESSAGE
socket.on("receive_message", (data) => {

    addMessage(
        data.username,
        data.message,
        data.id
    );

});


// PREVIOUS MESSAGES
socket.on("previous_messages", (messages) => {

    messagesDiv.innerHTML = "";

    messages.forEach(msg => {

        addMessage(
            msg.username,
            msg.message,
            msg.id
        );

    });

});


// DELETE MESSAGE
socket.on("message_deleted", (data) => {

    const msg = document.querySelector(
        `[data-id="${data.id}"]`
    );

    if (msg) {
        msg.remove();
    }

});


// PIN MESSAGE
socket.on("message_pinned", (data) => {

    const pinnedDiv =
        document.getElementById("pinnedMessages");

    const pin = document.createElement("div");

    pin.classList.add("pinned-message");

    pin.innerHTML = `
        <strong>${data.username}</strong>
        <p>${data.message}</p>
    `;

    pinnedDiv.appendChild(pin);

});


// ADD MESSAGE
function addMessage(user, text, id) {

    const div = document.createElement("div");

    div.classList.add("message");

    div.setAttribute("data-id", id);

    div.innerHTML = `
    
        <div class="message-actions">

            <button class="action-btn delete-btn">
                🗑
            </button>

            <button class="action-btn pin-btn">
                📌
            </button>

        </div>

        <strong>${user}</strong>
        <p>${text}</p>
    `;

    messagesDiv.appendChild(div);

    messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

    // DELETE
    div.querySelector(".delete-btn")
        .addEventListener("click", () => {

            socket.emit("delete_message", {
                id: id,
                channel: currentChannel
            });

        });

    // PIN
    div.querySelector(".pin-btn")
        .addEventListener("click", () => {

            socket.emit("pin_message", {
                username: user,
                message: text
            });

        });

}
