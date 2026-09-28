import { LoginPage } from './Pages/login.tsx';
import { SingInUser } from './Pages/signIn.tsx';
import { WelcomeHome } from './Pages/home.tsx';


import {Routes, Route, BrowserRouter} from 'react-router-dom';
function App(){

  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<WelcomeHome />} />
        <Route path='/sign-in' element={<SingInUser />} />
        <Route path='/login' element={<LoginPage />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;
