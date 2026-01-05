export default function Settings() {
  return (
    <div className="page-container">
      <h1 className="page-title">SETTINGS</h1>
      <div className="page-content">
        <div className="settings-section">
          <h3>Game Settings</h3>
          <div className="setting-item">
            <label>Difficulty</label>
            <select className="setting-input">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
              <option>Expert</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Sound Volume</label>
            <input type="range" min="0" max="100" defaultValue="70" className="slider" />
          </div>
          <div className="setting-item">
            <label>Music Volume</label>
            <input type="range" min="0" max="100" defaultValue="50" className="slider" />
          </div>
        </div>

        <div className="settings-section">
          <h3>Display Settings</h3>
          <div className="setting-item">
            <label>Theme</label>
            <select className="setting-input">
              <option>Dark</option>
              <option>Light</option>
              <option>Auto</option>
            </select>
          </div>
          <div className="setting-item checkbox">
            <input type="checkbox" id="effects" defaultChecked />
            <label htmlFor="effects">Enable Visual Effects</label>
          </div>
          <div className="setting-item checkbox">
            <input type="checkbox" id="fullscreen" />
            <label htmlFor="fullscreen">Fullscreen Mode</label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account</h3>
          <div className="setting-item">
            <label>Email</label>
            <input type="email" className="setting-input" placeholder="your.email@example.com" />
          </div>
          <div className="setting-item">
            <button className="btn btn-secondary">Change Password</button>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-primary">Save Changes</button>
          <button className="btn btn-secondary">Reset to Default</button>
        </div>
      </div>
    </div>
  )
}
