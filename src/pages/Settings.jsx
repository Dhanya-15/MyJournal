import { useApp, isDemo } from '../store.jsx'
import { useNavigate } from 'react-router-dom'

function save(name, text, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

export default function Settings() {
  const nav = useNavigate()
  const { settings, setSettings, entries, setEntries, moods, setMoods, notes, setNotes, collections, setCollections, setDemo, resetDemo } = useApp()
  const txt = entries.filter((e) => !e.locked).map((e) => `${e.date}\n${e.title}\n${e.body}\n`).join('\n---\n\n')
  const csv = 'date,mood\n' + Object.entries(moods).map(([d, m]) => d + ',' + m).join('\n')
  const imp = (ev) => {
    const r = new FileReader()
    r.onload = () => { try { const d = JSON.parse(r.result); if (d.version !== 1 || !Array.isArray(d.entries)) throw 0
      if (!confirm(`Import ${d.entries.length} entries and replace current data?`)) return
      setEntries(d.entries); setMoods(d.moods || {}); setNotes(d.notes || []); setCollections(d.collections || []) } catch { alert('This file is not a valid MyJournal backup.') } }
    r.readAsText(ev.target.files[0])
  }
  const clear = () => { if (confirm('Delete ALL journal data on this device? This cannot be undone.')) { setEntries([]); setMoods({}); setNotes([]); setCollections([]) } }
  return (
    <div className="setpage">
      <img className="setside" src="/images/set-side.jpg" alt="" />
      <p className="eyebrow">Settings</p>
      <h1>Customize Your Space</h1>
      <p className="sub">Make MyJournal truly yours.</p>
      <div className="two">
        <section className="card"><h3>Appearance</h3><div className="row">
          {[['light', 'Light Mode · Botanical Sage'], ['dark', 'Dark Mode · Midnight Forest']].map(([t, l]) => <button key={t} className={'tab ' + (settings.theme === t ? 'on' : '')} onClick={() => setSettings({ ...settings, theme: t })}>{l}</button>)}</div></section>
        <section className="card"><h3>Profile</h3><label>Display name<input className="inp" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} /></label></section>
        <section className="card ill"><img className="ill-img" src="/images/set-write.jpg" alt="" /><h3>Writing Preferences</h3><p className="sub">Set up your writing environment.</p>
          <label className="row between">Font size <span className="row"><input type="range" min="14" max="24" value={settings.size || 17} onChange={(e) => setSettings({ ...settings, size: +e.target.value })} /> {settings.size || 17}px</span></label>
          <label className="row between">Show word count <input type="checkbox" checked={settings.words !== false} onChange={(e) => setSettings({ ...settings, words: e.target.checked })} /></label>
          <label className="row between">Autosave drafts <input type="checkbox" checked={settings.autosave !== false} onChange={(e) => setSettings({ ...settings, autosave: e.target.checked })} /></label></section>
        <section className="card ill"><img className="ill-img" src="/images/set-lock.jpg" alt="" /><h3>Privacy & Entry Lock</h3><p className="sub">Lock any entry from the Write Journal page. Entries are encrypted in your browser with AES-GCM. Forgotten passphrases cannot be recovered.</p></section>
        <section className="card ill"><img className="ill-img" src="/images/set-data.jpg" alt="" /><h3>Data Management</h3><div className="col2">
          <button className="btn ghost" onClick={() => save('myjournal-entries.txt', txt, 'text/plain')}>Export entries (TXT)</button>
          <button className="btn ghost" onClick={() => save('mood-records.csv', csv, 'text/csv')}>Export moods (CSV)</button>
          <button className="btn ghost" onClick={() => save('myjournal-backup.json', JSON.stringify({ version: 1, entries, moods, notes, collections }))}>Full backup (JSON, locked entries stay encrypted)</button>
          <label className="btn ghost">Import backup<input type="file" accept="application/json" hidden onChange={imp} /></label>
          <button className="btn danger" onClick={clear}>Clear all data</button></div></section>
        <section className="card ill"><img className="ill-img" src="/images/set-help.jpg" alt="" /><h3>Help & About</h3>
          <p>MyJournal stores everything in your browser. Locked entries use AES-GCM with a passphrase key (PBKDF2). If you forget a passphrase, those entries cannot be recovered.</p>
          <div className="row wrap"><button className="btn ghost" onClick={() => { setSettings({ ...settings, onboarded: false }); nav('/') }}>Restart onboarding</button>
            {isDemo() ? <><button className="btn ghost" onClick={resetDemo}>Reset Demo</button><button className="btn" onClick={() => setDemo(false)}>Exit Demo</button></> : <button className="btn ghost" onClick={() => setDemo(true)}>Try Demo</button>}</div></section>
      </div>
    </div>
  )
}
