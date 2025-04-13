const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const query = document.getElementById("searchInput").value;
    const eventsList = document.getElementById("eventsList");
    eventsList.innerHTML = "Searching...";
    const data = [
      { id: 1, name: "Hackathon 2025", description: "CS event" },
      { id: 2, name: "Science Fair", description: "College expo" }
    ].filter(evt => evt.name.toLowerCase().includes(query.toLowerCase()));
    if (data.length === 0) {
      eventsList.innerHTML = "<p>No events found.</p>";
      return;
    }
    let html = "<ul>";
    data.forEach(evt => {
      html += `
        <li>
          <strong>${evt.name}</strong> - ${evt.description}
          <button class="btn btn--secondary" onclick="viewProjects(${evt.id})">View Projects</button>
        </li>
      `;
    });
    html += "</ul>";
    eventsList.innerHTML = html;
  });
}

function viewProjects(eventId) {
  alert("You clicked View Projects for event ID: " + eventId);
}