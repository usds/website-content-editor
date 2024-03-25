import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// React.StrictMode breaks the trussworks USWDS FileInput
ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)
