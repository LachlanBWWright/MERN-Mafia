import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

import reportWebVitals from './reportWebVitals';
import MafSiteNavbar from './components/MafSiteNavbar';
import FourOFour from './components/FourOFour';
import FAQPage from './components/FAQPage';
import SettingPage from './components/SettingPage';
import PlayPage from './components/PlayPage';
import Stats from './components/Stats';
import RolesPage from './components/Roles';


ReactDOM.render(
  <React.StrictMode>
        <BrowserRouter>
          <Routes>  
            <Route path="/" element={<MafSiteNavbar />}>
              <Route index element={<PlayPage/>} />
              <Route path="play" element={<PlayPage />} />
              <Route path="stats" element={<Stats/>} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="roles" element={<RolesPage />} />
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
