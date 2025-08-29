import { use, useEffect, useState } from "react";
import Chatbox from "./Chatbox";
import Header from "./Header";
import axios from "axios";
import{ useDataContext } from '../../reactProvider';
import { io } from "socket.io-client"
const x = localStorage.getItem("userData");
const token =x? JSON.parse(x):null
//const prefix = "http://localhost:8080"
const prefix = "http://localhost:3002";
const userId=token?.id;
const socket =io("http://localhost:3002",{
    withCredentials:true,
    extraHeaders:{
        "Content-Type":"application/json"
    }
});
function Chatarea() {
  let [userlist, setuserlist] = useState([]);
  let [chatData,setChatdata]=useState(null);
  let {sessionId}=useDataContext();
  const fetchChats = async () => {
    try {
      const response = await axios.get(`${prefix}/getMyChats`, 
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json'
        }
      });
      setuserlist(response.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      // Handle error appropriately
    }
  };
  const handleGetMsg =async (data)=>{
    data={
      chatId:data._id,
      name:data.userName,
      image:data.image
    }
    setChatdata(data)
  }
  useEffect(() => {
    if (token) {
      fetchChats();
    }
  }, [token,sessionId]);
  useEffect(() => {
    console.log("chat list updated_______________",userlist)
    const handleUpdate=( msg)=>{
      setuserlist(prev=> prev.map(i=> i._id===msg.chatId
        ?{...i,lastMsg:msg.message}:i
      ))
    }

    socket.on("receiveMsg",handleUpdate);
    return ()=>{
      socket.off("receiveMsg",handleUpdate);
    }
  },[socket])
  
  return (
    <div className="d-flex flex-column vh-100">
      <Header />
      <div className="flex-grow-1 d-flex overflow-hidden">
        <div className="sidebar bg-light col-sm-4 col-md-3">
          {/* sidebar that display your added users */}
          <div className="userlist p-3 rounded overflow-auto h-100">
            {userlist.map((i) => (
              <div key={i._id} value ={i._id} onClick={(e)=>handleGetMsg(i)} className="usercontainer d-flex align-items-center gap-3 p-1">
                <img
                  src={i.image}
                  userName={i.name}
                  className="profilepic rounded-circle border"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <span>
                  <p className="mb-0 fw-semibold">{i.userName}</p>
                  <p className="last-message">{i.lastMsg}</p>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* The chat area where messages rendered */}
        <div className="col-sm-8 col-md-9 overflow-hidden">
          <Chatbox selectedChat={chatData} socket={socket}/>
        </div>
      </div>
    </div>
  );
}

export default Chatarea;