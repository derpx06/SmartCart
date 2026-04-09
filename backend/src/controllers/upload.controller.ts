import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response): any => {
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  res.json({
    imageUrl: file.path,
    message: 'Image uploaded successfully'
  });
};
