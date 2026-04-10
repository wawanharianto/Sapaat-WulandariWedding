import { Timestamp } from 'firebase/firestore';

export interface Wish {
  id: string;
  name: string;
  message: string;
  date: string;
  attendance: 'Hadir' | 'Tidak Hadir';
  guests: number;
  createdAt?: Timestamp;
}
