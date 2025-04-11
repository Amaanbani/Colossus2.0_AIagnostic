import React, { useState } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack } from 'lucide-react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Calm Meditation',
    artist: 'Wellness Sounds'
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center mb-4">
        <Music className="h-6 w-6 text-purple-600" />
        <h2 className="ml-2 text-lg font-semibold">Soothing Music</h2>
      </div>

      <div className="text-center mb-4">
        <h3 className="font-medium">{currentTrack.title}</h3>
        <p className="text-gray-500 text-sm">{currentTrack.artist}</p>
      </div>

      <div className="flex justify-center items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-purple-100">
          <SkipBack className="h-6 w-6 text-purple-600" />
        </button>
        <button 
          className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </button>
        <button className="p-2 rounded-full hover:bg-purple-100">
          <SkipForward className="h-6 w-6 text-purple-600" />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;