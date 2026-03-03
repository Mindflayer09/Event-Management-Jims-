const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    logo: {
      type: String,
      default: '',
    },

    //  Only ONE admin per club
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true, 
      sparse: true  
    },

    // 👥 Optional: store club members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);