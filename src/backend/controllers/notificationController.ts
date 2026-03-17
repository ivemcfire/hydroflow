// File: src/backend/controllers/notificationController.ts
import { Request, Response } from 'express';
import { db } from '../firebase';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'update';
  message: string;
  timestamp: string;
  read: boolean;
}

export const addNotification = async (type: Notification['type'], message: string) => {
  try {
    const newNotif = {
      type,
      message,
      read: false,
      timestamp: new Date().toISOString(),
    };
    await db.collection('notifications').add(newNotif);
  } catch (error) {
    console.error('Error adding notification:', error);
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('notifications')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const notificationsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(notificationsList);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await db.collection('notifications').doc(id).update({ read: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('notifications').where('read', '==', false).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};
