import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import agentReducer from "./slices/agentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    agent: agentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
