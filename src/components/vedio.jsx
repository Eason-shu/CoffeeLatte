import React from 'react';

const VideoPlaylist = () => {
    const videos = [
        { id: 1, src: 'path/to/video1.mp4', type: 'video/mp4' },
        { id: 2, src: 'path/to/video2.mp4', type: 'video/mp4' },
        { id: 3, src: 'path/to/video3.mp4', type: 'video/mp4' },
    ];

    return (
        <div>
            {videos.map((video) => (
                <div key={video.id}>
                    <video controls>
                        <source src={video.src} type={video.type} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ))}
        </div>
    );
};

export default VideoPlaylist;
