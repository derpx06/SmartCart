import { Request, Response } from 'express';
import Model3D from '../models/Model3D';
import cloudinary from '../config/cloudinary';

export const getModels3D = async (req: Request, res: Response) => {
  try {
    const models = await Model3D.find().sort({ createdAt: -1 }).populate('productId', 'name');
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadModel3D = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Since we use multer-storage-cloudinary, the file is already uploaded to Cloudinary
    // and the details are available in req.file.
    const newModel = new Model3D({
      name: req.body.name || file.originalname,
      url: file.path,
      publicId: file.filename, // Multer-storage-cloudinary returns publicId in filename field usually
      format: file.mimetype.split('/')[1] || 'glb',
      size: file.size,
      productId: req.body.productId || undefined
    });

    await newModel.save();
    res.json(newModel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteModel3D = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const model3d = await Model3D.findById(id);

    if (!model3d) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(model3d.publicId, { resource_type: 'raw' });

    // Delete from DB
    await model3d.deleteOne();

    res.json({ message: 'Model deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateModel3D = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, productId } = req.body;
    
    const updatedModel = await Model3D.findByIdAndUpdate(
      id,
      { name, productId },
      { new: true }
    );

    if (!updatedModel) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json(updatedModel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
