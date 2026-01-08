document.addEventListener('DOMContentLoaded', () => {
    // Helper to format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Audio Player Logic
    const audioPlayer = document.getElementById('audio-player');
    const audioTimeDisplay = document.getElementById('audio-time');

    if (audioPlayer && audioTimeDisplay) {
        audioPlayer.addEventListener('timeupdate', () => {
            const currentTime = audioPlayer.currentTime;
            const duration = audioPlayer.duration || 0;
            audioTimeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        });
        
        // Handle metadata loaded (to show duration initially)
        audioPlayer.addEventListener('loadedmetadata', () => {
             audioTimeDisplay.textContent = `00:00 / ${formatTime(audioPlayer.duration)}`;
        });
    }

    // Video Player Logic
    const videoPlayer = document.getElementById('video-player');
    const videoTimeDisplay = document.getElementById('video-time');

    if (videoPlayer && videoTimeDisplay) {
        videoPlayer.addEventListener('timeupdate', () => {
            const currentTime = videoPlayer.currentTime;
            const duration = videoPlayer.duration || 0;
            videoTimeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        });

         // Handle metadata loaded
        videoPlayer.addEventListener('loadedmetadata', () => {
             videoTimeDisplay.textContent = `00:00 / ${formatTime(videoPlayer.duration)}`;
        });
    }
});
