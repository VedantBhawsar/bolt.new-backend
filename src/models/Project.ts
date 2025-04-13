import mongoose, { Document, Schema } from "mongoose";

interface IProject extends Document {
  title: string;
  description?: string;
  html: string;
  css: string;
  js: string;
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  tags?: string[];
  files: any;
  chatHistory?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    html: {
      type: String,
      default: "",
    },
    css: {
      type: String,
      default: "",
    },
    js: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    files: {
      type: Schema.Types.Mixed,
      required: true,
    },
    chatHistory: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Create compound index for better performance on user projects
ProjectSchema.index({ userId: 1, createdAt: -1 });

// Create text index for search functionality
ProjectSchema.index(
  { title: "text", description: "text", tags: "text" },
  { weights: { title: 3, description: 2, tags: 1 } }
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
