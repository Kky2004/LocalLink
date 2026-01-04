const mongoose =require("mongoose");

const  Schema  = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true, // optional: adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("Message", messageSchema);


