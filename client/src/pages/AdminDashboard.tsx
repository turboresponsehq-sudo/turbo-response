import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_session");
    const storedUser = localStorage.getItem("admin_user");

    if (!storedToken || !storedUser) {
      window.location.replace("/admin/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "https://turbo-response-backend.onrender.com"}/api/intakes`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        setCases(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Could not load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Welcome, {user?.email || "Admin"}</h1>
      <h3>Case Submissions:</h3>
      {cases.length === 0 ? (
        <p>No cases submitted yet.</p>
      ) : (
        <ul>
          {cases.map((c: any, i: number) => (
            <li key={i}>
              <strong>{c.full_name || "Unnamed"}</strong> —{" "}
              {c.category || "N/A"} — {c.email || "No email"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
