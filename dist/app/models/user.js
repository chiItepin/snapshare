"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
// create schema for User
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, 'An email is required'],
        // @ts-ignore
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Invalid email format'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'A valid password is required'],
        select: false,
    },
    image: {
        type: String,
        default: '',
    },
}, { timestamps: true });
UserSchema.plugin(mongoose_paginate_v2_1.default);
// create model for User
exports.User = (0, mongoose_1.model)('user', UserSchema);
exports.getUsers = async (query, page = 1, limit = 10) => {
    try {
        return await exports.User.paginate(query, {
            sort: '-createdAt',
            page,
            limit,
        });
    }
    catch (err) {
        console.log(err);
        throw Error('Error while retrieving Users');
    }
};
exports.getUser = async (query) => {
    try {
        return await exports.User.findOne(query);
        // .select('+password')
    }
    catch (err) {
        console.log(err);
        throw Error('Error while retrieving User');
    }
};
exports.create = async (body, session) => {
    try {
        return await exports.User.create([body], { session: session });
    }
    catch (err) {
        console.log(err);
        throw Error('Error while creating User');
    }
};
//# sourceMappingURL=user.js.map