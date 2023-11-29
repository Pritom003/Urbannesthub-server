const { model, Schema } = require("mongoose");

const PropertySchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    agentName: {
        type: String,
        required: true
    },
    agentEmail: {
        type: String,
        required: true
    },
    agentImage: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    priceRangeMin: {
        type: String,
        required: true
    },
    priceRangeMax: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

const Property = model("Property", PropertySchema);

module.exports = Property;
