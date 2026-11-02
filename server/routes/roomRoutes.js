import express from 'express';
import { listRoomsController, getRoomController } from '../controllers/roomController.js';

const router = express.Router();

router.get('/', listRoomsController);
router.get('/:id', getRoomController);

export default router;
