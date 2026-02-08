import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

function Home() {
  return (
    <div>
      <h1>Brave Math — 6-sinf</h1>
      <p>Assalomu alaykum! Bu dastur siz uchun tayyorlandi.</p>
      <Link to="/test">Testni boshlash</Link>
    </div>
  )
}

function Test() {
  return (
    <div>
      <h2>Matematika testi</h2>
      <ol>
        <li>5 × 6 = ?</li>
        <li>12 ÷ 3 = ?</li>
        <li>(7 + 8) × 2 = ?</li>
      </ol>
      <p>Javoblarni daftariga yozib qo‘y!</p>
      <Link to="/">Bosh sahifaga qaytish</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  )
}
