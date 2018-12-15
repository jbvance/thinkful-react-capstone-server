//Model for Durable Power of Attorney (dpoa)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agentSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    relationship: String
});

const dpoaSchema = new Schema({
    fullName: {
        type: String,
        required: true,        
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    effectiveNow: {
        type: Boolean,
        required: true,
        default: false
    },
    agents: [agentSchema],
    // principal is the person making the document (the system user)
    principal: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
});

const Dpoa = mongoose.model('dpoa', dpoaSchema);

module.exports = Dpoa;