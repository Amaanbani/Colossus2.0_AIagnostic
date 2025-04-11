import React from 'react';
import { Heart, ThermometerSun, AlertTriangle } from 'lucide-react';

interface HealthMetricsProps {
  data: {
    heartRate: number;
    temperature: number;
  };
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ data }) => {
  const isHeartRateHigh = data.heartRate > 100;
  const isTempHigh = data.temperature > 37.5;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Health Metrics</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Heart className={`h-6 w-6 ${isHeartRateHigh ? 'text-red-500' : 'text-purple-600'}`} />
            <span className="ml-2">Heart Rate</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl font-semibold">{data.heartRate}</span>
            <span className="ml-1 text-gray-500">BPM</span>
            {isHeartRateHigh && (
              <AlertTriangle className="ml-2 h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ThermometerSun className={`h-6 w-6 ${isTempHigh ? 'text-red-500' : 'text-purple-600'}`} />
            <span className="ml-2">Temperature</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl font-semibold">{data.temperature.toFixed(1)}</span>
            <span className="ml-1 text-gray-500">°C</span>
            {isTempHigh && (
              <AlertTriangle className="ml-2 h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;