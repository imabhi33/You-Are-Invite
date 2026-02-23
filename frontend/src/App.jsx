import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreatePage from "./pages/CreatePage";
import InvitePage from "./pages/InvitePage";
import SuccessPage from "./pages/SuccessPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/:slug" element={<InvitePage />} />
      <Route path="/invite/:slug" element={<InvitePage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
