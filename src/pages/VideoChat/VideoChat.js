import React, { useEffect, useRef, useState } from 'react';
import './VideoChat.css'

import io from "socket.io-client";
import Peer from "simple-peer";
import Controls from '../../components/Controls/Controls';
import { useLocation } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const VideoChat = () => {
    const location = useLocation() 

    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = location.state?.room;

    useEffect(() => {
        socketRef.current = io.connect("https://video-socket-fresh-minds.herokuapp.com/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }
    return (
        <div>
            <div id="videos">
                {peers.map((peer, index) => {
                    return (
                        <VideoPlayer key={index} peer={peer} />
                    );
                })}
                <video className="video-player-2 mirror" id="user-2" muted ref={userVideo} autoPlay playsInline></video>
            </div>
            <Controls />
        </div>
    );
};

export default VideoChat;
