import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
}                          from 'firebase/auth';
import { toast }           from 'sonner';
import useAuthStore        from '../store/authStore';
import useCartStore        from '../store/cartStore';
import {
  sendEmailOTP, verifyEmailOTP, completeEmailProfile,
  verifyPhone, completePhoneProfile, googleFirebase,
}                          from '../api/auth.api';
import api                 from '../api/axios';

export function useEmailOTP() {
  const [step,    setStep]    = useState('email');   // email | otp | profile
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth }           = useAuthStore();
  const { items, clearGuestCart } = useCartStore();
  const navigate              = useNavigate();

  const sendOTP = async (emailVal) => {
    setLoading(true);
    try {
      await sendEmailOTP(emailVal);
      setEmail(emailVal);
      setStep('otp');
      toast.success('OTP sent to your email');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp, name = '') => {
    setLoading(true);
    try {
      const { data } = await verifyEmailOTP(email, otp, name);
      if (data.data?.requiresProfile) {
        setStep('profile');
        return;
      }
      await afterLogin(data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (name) => {
    setLoading(true);
    try {
      const { data } = await completeEmailProfile(email, name);
      await afterLogin(data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const afterLogin = async (data) => {
    setAuth(data.user, data.accessToken);
    // Merge guest cart
    if (items.length) {
      try {
        await api.post('/cart/merge', {
          guestItems: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity:  i.quantity,
          })),
        });
        clearGuestCart();
      } catch (_) {}
    }
    toast.success(data.isNewUser ? 'Welcome to LUXE!' : 'Welcome back!');
    navigate('/');
  };

  return { step, email, loading, sendOTP, verifyOTP, completeProfile, setStep };
}

export function usePhoneAuth() {
  const [step,        setStep]       = useState('phone');  // phone | otp | profile
  const [phone,       setPhone]      = useState('');
  const [confirm,     setConfirm]    = useState(null);
  const [firebaseToken, setFirebaseToken] = useState('');
  const [loading,     setLoading]    = useState(false);
  const { setAuth }                  = useAuthStore();
  const { items, clearGuestCart }    = useCartStore();
  const navigate                     = useNavigate();
  const auth                         = getAuth();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
      );
    }
  };

  const sendOTP = async (phoneNumber) => {
    setLoading(true);
    try {
      setupRecaptcha();
      const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result    = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      setConfirm(result);
      setPhone(formatted);
      setStep('otp');
      toast.success('OTP sent to your phone');
    } catch (e) {
      toast.error(e.message || 'Failed to send OTP');
      window.recaptchaVerifier = null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp, name = '') => {
    setLoading(true);
    try {
      const result    = await confirm.confirm(otp);
      const idToken   = await result.user.getIdToken();
      setFirebaseToken(idToken);

      const { data }  = await verifyPhone(idToken, name);
      if (data.data?.requiresProfile) {
        setFirebaseToken(idToken);
        setStep('profile');
        return;
      }
      await afterLogin(data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (name) => {
    setLoading(true);
    try {
      const { data } = await completePhoneProfile(firebaseToken, name);
      await afterLogin(data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const afterLogin = async (data) => {
    setAuth(data.user, data.accessToken);
    if (items.length) {
      try {
        await api.post('/cart/merge', {
          guestItems: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity:  i.quantity,
          })),
        });
        clearGuestCart();
      } catch (_) {}
    }
    toast.success(data.isNewUser ? 'Welcome to LUXE!' : 'Welcome back!');
    navigate('/');
  };

  return { step, phone, loading, sendOTP, verifyOTP, completeProfile, setStep };
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const { setAuth }           = useAuthStore();
  const { items, clearGuestCart } = useCartStore();
  const navigate              = useNavigate();
  const auth                  = getAuth();

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider  = new GoogleAuthProvider();
      const result    = await signInWithPopup(auth, provider);
      const idToken   = await result.user.getIdToken();
      const { data }  = await googleFirebase(idToken);

      setAuth(data.data.user, data.data.accessToken);
      if (items.length) {
        try {
          await api.post('/cart/merge', {
            guestItems: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity:  i.quantity,
            })),
          });
          clearGuestCart();
        } catch (_) {}
      }
      toast.success(data.data.isNewUser ? 'Welcome to LUXE!' : 'Welcome back!');
      navigate('/');
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        toast.error(e.response?.data?.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, loginWithGoogle };
}