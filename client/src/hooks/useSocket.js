import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

let socket;

const useSocket = (userId) => {
  useEffect(() => {
    if (!userId) return;

    // Connect socket
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Socket linked internally:', socket.id);
    });

    socket.on('newLeaveRequest', (data) => {
      toast('Incoming Leave Request', {
        description: `${data.employee} has requested ${data.leaveType} leave for ${data.dates}.`,
      });
    });

    socket.on('leaveStatusChanged', (data) => {
      const isApproved = data.status === 'approved';
      toast[isApproved ? 'success' : 'error'](
        isApproved ? 'Leave Approved!' : 'Leave Rejected',
        { description: 'Your HR Manager has processed your leave.' }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socket;
};

export default useSocket;
