import { Schema, model } from 'mongoose';

const relationshipSchema = new Schema({
    productId: { type: String, required: true, index: true },
    related: [
        {
            productId: { type: String, required: true },
            score: { type: Number, required: true },
            type: { type: String, required: true }, // co_occurrence, category, embedding
        }
    ]
}, { timestamps: true });

export default model('Relationship', relationshipSchema);
