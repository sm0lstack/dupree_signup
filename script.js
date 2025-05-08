function getNextSaturdays(count) {
    const today = new Date();
    const saturdays = [];
    let date = new Date(today);
  
    while (saturdays.length < count) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() === 6) {
        saturdays.push(new Date(date));
      }
    }
    return saturdays;
  }
  
  function formatDate(date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  
  function isoDate(date) {
    return date.toISOString().split("T")[0];
  }
  
  function createGoogleCalendarLink(isoDateStr) {
    const start = new Date(isoDateStr + "T09:30:00");
    const end = new Date(isoDateStr + "T10:30:00");
  
    const format = (date) =>
      date.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0, 15) + "Z";
  
    const startFormatted = format(start);
    const endFormatted = format(end);
  
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=Saturday+Class&dates=${startFormatted}/${endFormatted}&details=Fitness+class+with+Dupree&location=Your+Fav+Fit+Studio`;
  }
  
  async function fetchAttendees(date) {
    try {
      const res = await fetch(`/.netlify/functions/get-attendees?date=${date}`);
      const data = await res.json();
      return data.attendees || [];
    } catch (err) {
      console.error("Error fetching attendees:", err);
      return [];
    }
  }
  

  function createClassBlock(date, index) {
    const pretty = formatDate(date);
    const iso = isoDate(date);
    const idSuffix = iso.replace(/-/g, '');
    const calendarLink = createGoogleCalendarLink(iso);
  
    return `
      <div class="signup-row">
        <div class="date-cell">
          <div class="cal-header">
            <a href="${calendarLink}" target="_blank" class="calendar-icon" rel="noopener">
              <img src="assets/calendar_icon.png" alt="Add to Calendar" class="calendar-img" />
            </a>
          </div>
          <div class="date-content">
            <strong class="date-text">${pretty}</strong>
            <span class="day">Saturday</span>
            <span class="time">9:30am – 10:30am</span>
          </div>
        </div>
  
        <div class="slot-cell">
          <p><strong>Attendees</strong><br />
<span class="attendee-count" id="count-${idSuffix}">Loading...</span>
<ul class="attendee-names" id="names-${idSuffix}"></ul>
  

          <form name="signup-fallback" method="POST" data-netlify="true" netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="signup-fallback" />
            <input type="hidden" name="class-date" value="${iso}" />
            <p class="hidden"><label>Don’t fill this out: <input name="bot-field" /></label></p>
  
            <input
              type="text"
              id="name-${idSuffix}"
              name="first-name"
              placeholder="First Name [will be displayed for attendance]"
              required
            />
  
            <input
              type="email"
              id="email-${idSuffix}"
              name="email"
              placeholder="Email"
              required
            />
  
            <button type="submit">Sign Up</button>
          </form>
  
          <div class="success-message" style="display: none;">
            ✅ Sign-up successful! Redirecting…
          </div>
        </div>
      </div>
    `;
  }
  

  
  const container = document.getElementById("class-container");
  getNextSaturdays(3).forEach((date, index) => {
    const iso = isoDate(date);
    const idSuffix = iso.replace(/-/g, '');
  
    container.innerHTML += createClassBlock(date, index);
  
    fetchAttendees(iso).then((attendees) => {
      const el = document.getElementById(`count-${idSuffix}`);
      if (el) el.textContent = `${attendees.length} of 10 slots filled`;
    });
  });
  
  

  document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll('form[data-netlify="true"]');
  
    forms.forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
  
        const formData = new FormData(form);
  
        fetch("/", {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then(() => {
          const name = form.querySelector('input[name="first-name"]').value;
          const date = form.querySelector('input[name="class-date"]').value;
          const encodedName = encodeURIComponent(name);
          const encodedDate = encodeURIComponent(date);
          window.location.href = `/thanks.html?name=${encodedName}&date=${encodedDate}`;
        })
        
        
          .catch((error) => {
            alert("Something went wrong submitting the form.");
            console.error("Form error:", error);
          });
      });
    });
  });
  