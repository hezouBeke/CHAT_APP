import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  callerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  endedAt: { 
    type: Date 
  },

  // Statut des appels
  status: {
  type: String,
  enum: ['initiated', 'accepted', 'missed', 'completed', 'rejected'],
  default: 'initiated'
}
}, { 
  timestamps: true 
});


callSchema.virtual('duration').get(function() {
  if (!this.endedAt) return null;
  return Math.floor((this.endedAt - this.startedAt) / 1000);
});

export default mongoose.model('Call', callSchema);