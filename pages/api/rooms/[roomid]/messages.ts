import { getMessagesInRoom } from '@/lib/messages';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { roomid } = req.query;
    try {
        const messages = await getMessagesInRoom(roomid as string);
        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).end();
    }
}

export default handler;
