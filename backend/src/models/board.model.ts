import { IModelInitializer } from './index';
import mongoose, { Schema, Connection, Model, Document } from 'mongoose';
import { EventSchema } from './cellFunction.model';



const rangeSchema = new Schema({
  "max": {
    type: Number,
    required: true,
    min: 1
  },
  min: {
    type: Number,
    min: 1
  }
}, {
  _id: false
});

const defeatSchema = new Schema({
  type: {
    type: String,
    required: true
  }
}, {
  _id: false
});

const cellSchema = new Schema({

});

const improvementsSchema = new Schema({
  "type": {
    type: String,
    enum: ["levels"],
    required: true
  },
  "monopoly": {
    type: Boolean,
    required: true
  },
  "sell": {
    "price": {
      type: Number,
      required: true
    },
    "downgrade": {
      type: Boolean,
      required: true
    }
  }
}, {
  _id: false
});

const boardSchema = new Schema({
  rules: {
    initialCash: {
      type: Number,
      required: true
    },
    randomizeEventOptions: {
      type: Boolean,
      required: true
    },
    turnTime: {
      limit: {
        type: Number,
        required: true
      },
      defaultOption: {
        type: Number,
        required: true
      }
    },
    "playerLimits": rangeSchema,
    "hasRoles": true,
    "dices": [rangeSchema],
    "building": {
      "mortgage": {
        "price": {
          type: Number,
          required: true
        },
        "liftInterestPledgePercent": Number,
        "sell": {
          "pricePercentPay": Number
        }
      },
      "improvements": improvementsSchema,
      "fee": {
        "fromMortgaged": {
          type: Boolean,
          required: true
        },
        "monopoly": {
          "factor": {
            type: Number,
            required: true
          },
          "mortgageBreaks": {
            type: Boolean,
            required: true
          }
        },
        "improvementsOverride": {
          type: Boolean,
          required: true
        }
      }
    },
    "sell": {
      "buyRequest": {
        type: Boolean,
        required: true
      },
      "sellRequest": {
        type: Boolean,
        required: true
      },
      "responseTimeout": {
        type: Boolean,
        required: true
      },
      "minPrice": {
        type: Number,
        required: true
      },
      "objects": {
        type: [String],
        enum: [
          "building",
          "inventory"
        ]
      }
    },
    "events": [EventSchema],
    defeat: defeatSchema
  },
  cells: []
}, {
  timestamps: true
});