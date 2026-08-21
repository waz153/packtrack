const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'events', label: 'Events' },
  { id: 'scouts', label: 'Scouts' },
  { id: 'people', label: 'People' },
  { id: 'reports', label: 'Reports' },
  { id: 'checkin', label: 'How check-in works' },
  { id: 'leaders', label: 'Den leaders' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
]

export default function AdminHelpPage() {
  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Help</h1>
      <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
        A quick reference for everything in the admin section.
      </p>

      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} style={tocLinkStyle}>
            {s.label}
          </a>
        ))}
      </nav>

      <Section id="dashboard" title="Dashboard">
        <p>
          The home screen for the current (or most recently unlocked) event. Shows a live total of
          scouts checked in, a breakdown by den, and the check-in QR code for that event — refreshes
          automatically every few seconds. If more than one event exists, use the dropdown to switch
          between them.
        </p>
        <p>
          &ldquo;Manual check-in&rdquo; links to the same roster view den leaders use, so you can check
          scouts in or undo a check-in yourself from here too.
        </p>
      </Section>

      <Section id="events" title="Events">
        <p>Create and manage events. For each event you can:</p>
        <ul style={listStyle}>
          <li>
            <b>Edit</b> its name, date, time, location, and notes.
          </li>
          <li>
            <b>Unlock</b> it to open check-in, <b>Lock</b> it to close check-in, or <b>Cancel</b> it.
            Locking/unlocking is always manual — there&apos;s no automatic scheduling, so remember to
            unlock an event when it&apos;s time and lock it again once it&apos;s over.
          </li>
          <li>
            <b>View check-in page</b> opens the public page scouts and parents use to check in.
          </li>
          <li>
            <b>Print flyer</b> opens a printable page with the event details and a large QR code — good
            for posting at the check-in table.
          </li>
          <li>
            <b>Report</b> jumps straight to that event&apos;s attendance report.
          </li>
        </ul>
      </Section>

      <Section id="scouts" title="Scouts">
        <p>
          Add new scouts to the roster (name + den), or remove one if they&apos;ve left the pack.
          Removing a scout doesn&apos;t delete their check-in history — it just hides them from future
          check-in screens and reports. Check &ldquo;Show removed scouts&rdquo; to see or restore anyone
          removed by mistake.
        </p>
      </Section>

      <Section id="people" title="People">
        <p>
          Manage admin and den leader accounts. Only admins can see this page. When you create someone,
          their passcode is generated automatically and shown <b>once</b> — write it down and relay it to
          them, since it isn&apos;t stored anywhere visible afterward.
        </p>
        <ul style={listStyle}>
          <li>
            <b>Leaders</b> must have at least one den assigned, or their dashboard will show no scouts.
          </li>
          <li>
            <b>Admins</b> automatically see every den — no assignment needed.
          </li>
          <li>
            <b>Regenerate passcode</b> if someone forgets theirs or you want to revoke the old one.
          </li>
          <li>
            <b>Deactivate</b> to block someone from logging in without deleting their account (their past
            manual check-ins stay attributed to them). You can&apos;t deactivate your own account.
          </li>
        </ul>
      </Section>

      <Section id="reports" title="Reports">
        <ul style={listStyle}>
          <li>
            <b>Per Event</b> — full roster for one event: who checked in, when, and whether it was
            self-service or a leader override. Exportable as CSV.
          </li>
          <li>
            <b>Attendance History</b> — every scout&apos;s check-in rate across every event that&apos;s
            been open so far, lowest attendance shown first. Useful for spotting families who&apos;ve
            drifted away. Filter by den, export as CSV.
          </li>
          <li>
            <b>Season Trend</b> — turnout at each event over time, as a simple bar per event. Export as
            CSV.
          </li>
        </ul>
        <p>
          All three only count events that have actually been open for check-in — an event that&apos;s
          still locked and hasn&apos;t happened yet won&apos;t affect anyone&apos;s attendance rate.
        </p>
      </Section>

      <Section id="checkin" title="How check-in works (for parents/scouts)">
        <p>
          No login required. Scanning the event&apos;s QR code (or opening its link) shows a den picker —
          tap your den, then tap your scout&apos;s name to check in. Tapping an already-checked-in name
          again undoes it, in case of a mistake. If the event isn&apos;t unlocked yet, the page just shows
          a &ldquo;not open yet&rdquo; message instead of the den picker.
        </p>
      </Section>

      <Section id="leaders" title="Den leaders">
        <p>
          Leaders log in at <code style={codeStyle}>/staff/login</code> with their name and passcode and
          land on a roster view scoped to their assigned den(s) only. They can tap any scout to check
          them in or undo a check-in — useful for scouts who don&apos;t have a phone handy, or to fix a
          mistake. The view polls automatically, so it stays current as families check in on their own.
        </p>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <ul style={listStyle}>
          <li>
            <b>A leader sees no scouts:</b> check People — they likely have no den assigned.
          </li>
          <li>
            <b>Check-in page says &ldquo;not open yet&rdquo;:</b> the event needs to be Unlocked from the
            Events page.
          </li>
          <li>
            <b>Someone forgot their passcode:</b> go to People and hit Regenerate passcode for their
            account, then relay the new one.
          </li>
          <li>
            <b>A scout is missing from their den&apos;s check-in list:</b> check Scouts — they may have
            been removed (soft-deleted). Restore them from there.
          </li>
        </ul>
      </Section>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginTop: 32, scrollMarginTop: 16 }}>
      <h2 style={{ fontSize: 17, borderBottom: '1px solid #eee', paddingBottom: 8 }}>{title}</h2>
      <div style={{ marginTop: 10, fontSize: 14, color: '#333', lineHeight: 1.6 }}>{children}</div>
    </section>
  )
}

const tocLinkStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 8,
  fontSize: 13,
  border: '1px solid #ddd',
  color: '#171717',
}

const listStyle: React.CSSProperties = {
  marginTop: 8,
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const codeStyle: React.CSSProperties = {
  background: '#f2f2f2',
  padding: '1px 6px',
  borderRadius: 4,
  fontSize: 13,
}
