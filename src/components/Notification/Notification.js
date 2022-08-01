import React, { useState, useContext } from 'react'
import { VideoContext } from '../../context/VideoContext';

function Notification() {
    const { answerCall, call, callAccepted } = useContext(VideoContext);
    return (
        <div>
            {call.isReceivingCall && !callAccepted && (
                <div className='call-notification'>
                    <h1>{call.name} is calling:</h1>
                    <button className='btn btn-success' color="primary" onClick={answerCall}>
                        Answer
                    </button>
                </div>
            )}
        </div>
    )
}

export default Notification