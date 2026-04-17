import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MobileMenuProvider } from './context/MobileMenuContext';
import AppRouter from './app/router';
import './styles/index.css';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MobileMenuProvider>
            <AppRouter />
          </MobileMenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
