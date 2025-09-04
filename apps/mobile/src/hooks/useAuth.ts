import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure
} from "../store/slices/authSlice";
import { RootState } from "../store";
import {
  loginUser,
  registerUser,
  logoutUser
} from "../services/authService";
import { useCallback } from "react";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const user = await loginUser(email, password);
      dispatch(loginSuccess(user));
      return true;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      return false;
    }
  }, [dispatch]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      dispatch(registerStart());
      const user = await registerUser(email, password, name);
      dispatch(registerSuccess(user));
      return true;
    } catch (error: any) {
      dispatch(registerFailure(error.message));
      return false;
    }
  }, [dispatch]);

  const signOut = useCallback(async () => {
    try {
      await logoutUser();
      dispatch(logout());
      return true;
    } catch (error: any) {
      console.error("Logout error:", error.message);
      return false;
    }
  }, [dispatch]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    signOut,
  };
};
