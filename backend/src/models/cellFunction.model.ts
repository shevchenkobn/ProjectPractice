import mongoose, { Schema, Connection, Model, Document } from 'mongoose';

const cellFunctionSchema = new Schema({
  class: String
}, {
  timestamps: true
});

export const EventSchema = new Schema({
  triggers: {
    type: [String],
    required: true
  },
  action: {
    type: Object,
    required: true
  }
}, {
  _id: false
});