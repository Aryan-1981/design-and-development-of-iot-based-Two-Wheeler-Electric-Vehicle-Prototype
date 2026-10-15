import { ISensorProvider } from './sensorProvider';
import { MockSensorProvider } from './mockSensorProvider';

/**
 * Service Layer Factory
 * In Phase 2, this can dynamically load Esp32WebSocketProvider or SupabaseRealtimeProvider
 * based on environment variables (VITE_DATA_SOURCE: 'MOCK' | 'WEBSOCKET' | 'SUPABASE')
 */
let instance: ISensorProvider | null = null;

export function getSensorProvider(): ISensorProvider {
  if (!instance) {
    const dataSource = import.meta.env.VITE_DATA_SOURCE || 'MOCK';
    
    switch (dataSource) {
      case 'WEBSOCKET':
        // Placeholder for phase 2 native ESP32 direct WebSocket connection
        console.warn('ESP32 WebSocket selected; falling back to Mock for Phase 1');
        instance = new MockSensorProvider();
        break;
      case 'SUPABASE':
        // Placeholder for phase 2 Supabase Realtime channel subscription
        console.warn('Supabase Realtime selected; falling back to Mock for Phase 1');
        instance = new MockSensorProvider();
        break;
      case 'MOCK':
      default:
        instance = new MockSensorProvider();
        break;
    }
  }
  return instance;
}
