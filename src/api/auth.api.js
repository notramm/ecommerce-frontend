import api from './axios';

// ── Email OTP (new backend flow) ──────────────────────────────────────────
export const sendEmailOTP  = (email)             => api.post('/auth/email/send-otp',      { email });
export const verifyEmailOTP = (email, otp, name) => api.post('/auth/email/verify-otp',    { email, otp, name });
export const completeEmailProfile = (email, name)=> api.post('/auth/email/complete-profile', { email, name });

// ── Phone (Firebase) ──────────────────────────────────────────────────────
export const verifyPhone   = (firebaseIdToken, name) => api.post('/auth/phone/verify',           { firebaseIdToken, name });
export const completePhoneProfile = (firebaseIdToken, name) => api.post('/auth/phone/complete-profile', { firebaseIdToken, name });

// ── OAuth ─────────────────────────────────────────────────────────────────
export const googleFirebase = (firebaseIdToken) => api.post('/auth/google/firebase', { firebaseIdToken });
export const googleToken    = (idToken)         => api.post('/auth/google/token',    { idToken });
export const appleFirebase  = (firebaseIdToken) => api.post('/auth/apple/firebase',  { firebaseIdToken });

// ── Token management ──────────────────────────────────────────────────────
export const refreshToken   = ()      => api.post('/auth/refresh-token');
export const logout         = ()      => api.post('/auth/logout');
export const logoutAll      = ()      => api.post('/auth/logout-all');
export const linkProvider   = (token) => api.post('/auth/link-provider', { firebaseIdToken: token });