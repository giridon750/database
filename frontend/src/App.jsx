import { useEffect, useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

async function getErrorMessage(response) {
  const result = await response.json().catch(() => null);
  return result?.message || `The request failed (${response.status}).`;
}

async function requestUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadUsers() {
    setListError("");

    try {
      setUsers(await requestUsers());
    } catch (requestError) {
      setListError(requestError.message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    requestUsers()
      .then((result) => {
        if (isActive) {
          setUsers(result);
          setListError("");
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setListError(requestError.message || "Could not load users.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const numericAge = Number(age);

    if (!trimmedName) {
      setError("Please enter a name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      age.trim() === "" ||
      !Number.isInteger(numericAge) ||
      numericAge < 0 ||
      numericAge > 120
    ) {
      setError("Enter a whole-number age from 0 to 120.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, age: numericAge })
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setName("");
      setEmail("");
      setAge("");
      setSuccess("User added successfully.");
      setIsLoading(true);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || "Could not save this user.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="brand-mark" aria-hidden="true">U</div>
        <div>
          <p className="eyebrow">USER DIRECTORY</p>
          <h1>User Management</h1>
          <p className="header-copy">A simple place to keep your user details together.</p>
        </div>
      </header>

      <section className="content-grid">
        <section className="panel form-panel" aria-labelledby="form-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">GET STARTED</p>
              <h2 id="form-title">Add a user</h2>
            </div>
            <span className="step-badge">NEW</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="user-name">Name</label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Alex Morgan"
              maxLength={100}
              required
            />

            <label htmlFor="user-email">Email</label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="e.g. alex@example.com"
              maxLength={254}
              required
            />

            <label htmlFor="user-age">Age</label>
            <input
              id="user-age"
              type="number"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="e.g. 25"
              min="0"
              max="120"
              step="1"
              required
            />
            <p className="field-hint">Use a whole number between 0 and 120.</p>

            {error && <p className="notice error-notice" role="alert">{error}</p>}
            {success && <p className="notice success-notice" role="status">{success}</p>}

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Add user"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel list-panel" aria-labelledby="users-title">
          <div className="panel-heading list-heading">
            <div>
              <p className="eyebrow">SAVED DETAILS</p>
              <h2 id="users-title">Users</h2>
            </div>
            <span className="student-count">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>

          {isLoading ? (
            <p className="list-message">Loading users...</p>
          ) : listError ? (
            <p className="list-message error-text" role="alert">{listError}</p>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">+</span>
              <h3>No users yet</h3>
              <p>Add the first user using the form.</p>
            </div>
          ) : (
            <ul className="student-list">
              {users.map((user) => (
                <li className="student-row" key={user._id}>
                  <div className="student-avatar" aria-hidden="true">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="student-info">
                    <h3>{user.name}</h3>
                    <p>{user.email} · {user.age} {user.age === 1 ? "year old" : "years old"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      <footer className="page-footer">
        <span>User Management</span>
        <span>Simple records, all in one place.</span>
      </footer>
    </main>
  );
}

export default App;
