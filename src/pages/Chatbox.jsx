import { useEffect, useState, useRef } from "react";
import axios from "axios";
import pp from "./../../public/profile.png"
//const prefix = "http://localhost:8080";
const prefix = "http://localhost:4000";
const x = localStorage.getItem("userData");
const token = JSON.parse(x);
const myId = token?.id;

function Chatbox({ selectedChat, socket, isOnline }) {
    console.log("data in chatbox", selectedChat);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [typing, setTyping] = useState(false);
    const [tTimeOut, setTtimeout] = useState(null);
    const [typingUser, setTypingUser] = useState("");
    const messageEndRef = useRef(null)
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
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

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

    // Fix typing listeners with proper dependencies and null checks
    useEffect(() => {
        if (!socket) return;

        const handleTypingStart = (data) => {
            console.log("Typing started:", data);
            setTypingUser(data.userName);
        };

        const handleTypingStop = (data) => {
            console.log("stopped typing ", data)
            setTypingUser("");
        };

        socket.on('display_typing', handleTypingStart);
        socket.on('stop-typing', handleTypingStop);

        return () => {
            socket.off('display_typing', handleTypingStart);
            socket.off('stop-typing', handleTypingStop);
        };
    }, [socket]);

    // Fix handleTyping with consistent event names
    function handleTyping() {
        if (!socket || !selectedChat?.chatId) return;

        socket.emit('typing', {
            chatId: selectedChat.chatId,
            userName: selectedChat.name
        });

        if (tTimeOut) {
            clearTimeout(tTimeOut);
        }

        const timeOut = setTimeout(() => {
            socket.emit('stop-typing', {
                chatId: selectedChat.chatId,
                userName: selectedChat.name
            });
        }, 3000);

        setTtimeout(timeOut);
    }

    // Fix handleSendMessage with consistent event name
    const handleSendMessage = async () => {
        if (!socket || !selectedChat?.chatId) return;

        if (tTimeOut) {
            clearTimeout(tTimeOut);
        }

        socket.emit('stop-typing', {
            chatId: selectedChat.chatId,
            userName: selectedChat.name
        })

        if (text.trim() === "") return;

        const response = await axios.post(`${prefix}/sendMessage`, {
            chatId: selectedChat.chatId,
            receiverId: selectedChat.userId,
            message: text,
            sender: myId,
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

    // New function to send message when Enter is pressed
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    }

    return (
        <>

            {selectedChat ? (
                <div className="chat-area d-flex flex-column h-100 w-100 overflow-hidden">
                    {/* Header */}
                    <div className="header d-flex justify-content-between align-items-center p-3 border-bottom flex-shrink-0">
                        <div className="d-flex align-items-center" style={{ minHeight: '40px' }}>
                            <img
                                src={selectedChat.image ? selectedChat.image : pp}
                                className="rounded-circle me-3"
                                style={{ width: '40px', height: '40px', objectFit: 'cover', alignSelf: 'center' }}
                                alt="Profile"
                            />
                            <span style={{ lineHeight: 1 }}>{selectedChat.name}</span>
                        </div>
                        {/* <button className="btn btn-primary">Call</button> */}
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
                        <div ref={messageEndRef} />
                    </div>

                    {/* Input Area */}
                    {typingUser && (
                        <p className="text-center m-0 p-0 typing-indicator">
                            {typingUser} is typing...
                        </p>
                    )}
                    <div className="input-area px-3 py-2 border-top">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Type a message"
                                className="form-control"
                                style={{
                                    height: '44px',
                                    borderRadius: '20px',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    marginRight: '8px'
                                }}
                                value={text}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    handleTyping();
                                }}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="btn btn-primary d-flex align-items-center justify-content-center"
                                style={{
                                    borderRadius: '20px',
                                    width: '80px',
                                    height: '44px'
                                }}
                                onClick={handleSendMessage}
                            >
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
