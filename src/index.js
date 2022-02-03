import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import MafSiteNavbar from './components/MafSiteNavbar';
import IntroScreen from './components/IntroScreen';
import FourOFour from './components/FourOFour';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>  
        <Route path="/" element={<MafSiteNavbar />}>
          <Route index element={<IntroScreen/>} />
          <Route path="malarkey" element={<MafSiteNavbar />} />
          <Route path="*" element={<FourOFour/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
