const Security = (() => {
  function hashPassword(pass) {
    if (!pass) return null;
    pass = pass.trim();
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
      hash = (hash * 31) + pass.charCodeAt(i);
    }
    return hash.toString();
  }
  const ADMIN_PASSWORD_HASH = hashPassword("admin123");
  function checkAdmin() {
    const pass = prompt("Enter Admin Password:");
    if (!pass) {
      alert("Cancelled");
      return false;
    }
    if (hashPassword(pass) !== ADMIN_PASSWORD_HASH) {
      alert("Wrong Password!");
      return false;
    }
    return true;
  }
  return { checkAdmin };
})();
const Storage = (() => {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
  function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
  }
  function saveRegistrations() {
    localStorage.setItem("registrations", JSON.stringify(registrations));
  }
  return {
    events,
    registrations,
    saveEvents,
    saveRegistrations
  };
})();
const EmailService = (() => {
  function init() {
    emailjs.init("vMQ5JHeBsvz69_JDM"); // replace
  }
  function send(name, email, event) {
    const message = `Hi ${name}, you successfully registered for ${event}`;
    return;
     emailjs.send("service_3a46bqr", "template_7833qnn", {
      to_name: name,
      to_email: email,
      message: message
    });
  }
  return { init, send };
})();
const UI = (() => {
  const tableContainer = () => document.getElementById("eventTableContainer");
  const tableBody = () => document.getElementById("tableBody");
  const select = () => document.getElementById("eventSelect");
  const registerBtn = () => document.getElementById("registerBtn");
  function renderEvents() {
    const body = tableBody();
    const dropdown = select();
    const btn = registerBtn();
    if (!body || !dropdown) return;
    body.innerHTML = "";
    dropdown.innerHTML = "";
    if (Storage.events.length === 0) {
      dropdown.innerHTML = `<option>No events available</option>`;
      dropdown.disabled = true;
      if (btn) btn.disabled = true;
      return;
    }
    dropdown.disabled = false;
    if (btn) btn.disabled = false;
    Storage.events.forEach((event, i) => {
      body.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${event}</td>
          <td>
            <button onclick="App.deleteEvent(${i})">Delete</button>
          </td>
        </tr>
      `;
      dropdown.innerHTML += `<option>${event}</option>`;
    });
  }
  function toggleTable(button) {
    const container = tableContainer();
    if (!container) return;
    if (container.style.display === "none") {
      container.style.display = "block";
      renderEvents();
      if (button) button.textContent = "Hide Events";
    } else {
      container.style.display = "none";
      if (button) button.textContent = "Show Events";
    }
  }
  return { renderEvents, toggleTable };
})();
const App = (() => {
  function addEvent() {
    if (!Security.checkAdmin()) return;
    const input = document.getElementById("eventName");
    const name = input.value.trim();
    if (!name) {
      alert("Enter event name");
      return;
    }
    if (Storage.events.includes(name)) {
      alert("Event already exists!");
      return;
    }
    Storage.events.push(name);
    Storage.saveEvents();
    input.value = "";
    UI.renderEvents();
  }
  function deleteEvent(index) {
    if (!Security.checkAdmin()) return;
    Storage.events.splice(index, 1);
    Storage.saveEvents();

    UI.renderEvents();
  }
  function registerEvent() {
    if (Storage.events.length === 0) {
      alert("No events available.");
      return;
    }
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const event = document.getElementById("eventSelect").value;
    if (!name || !email) {
      alert("Fill all fields");
      return;
    }
    const exists = Storage.registrations.some(r =>
      r.email === email && r.event === event
    );
    if (exists) {
      alert("Already registered!");
      return;
    }
    const record = { name, email, event };
    Storage.registrations.push(record);
    Storage.saveRegistrations();
    alert("Registered successfully!");
    EmailService.send(name, email, event)
      .then(() => alert("Email sent!"))
      .catch(err => console.log(err));
  }
  return { addEvent, deleteEvent, registerEvent };
})();
window.onload = function () {
  EmailService.init();
  const container = document.getElementById("eventTableContainer");
  if (container) container.style.display = "none";
};