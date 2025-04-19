import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MafSiteNavbar } from "../../nextjs/src/components/MafSiteNavbar";
import { FourOFour } from "../../nextjs/src/app/not-found";
import { FAQPage } from "../../nextjs/src/app/faq/page";
import { SettingsPage } from "../../nextjs/src/app/settings/page";
import { PlayPage } from "./components/PlayPage";
import { Stats } from "../../nextjs/src/app/stats/page";
import { RolesPage } from "./components/Roles";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MafSiteNavbar />}>
          <Route index element={<PlayPage debug={false} />} />
          <Route path="play" element={<PlayPage debug={false} />} />
          <Route path="debugPlay" element={<PlayPage debug={true} />} />
          <Route path="stats" element={<Stats />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<FourOFour />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root"),
);
