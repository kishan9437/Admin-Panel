import axios from "axios";
import { AuthModel, UserModel } from "./_models";
import { PasswordResetResponse } from "./_models"; // Import the new interface

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/auth/verify_token`;
export const LOGIN_URL = `${API_URL}/auth/login`;
export const REGISTER_URL = `${API_URL}/auth/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}/auth/forgot_password`;
export const RESET_PASSWORD_URL = `${API_URL}/auth/resetPassword`;

// Server should return AuthModel
export function login(email: string, password: string) {
  return axios.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  });
}

// console.log('reset url: ',RESET_PASSWORD_URL)
// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<PasswordResetResponse>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function resetPassword(resetPasswordToken: string, password: string) {
  return axios.post<{ success: boolean; message: string }>(RESET_PASSWORD_URL, {
    resetPasswordToken,
    password,
  })
}
// console.log(token)

// export function getUserByToken(api_token: string) {
//   return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
//     api_token: api_token,
//   });
// }

export function getUserByToken(api_token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {}, {
    headers: {
      'Authorization': `Bearer ${api_token}`
    }
  });
}

