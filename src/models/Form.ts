import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFormField {
    _id?: string;
    name: string; // unique key for the field
    label: { ar: string; en: string; tr: string };
    type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'file';
    required: boolean;
    options?: string[]; // For select type (comma separated or array)
    placeholder?: { ar: string; en: string; tr: string };
}

export interface IForm extends Document {
    title: { ar: string; en: string; tr: string };
    description?: { ar: string; en: string; tr: string };
    slug: string; // friendly url
    fields: IFormField[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FormSchema = new Schema<IForm>(
    {
        title: {
            ar: { type: String, required: true },
            en: { type: String },
            tr: { type: String },
        },
        description: {
            ar: { type: String },
            en: { type: String },
            tr: { type: String },
        },
        slug: { type: String, required: true, unique: true, trim: true },
        fields: [
            {
                name: { type: String, required: true },
                label: {
                    ar: { type: String, required: true },
                    en: { type: String },
                    tr: { type: String },
                },
                type: {
                    type: String,
                    enum: ['text', 'textarea', 'number', 'email', 'date', 'select', 'file'],
                    default: 'text',
                },
                required: { type: Boolean, default: false },
                options: [{ type: String }],
                placeholder: {
                    ar: { type: String },
                    en: { type: String },
                    tr: { type: String },
                },
            },
        ],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Form = mongoose.model<IForm>('Form', FormSchema);
export default Form;
