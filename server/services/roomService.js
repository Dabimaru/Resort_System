import { mockRooms } from '../data/mockStore.js';
import { readProperties } from './supabaseRepository.js';

export const listRooms = async ({ type, capacity, status } = {}) => {
  let rooms = [...(await readProperties())];

  if (type) {
    rooms = rooms.filter((room) => room.type.toLowerCase() === type.toLowerCase());
  }

  if (capacity) {
    rooms = rooms.filter((room) => room.capacity >= Number(capacity));
  }

  if (status) {
    rooms = rooms.filter((room) => room.status.toLowerCase() === status.toLowerCase());
  }

  return rooms;
};

export const getRoomById = async (roomId) => {
  const rooms = await readProperties();
  return rooms.find((room) => room.id === roomId) || null;
};
