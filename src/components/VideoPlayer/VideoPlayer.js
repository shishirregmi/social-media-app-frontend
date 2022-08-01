import React, { useEffect, useRef, useState } from "react";

const VideoPlayer = (props) => {
  const ref = useRef();
  useEffect(() => {    
    props.peer.on("stream", stream => {
      ref.current.srcObject = stream;
    })
  }, []);


  return (
    <div>
        <video className="video-player-1 mirror" id="user-1" ref={ref} autoPlay playsInline></video>
    </div>
  )
}

export default VideoPlayer