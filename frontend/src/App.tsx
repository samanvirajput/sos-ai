import { Routes, Route, Navigate } from 'react-router-dom'
import Home     from './pages/Home'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<Home />}     />
      <Route path="/auth"         element={<AuthPage />} />
      <Route path="/chat"         element={<ChatPage />} />
      <Route path="/chat/:conversationId" element={<ChatPage />} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  )
}
