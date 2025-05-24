import { EventEmitter } from 'events';

class TypedEventEmitter extends EventEmitter {
  // Type-safe event emission
  emit(event: 'change-public-request-status' | 'change-private-request-status', data: any): boolean {
    return super.emit(event, data);
  }

  // Type-safe event listening
  on(event: 'change-public-request-status' | 'change-private-request-status', listener: (data: any) => void): this {
    return super.on(event, listener);
  }

  off(event: 'change-public-request-status' | 'change-private-request-status', listener: (data: any) => void): this {
    return super.off(event, listener);
  }
}

const eventEmitter = new TypedEventEmitter();

// Increase max listeners to prevent warnings
eventEmitter.setMaxListeners(20);

export default eventEmitter;

// Custom hook for using the event bus
export const useEventBus = () => {
  const subscribe = (
    event: 'change-public-request-status' | 'change-private-request-status',
    callback: (data: any) => void
  ) => {
    eventEmitter.on(event, callback);
    
    // Return cleanup function
    return () => {
      eventEmitter.off(event, callback);
    };
  };

  return { subscribe };
};
