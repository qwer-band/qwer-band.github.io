import { Route, Routes } from 'react-router-dom';
import Contents from './contents/contents'
import Acquisition from './contents/acquisition'

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Contents />} />
        <Route path="acquisition" element={<Acquisition />} />
      </Route>
    </Routes>
  );
}

export default App;