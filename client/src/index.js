import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

//import io from 'socket.io-client';

import reportWebVitals from './reportWebVitals';
import MafSiteNavbar from './components/MafSiteNavbar';
import IntroScreen from './components/IntroScreen';
import FourOFour from './components/FourOFour';
import FAQPage from './components/FAQPage';
import SettingPage from './components/SettingPage';
import PlayPage from './components/PlayPage'

/* const socket=io('http://localhost:5000');

socket.on('connect', () => {
  console.log('You connected to the socket with ID ' + socket.id);
}) */

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>  
        <Route path="/" element={<MafSiteNavbar />}>
          <Route index element={<IntroScreen/>} />

          <Route path="play" element={<PlayPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="settings" element={<SettingPage />} />

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
