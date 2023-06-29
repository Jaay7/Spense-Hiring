import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';

dotenv.config();

const APP_SECRET = process.env.APP_SECRET
const APP_REFRESH_SECRET = process.env.APP_REFRESH_SECRET

export const issueToken = async({ email, name, id }) => {
  let token = await jwt.sign({ email, name, id }, APP_SECRET );
  let refreshToken = await jwt.sign({ email, name, id }, APP_REFRESH_SECRET, {
    expiresIn: "2d"
  });
  return {
    token,
    refreshToken
  }
}

export const getAuthUser = async(token, requiresAuth = false) => {
  if (token) {
    const verifiedToken = jwt.verify(token, APP_SECRET);
    console.log("TOKEN_DECODED", verifiedToken);
    let authUser = await User.findById(verifiedToken.id);
    console.log("auth user", authUser);
    if(!authUser) {
      throw new GraphQLError("Invalid token, User authentication failed", {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      });
    }
    if (requiresAuth) {
      return authUser;
    }
    return null;
  }
}

export const getRefreshTokenUser = async (token) => {
  if (token) {
    const verifiedToken = jwt.verify(token, APP_REFRESH_SECRET);
    console.log("TOKEN_DECODED", verifiedToken);
    let authUser = await User.findById(verifiedToken.id);
    if(!authUser) {
      throw new GraphQLError("Invalid refresh token, User authentication failed", {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      });
    }
    return authUser;
  }
}