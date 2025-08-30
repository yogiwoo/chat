import { useEffect, useState } from "react";
import axios from "axios";

//const prefix = "http://localhost:8080";
const prefix = "http://localhost:3002";
const x = localStorage.getItem("userData");
const token = JSON.parse(x);
const myId = token?.id;

function Chatbox({ selectedChat, socket }) {
    console.log("data in chatbox", selectedChat);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [typing, setTyping] = useState(false);
    const getMessages = async () => {
        const response = await axios.get(`${prefix}/getMyMessage?chatId=${selectedChat.chatId}`, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token.token}`,
                'Content-Type': 'application/json'
            }
        });
        setMessages(response.data.data);
    };

    useEffect(() => {
        if (!selectedChat?.chatId || !socket) return;

        getMessages();
        socket.emit("joinRoom", selectedChat.chatId); //while clicking the chat it will joined room name chatId
        socket.on("receiveMsg", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.emit("leaveRoom", selectedChat.chatId);
            socket.off("receiveMsg");
        };
    }, [selectedChat?.chatId]);

   const handleSendMessage = async () => {
    if (text.trim() === "") return;

    const response = await axios.post(`${prefix}/sendMessage`, {
        chatId: selectedChat.chatId,
        receiverId: selectedChat.userId,
        message: text,
        sender: myId
    }, {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json'
        }
    });

    // You don't actually need to emit again here if backend already does it
    // But if you want instant UI update for yourself, keep it
    //socket.emit("sendMsg", response?.data?.data);

    setMessages([...messages, response.data.data]);
    setText("");
};

const handleInputChange = (e) => { 
    setText(e.target.value);
}


    return (
        <>
            {selectedChat ? (
                <div className="chat-area d-flex flex-column h-100 w-100 overflow-hidden">
                    {/* Header */}
                    <div className="header d-flex justify-content-between align-items-center p-3 border-bottom flex-shrink-0">
                        <div className="d-flex align-items-center">
                            <img
                                src={selectedChat.image}
                                className="rounded-circle me-3"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                alt="Profile"
                            />
                            <h4 className="mb-0">{selectedChat.name}</h4>
                        </div>
                        <button className="btn btn-primary">Call</button>
                    </div>

                    {/* Messages */}
                    <div className="messages flex-grow-1 p-3 overflow-auto mx-0">
                        {
                            messages.length ? (
                                messages.map((i, idx) => (
                                    <div key={idx} className={`d-flex mb-3 ${i?.sender === myId ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`p-3 rounded text-white ${i?.sender === myId ? "bg-dark" : "bg-primary"}`} style={{ maxWidth: '75%' }}>
                                            <p>{i?.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-msg">There is no message let's talk</div>
                            )
                        }
                    </div>

                    {/* Input Area */}
                    <div className="input-area p-4 border-top flex-shrink-0">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Type a message"
                                className="form-control"
                                style={{ padding: '10px' }}
                                value={text}
                                onChange={handleInputChange} //e => setText(e.target.value)
                            />
                            <button className="btn btn-primary" onClick={handleSendMessage}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="void-box d-flex justify-content-center align-items-center w-100 h-100">
                    <h3>Select Messages</h3>
                </div>
            )}
        </>
    );
}

export default Chatbox;
