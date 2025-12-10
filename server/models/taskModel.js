import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['To Do', 'Doing', 'Done'], default: 'To Do' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMovedAt: { type: Date },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
