import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../../context/AuthContext'
import "./HomePage.css"
import Header from '../../components/Header'
import ScrollToBottom from "react-scroll-to-bottom";
import io from "socket.io-client";
import Moment from 'react-moment';
import { Link } from 'react-router-dom';

const socket = io.connect("https://socket-fresh-minds.herokuapp.com/");
const HomePage = () => {
    let { authTokens, logoutUser, user } = useContext(AuthContext)
    let [friends, setFriends] = useState([])
    const [username, setUsername] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const [room, setRoom] = useState();
    const [me, setMe] = useState('');
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [userid, setUserid] = useState('')
    let [currentFriend, setCurrentFriend] = useState(null)

    useEffect(() => {
        getFriends()
    }, [])

    useEffect(() => {
        if (currentFriend !== null) {
            const users = [user.username, currentFriend].sort();
            setRoom(users[0] + '-' + users[1])
        }
    }, [friends])

    useEffect(() => {
        if (currentFriend !== null) {
            const users = [user.username, currentFriend].sort();
            setRoom(users[0] + '-' + users[1])
        }
    }, [currentFriend])

    useEffect(() => {
        joinRoom()
        getChats()
    }, [room])


    useEffect(() => {
        socket.on("receive_message", (data, data_id) => {
            setUserid(data_id)
            setMessageList((list) => [...list, data]);

        });
    }, [socket]);

    const joinRoom = () => {
        socket.emit("join_room", room);
        socket.on('me', (id) => {
            setMe(id)
        });
    };

    const sendMessage = async (event) => {
        if (currentMessage !== "") {
            const messageData = {
                user: user.user_id,
                receiver: currentFriend,
                message: currentMessage,
                room: room,
                author: user.username,
                time: (new Date().toISOString()),
            };
            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);

            let response = await fetch('https://shishirr.pythonanywhere.com/api/chats/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens.access)
                },
                body: JSON.stringify(messageData)
            })

            if (response.status !== 200) {
                alert('Something went wrong!')
            }

            setCurrentMessage("");
        }
    };
    let getFriends = async () => {
        let response = await fetch('https://shishirr.pythonanywhere.com/api/friends/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()
        if (response.status === 200) {
            setFriends(data)
            if (data.length >= 1) {
                setCurrentFriend(data[0].username)
            } else {
                setCurrentFriend(user.username)
            }
        } else if (response.statusText === 'Unauthorized') {
            logoutUser()
        }
    }

    let getChats = async () => {
        if (room !== undefined) {
            let response = await fetch('https://shishirr.pythonanywhere.com/api/chats/' + room, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens.access)
                }
            })
            let data = await response.json()
            if (response.status === 200) {
                setMessageList(data)
            } else if (response.statusText === 'Unauthorized') {
                logoutUser()
            }
        }
    }
    return (
        <div>
            <div className="container py-5 px-4">
                <div className="row rounded-lg overflow-hidden shadow">
                    <div className="col-3 px-0">
                        <div className="bg-white">
                            <div className="bg-gray px-4 py-2 bg-light height-adjust">
                                <div className="horizontal-flex space-between ">
                                    <div className="horizontal-flex">
                                        <p className="h5 mb-0 py-1 spacing"><Header /></p>
                                    </div>
                                </div>
                            </div>
                            <div className="messages-box">
                                <div className="list-group rounded-0">

                                    {
                                        friends.map((friend) => {
                                            return (
                                                <a className={friend.username === currentFriend ? "list-group-item list-group-item-action active text-white rounded-0" : "list-group-item list-group-item-action list-group-item-light rounded-0"} key={friend.id} onClick={() => {
                                                    setCurrentFriend(friend.username)
                                                }} >
                                                    <div className="media"><img src="https://bootstrapious.com/i/snippets/sn-chat/avatar.svg" alt="user" width="50" className="rounded-circle" />
                                                        <div className="media-body ml-4">
                                                            <div className="d-flex align-items-center justify-content-between mb-1">
                                                                <h6 className="mb-0">{user.username === friend.username ? 'Me' : friend.username}</h6>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-9 px-0">
                        <div className="bg-gray px-4 py-2 bg-light height-adjust">
                            <div className="horizontal-flex space-between">
                                <div className="horizontal-flex">
                                    <img src="https://bootstrapious.com/i/snippets/sn-chat/avatar.svg" alt="user" width="50" className="rounded-circle" />
                                    <p className="h5 mb-0 py-1 spacing">{user.username === currentFriend ? 'Me' : currentFriend}</p>
                                </div>
                                <div className="horizontal-flex">
                                    <Link to={"/videochat"} state={{ room: room }} className="control-container-icons">
                                        <img src="images/icons/camera.png" width="50" />
                                    </Link>
                                    <div>
                                        <div className='control-container-icons spacing'>
                                            <img src="images/icons/phone.png" width="50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ScrollToBottom className="px-4 py-5 chat-box bg-white">
                            {messageList.map((messages, index) => {
                                if (messages.author !== user.username) {
                                    return (
                                        <div className="media w-50 mb-3" key={index}>
                                            <img src="https://bootstrapious.com/i/snippets/sn-chat/avatar.svg" alt="user" width="50" className="rounded-circle" />
                                            <div className="media-body ml-3">
                                                <div className="bg-light rounded py-2 px-3 mb-2">
                                                    <p className="text-small mb-0 text-muted">{messages.message}</p>
                                                </div>
                                                <p className="small text-muted"><Moment fromNow ago>{messages.time}</Moment></p>
                                            </div>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="media w-50 ml-auto mb-3" key={index}>
                                            <div className="media-body">
                                                <div className="bg-primary rounded py-2 px-3 mb-2">
                                                    <p className="text-small mb-0 text-white">{messages.message}</p>
                                                </div>
                                                <p className="small text-muted"><Moment fromNow ago>{messages.time}</Moment></p>
                                            </div>
                                        </div>
                                    )
                                }

                            })}
                        </ScrollToBottom>

                        <div className="bg-light">
                            <div className="input-group">
                                <input type="text" placeholder="Type a message" aria-describedby="button-addon2" className="form-control rounded-0 border-0 py-4 bg-light"
                                    value={currentMessage}
                                    onKeyPress={(event) => {
                                        event.key === "Enter" && sendMessage();
                                    }}
                                    onChange={(event) => {
                                        setCurrentMessage(event.target.value);
                                    }} />
                                <div className="input-group-append">
                                    <button id="button-addon2" onClick={sendMessage} className="btn btn-link"> <i className="fa fa-paper-plane"></i></button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    )
}

export default HomePage