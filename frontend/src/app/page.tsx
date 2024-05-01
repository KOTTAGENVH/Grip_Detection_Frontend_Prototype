"use client";
import HomePage from "./Home/page";
import { store} from './GlobalRedux/store';
import { Provider } from 'react-redux';

export default function Home() {
  return (
    <Provider store={store}>
   <HomePage/>
   </Provider>
  );
}
