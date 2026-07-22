import { useState } from "react";
import { Modal } from "./components/Modal";
import { Tabs } from "./components/Tabs";
import { Disclosure } from "./components/Disclosure";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Frontend accessibility demo</p>
        <h1>Accessible component playground</h1>
        <p className="hero-copy">
          Explore three WAI-ARIA patterns with keyboard-first interaction,
          clear focus management, and a more polished presentation.
        </p>
      </header>

      <div className="demo-grid">
        <section className="demo-card" aria-labelledby="modal-demo-title">
          <h2 id="modal-demo-title">Modal</h2>
          <p>
            Opens a dialog that traps focus, restores focus on close, and
            makes the page behind it inaccessible to assistive technology.
          </p>
          <button type="button" className="primary-action" onClick={() => setIsModalOpen(true)}>
            Open dialog
          </button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            titleId="demo-modal-title"
            title="Confirm action"
          >
            <p>
              This dialog traps focus, supports Escape to close, and returns
              focus to the button that opened it.
            </p>
            <label className="field-label">
              Example field
              <input type="text" placeholder="Focusable field to test the trap" />
            </label>
          </Modal>
        </section>

        <section className="demo-card" aria-labelledby="tabs-demo-title">
          <h2 id="tabs-demo-title">Tabs</h2>
          <p>
            Uses roving tabindex and arrow-key navigation so only the active
            tab remains in the tab sequence.
          </p>
          <Tabs
            label="Example tabs"
            defaultSelectedIndex={1}
            onChange={(index) => console.info(`Selected tab index: ${index}`)}
            items={[
              {
                id: "one",
                label: "Overview",
                panel: <p>Overview panel content with a clear active state.</p>,
              },
              {
                id: "two",
                label: "Details",
                panel: <p>Details panel content that updates as you move.</p>,
              },
              {
                id: "three",
                label: "Settings",
                panel: <p>Settings panel content with keyboard-only navigation.</p>,
                disabled: true,
              },
            ]}
          />
        </section>

        <section className="demo-card" aria-labelledby="disclosure-demo-title">
          <h2 id="disclosure-demo-title">Disclosure</h2>
          <p>
            A native button toggles an expandable region with the correct
            aria-expanded state and hidden content behavior.
          </p>
          <Disclosure summary="What's included?">
            <p>Everything you need to test keyboard-only interaction.</p>
          </Disclosure>
        </section>
      </div>
    </main>
  );
}
