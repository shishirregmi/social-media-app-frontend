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

            let response = await fetch('https://social-media-front-end.vercel.app/api/chats/add', {
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
        let response = await fetch('https://social-media-front-end.vercel.app/api/friends/', {
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
            let response = await fetch('https://social-media-front-end.vercel.app/api/chats/' + room, {
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
        <main className="content-new">
            <div className="container-new p-0">
                <div className="card">
                    <div className="row g-0">
                        <div className="col-12 col-lg-5 col-xl-3 border-right">
                            <div className="px-4 d-none d-md-block">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <Header />
                                    </div>
                                </div>
                            </div>

                            {
                                friends.map((friend) => {
                                    return (
                                        <a className={friend.username === currentFriend ? "list-group-item list-group-item-action border-1" : "list-group-item list-group-item-action border-0"} key={friend.id} onClick={() => {
                                            setCurrentFriend(friend.username)
                                        }}>
                                            <div className="d-flex align-items-start">
                                                <img
                                                    src="https://bootdey.com/img/Content/avatar/avatar5.png"
                                                    className="rounded-circle mr-1"
                                                    width="40"
                                                    height="40"
                                                />
                                                <div className="flex-grow-1 ml-3">
                                                    {user.username === friend.username ? 'Me' : friend.username}
                                                </div>
                                            </div>
                                        </a>
                                    )
                                })
                            }

                            <hr className="d-block d-lg-none mt-1 mb-0" />
                        </div>
                        <div className="col-12 col-lg-7 col-xl-9">
                            <div className="py-2 px-4 border-bottom d-none d-lg-block">
                                <div className="d-flex align-items-center py-1">
                                    <div className="position-relative">
                                        <img
                                            src="https://bootdey.com/img/Content/avatar/avatar3.png"
                                            className="rounded-circle mr-1"
                                            width="40"
                                            height="40"
                                        />
                                    </div>
                                    <div className="flex-grow-1 pl-3">
                                        <strong>{user.username === currentFriend ? 'Me' : currentFriend}</strong>
                                        {/* <div className="text-muted small"><em>Typing...</em></div> */}
                                    </div>
                                    <div>
                                        <button className="btn btn-primary btn-lg mr-1 px-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="feather feather-phone feather-lg"
                                            >
                                                <path
                                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                                                ></path>
                                            </svg>
                                        </button>
                                        <Link to={"/videochat"} state={{room: room}} className="btn btn-info btn-lg mr-1 px-3 d-none d-md-inline-block">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="feather feather-video feather-lg"
                                            >
                                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                <rect
                                                    x="1"
                                                    y="5"
                                                    width="15"
                                                    height="14"
                                                    rx="2"
                                                    ry="2"
                                                ></rect>
                                            </svg>
                                        </Link>
                                        {/* <button className="btn btn-light border btn-lg px-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="feather feather-more-horizontal feather-lg"
                                            >
                                                <circle cx="12" cy="12" r="1"></circle>
                                                <circle cx="19" cy="12" r="1"></circle>
                                                <circle cx="5" cy="12" r="1"></circle>
                                            </svg>
                                        </button> */}
                                    </div>
                                </div>
                            </div>

                            <div className="position-relative">
                                <ScrollToBottom className="chat-messages p-4">
                                    {messageList.map((messages, index) => {
                                        if (messages.author === user.username) {
                                            return (
                                                <div className="chat-message-right mb-4" key={index}>
                                                    <div>
                                                        <img
                                                            src="https://bootdey.com/img/Content/avatar/avatar1.png"
                                                            className="rounded-circle mr-1"
                                                            width="40"
                                                            height="40"
                                                        />
                                                        <div className="text-muted small text-nowrap mt-2">
                                                            <Moment fromNow ago>{messages.time}</Moment>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                                                        <div className="font-weight-bold mb-1">You</div>
                                                        {messages.message}
                                                    </div>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className="chat-message-left pb-4" key={index}>
                                                    <div>
                                                        <img
                                                            src="https://bootdey.com/img/Content/avatar/avatar3.png"
                                                            className="rounded-circle mr-1"
                                                            width="40"
                                                            height="40"
                                                        />
                                                        <div className="text-muted small text-nowrap mt-2">
                                                            <Moment fromNow ago>{messages.time}</Moment>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                                                        <div className="font-weight-bold mb-1">{messages.author}</div>
                                                        {messages.message}
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}
                                </ScrollToBottom>
                            </div>
                            <div className="flex-grow-0 py-3 px-4 border-top">
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
        </main>

    )
}

export default HomePage