'use client';

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { Booking, Consultation, TimeSlot, ConsultationFeedback } from '@/types/booking';

// Collection references
const consultationsRef = collection(db, 'consultations');
const timeSlotsRef = collection(db, 'timeSlots');
const bookingsRef = collection(db, 'bookings');
const feedbacksRef = collection(db, 'consultationFeedbacks');

// Consultation Services
export const createConsultation = async (consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(consultationsRef, {
      ...consultation,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating consultation:', error);
    throw error;
  }
};

export const getAllConsultations = async () => {
  try {
    const querySnapshot = await getDocs(consultationsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Consultation[];
  } catch (error) {
    console.error('Error getting all consultations:', error);
    throw error;
  }
};

// Alias for getAllConsultations for backward compatibility
export const getConsultations = getAllConsultations;
export const updateConsultation = async (id: string, data: Partial<Consultation>) => {
  try {
    const docRef = doc(db, 'consultations', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating consultation:', error);
    throw error;
  }
};

export const deleteConsultation = async (id: string) => {
  try {
    // First, get all time slots for this consultation
    const timeSlotsQuery = query(timeSlotsRef, where('consultationId', '==', id));
    const timeSlotsSnapshot = await getDocs(timeSlotsQuery);
    
    // Delete all time slots
    const timeSlotDeletePromises = timeSlotsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(timeSlotDeletePromises);
    
    // Get all bookings for this consultation
    const bookingsQuery = query(bookingsRef, where('consultationId', '==', id));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    // Delete all bookings
    const bookingDeletePromises = bookingsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(bookingDeletePromises);
    
    // Finally, delete the consultation
    const docRef = doc(db, 'consultations', id);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting consultation:', error);
    throw error;
  }
};

export const getConsultationById = async (id: string) => {
  try {
    const docRef = doc(db, 'consultations', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Consultation not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Consultation;
  } catch (error) {
    console.error('Error getting consultation:', error);
    throw error;
  }
};

// TimeSlot Services
export const getAllTimeSlots = async () => {
  try {
    const querySnapshot = await getDocs(timeSlotsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as TimeSlot[];
  } catch (error) {
    console.error('Error getting all time slots:', error);
    throw error;
  }
};

export const deleteTimeSlot = async (id: string) => {
  try {
    // Check if there are any bookings for this time slot
    const bookingsQuery = query(bookingsRef, where('timeSlotId', '==', id));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    if (!bookingsSnapshot.empty) {
      throw new Error('Cannot delete time slot with existing bookings');
    }
    
    // Delete the time slot
    const docRef = doc(db, 'timeSlots', id);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting time slot:', error);
    throw error;
  }
};

export const createTimeSlot = async (timeSlot: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(timeSlotsRef, {
      ...timeSlot,
      startTime: Timestamp.fromDate(new Date(timeSlot.startTime)),
      endTime: Timestamp.fromDate(new Date(timeSlot.endTime)),
      isAvailable: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating time slot:', error);
    throw error;
  }
};

export const getAvailableTimeSlots = async (consultationId: string) => {
  try {
    const q = query(
      timeSlotsRef,
      where('consultationId', '==', consultationId),
      where('isAvailable', '==', true),
      where('startTime', '>', Timestamp.fromDate(new Date())),
      orderBy('startTime', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as TimeSlot[];
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

// Booking Services
export const getAllBookings = async () => {
  try {
    const querySnapshot = await getDocs(bookingsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting all bookings:', error);
    throw error;
  }
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent'>) => {
  try {
    // First, check if the time slot is available
    const timeSlotRef = doc(db, 'timeSlots', booking.timeSlotId);
    const timeSlotSnap = await getDoc(timeSlotRef);
    
    if (!timeSlotSnap.exists() || !timeSlotSnap.data().isAvailable) {
      throw new Error('Time slot is not available');
    }
    
    // Create the booking
    const docRef = await addDoc(bookingsRef, {
      ...booking,
      status: 'pending',
      paymentStatus: 'pending',
      reminderSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Update the time slot to be unavailable
    await updateDoc(timeSlotRef, {
      isAvailable: false,
      updatedAt: serverTimestamp(),
    });
    
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const q = query(bookingsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

export const getBookingById = async (id: string) => {
  try {
    const docRef = doc(db, 'bookings', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Booking not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
      cancelledAt: docSnap.data().cancelledAt?.toDate(),
      completedAt: docSnap.data().completedAt?.toDate(),
    } as Booking;
  } catch (error) {
    console.error('Error getting booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id: string, status: Booking['status']) => {
  try {
    const docRef = doc(db, 'bookings', id);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    
    if (status === 'cancelled') {
      updateData.cancelledAt = serverTimestamp();
      
      // Make the time slot available again
      const bookingSnap = await getDoc(docRef);
      if (bookingSnap.exists()) {
        const timeSlotRef = doc(db, 'timeSlots', bookingSnap.data().timeSlotId);
        await updateDoc(timeSlotRef, {
          isAvailable: true,
          updatedAt: serverTimestamp(),
        });
      }
    } else if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
    }
    
    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const updateBookingPayment = async (id: string, paymentStatus: Booking['paymentStatus'], paymentId?: string) => {
  try {
    const docRef = doc(db, 'bookings', id);
    await updateDoc(docRef, {
      paymentStatus,
      paymentId,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating booking payment:', error);
    throw error;
  }
};

// Feedback Services
export const createFeedback = async (feedback: Omit<ConsultationFeedback, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Check if the booking exists and is completed
    const bookingRef = doc(db, 'bookings', feedback.bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists() || bookingSnap.data().status !== 'completed') {
      throw new Error('Cannot leave feedback for a booking that is not completed');
    }
    
    // Create the feedback
    const docRef = await addDoc(feedbacksRef, {
      ...feedback,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Update the booking with the feedback ID
    await updateDoc(bookingRef, {
      feedbackId: docRef.id,
      updatedAt: serverTimestamp(),
    });
    
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

export const getConsultationFeedbacks = async (consultationId: string, onlyPublic = true) => {
  try {
    // First, get all bookings for this consultation
    const bookingsQuery = query(bookingsRef, where('consultationId', '==', consultationId));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookingIds = bookingsSnapshot.docs.map(doc => doc.id);
    
    if (bookingIds.length === 0) {
      return [];
    }
    
    // Then, get all feedbacks for these bookings
    let q = query(feedbacksRef, where('bookingId', 'in', bookingIds));
    
    if (onlyPublic) {
      q = query(q, where('isPublic', '==', true));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ConsultationFeedback[];
  } catch (error) {
    console.error('Error getting consultation feedbacks:', error);
    throw error;
  }
};