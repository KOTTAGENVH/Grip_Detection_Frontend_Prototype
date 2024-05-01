'use client';
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const getInitialFirbaseImageState = () => {
  // Check if localStorage is available
  if (typeof localStorage !== "undefined") {
    const persistedState = localStorage.getItem("persistroot");
    if (persistedState) {
      console.log("JSON.parse(persistedState)", JSON.parse(persistedState));
      return JSON.parse(persistedState);
    }
  }

  // If localStorage is not available or persisted state doesn't exist, use the default initial state
  return {
    image: "",
  };
};

export const imageSlice = createSlice({
  name: "firbase-image-url",
  initialState: getInitialFirbaseImageState(),
  reducers: {
    setImageUrl: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        image: action.payload,
      };
    },
  },
});

export const { setImageUrl } = imageSlice.actions;
export default imageSlice.reducer;
