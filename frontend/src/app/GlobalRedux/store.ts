'use client';
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import imageReducer from "./Feature/imageSlice";

export const store =  configureStore({
    reducer: {
      image: imageReducer,
    },
  });


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


