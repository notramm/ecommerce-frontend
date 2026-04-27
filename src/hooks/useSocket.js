import { useEffect, useRef, useCallback } from 'react';
import { io }         from 'socket.io-client';
import useAuthStore   from '../store/authStore';
import { toast }      from 'sonner';

let socketInstance = null;

export default function useSocket() {
  const { accessToken, isLoggedIn } = useAuthStore();
  const handlersRef = useRef({});

  useEffect(() => {
    if (!isLoggedIn || !accessToken) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    if (socketInstance?.connected) return;

    const URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

    socketInstance = io(URL, {
      auth:       { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:    2000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socketInstance.on('notification', (notif) => {
      toast(notif.title, {
        description: notif.message,
        duration:    5000,
      });
    });

    return () => {
      // Don't disconnect on component unmount — keep socket alive globally
      // Only disconnect on logout (handled by auth store)
    };
  }, [isLoggedIn, accessToken]);

  const emit = useCallback((event, data) => {
    socketInstance?.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    socketInstance?.on(event, handler);
    handlersRef.current[event] = handler;
    return () => socketInstance?.off(event, handler);
  }, []);

  const off = useCallback((event) => {
    const handler = handlersRef.current[event];
    if (handler) {
      socketInstance?.off(event, handler);
      delete handlersRef.current[event];
    }
  }, []);

  const subscribeOrder = useCallback((orderId) => {
    emit('order:subscribe', { orderId });
  }, [emit]);

  const unsubscribeOrder = useCallback((orderId) => {
    emit('order:unsubscribe', { orderId });
  }, [emit]);

  return { emit, on, off, subscribeOrder, unsubscribeOrder, socket: socketInstance };
}