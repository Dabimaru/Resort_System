import { listRooms, getRoomById } from '../services/roomService.js';

export const listRoomsController = async (req, res) => {
  const rooms = await listRooms(req.query || {});
  res.status(200).json({
    message: 'Rooms retrieved successfully.',
    rooms,
  });
};

export const getRoomController = async (req, res) => {
  const room = await getRoomById(req.params.id);

  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  return res.status(200).json({
    message: 'Room retrieved successfully.',
    room,
  });
};
