import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    attachments: [
      {
        fileUrl: String,
        fileName: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"],
      default: "TODO"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM"
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    createdBy: {
      type: String,
      required: true
    },

    assignedTo: {
      type: String,
    },

    dueDate: Date,
    startDate: Date,
    completedAt: Date,

    tags: [String],

    attachments: [
      {
        fileUrl: String,
        fileName: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    comments: [commentSchema],

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);


export default mongoose.model("Task", taskSchema);