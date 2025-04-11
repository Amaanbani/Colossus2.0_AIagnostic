import React, { useState, useEffect } from 'react';
import { Heart, ThermometerSun, MapPin, Phone, MessageSquare, Music, Plus, AlertTriangle } from 'lucide-react';
import ChatBot from './components/ChatBot';
import EmergencyContacts from './components/EmergencyContacts';
import HealthMetrics from './components/HealthMetrics';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [healthData, setHealthData] = useState({
    heartRate: 75,
    temperature: 36.5,
    location: { lat: 0, lng: 0 }
  });
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('wss://your-esp32-ip:8765');

    ws.onopen = () => {
      console.log('Connected to ESP32');
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setHealthData(data);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from ESP32');
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-semibold text-gray-800">EchoBand</span>
              {!wsConnected && (
                <span className="ml-2 text-sm text-red-500">Disconnected</span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="p-2 rounded-full hover:bg-purple-100"
              >
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </button>
              <button
                onClick={() => setShowContacts(true)}
                className="p-2 rounded-full hover:bg-purple-100"
              >
                <Phone className="h-6 w-6 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HealthMetrics data={healthData} />
          <MusicPlayer />
          
          {/* Map View */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
              <h2 className="ml-2 text-lg font-semibold">Current Location</h2>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <img 
                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+purple(${healthData.location.lng},${healthData.location.lat})/${healthData.location.lng},${healthData.location.lat},13/400x400?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`}
                alt="Map showing current location"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {showChat && (
          <ChatBot onClose={() => setShowChat(false)} />
        )}

        {showContacts && (
          <EmergencyContacts onClose={() => setShowContacts(false)} />
        )}
      </main>
    </div>
  );
}

export default App;