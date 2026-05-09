import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode is intentionally off here: it double-mounts effects in dev,
// which kicked off frame extraction twice and made debugging the loader
// state machine harder than it needed to be. Re-enable once stable.
createRoot(document.getElementById('root')).render(<App />)
