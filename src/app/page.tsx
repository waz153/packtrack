export default function Home() {
  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        textAlign: 'center',
        gap: 12,
      }}
    >
      <h1 style={{ fontSize: 28 }}>PackTrack</h1>
      <p style={{ color: '#666', maxWidth: 320 }}>
        Scan the QR code at your event to check in, or head to staff login if you&apos;re a
        leader or admin.
      </p>
      <a
        href="/staff/login"
        style={{
          marginTop: 12,
          padding: '10px 20px',
          background: '#171717',
          color: '#fff',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        Staff Login
      </a>
    </main>
  )
}
