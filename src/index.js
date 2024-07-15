import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ReactGA from "react-ga4";
import './index.css';

if (process.env.REACT_APP_GA_KEY) {
  ReactGA.initialize(process.env.REACT_APP_GA_KEY);
}

const root = ReactDOM.createRoot(document.querySelector('.content'));
root.render(
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
