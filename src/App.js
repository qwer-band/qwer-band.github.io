import { Route, Routes } from 'react-router-dom';
import Contents from './contents/contents'
import Acquisition from './contents/acquisition'
import NotFound from './NotFound.js';

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Contents />} />
        <Route path="acquisition" element={<Acquisition />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;