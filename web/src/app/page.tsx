import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="home-main">
      <h1 className="home-title">Привет, я Андрей - продуктовый дизайнер.</h1>
      <p className="home-text">
        Мои кейсы здесь:{' '}
        <Link href="/cases" className="home-link">
          перейти в Cases
        </Link>
      </p>
    </main>
  )
}
