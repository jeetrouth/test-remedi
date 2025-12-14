document.addEventListener("DOMContentLoaded", () => {
  let medicines = [];
  let chartInstance = null;

  const medicineListEl = document.getElementById("medicine-list");

  const totalMedEl = document.getElementById("summary-med-count");
  const remindersDayEl = document.getElementById("summary-reminders-day");
  const startDateEl = document.getElementById("summary-start-date");
  const endDateEl = document.getElementById("summary-end-date");

  /* -----------------------------
     FETCH DRAFT DATA
  ----------------------------- */
  async function loadDraft() {
    const res = await fetch("/api/draft/load");
    const data = await res.json();

    if (!data.draft || !Array.isArray(data.draft.medicines)) {
      medicineListEl.innerHTML =
        "<p>No draft found. Please go back.</p>";
      return;
    }

    medicines = data.draft.medicines;
  }

  /* -----------------------------
     RENDER MEDICINE DROPDOWNS
  ----------------------------- */
  function renderMedicines() {
    medicineListEl.innerHTML = "";

    medicines.forEach((item, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "medicine-item";

      wrapper.innerHTML = `
        <button class="medicine-header" type="button">
          <div>
            <div class="title">${item.medicine.name}</div>
            <div class="subtitle">${item.medicine.dosage || ""}</div>
          </div>
          <div class="caret">▼</div>
        </button>

        <div class="medicine-details">
          <div><b>Start date:</b> ${item.schedule.start_date || "—"}</div>
          <div><b>Duration:</b> ${item.schedule.duration_days} days</div>
          <div><b>Days:</b> ${
            item.schedule.days.length
              ? item.schedule.days.join(", ")
              : "—"
          }</div>
          <div><b>Time:</b> ${item.schedule.time || "—"}</div>
          <div><b>Quantity per dose:</b> ${item.schedule.quantity_per_dose}</div>
          <div><b>Total remaining:</b> ${item.medicine.quantity}</div>
        </div>
      `;

      const header = wrapper.querySelector(".medicine-header");
      const details = wrapper.querySelector(".medicine-details");

      header.addEventListener("click", e => {
        e.preventDefault();
        details.classList.toggle("open");
      });

      medicineListEl.appendChild(wrapper);
    });
  }

  /* -----------------------------
     SUMMARY CALCULATION
  ----------------------------- */
  function renderSummary() {
    totalMedEl.innerText = medicines.length;

    // total reminders per day = sum of quantity_per_dose
    const totalPerDay = medicines.reduce(
      (sum, m) => sum + (m.schedule.quantity_per_dose || 0),
      0
    );
    remindersDayEl.innerText = totalPerDay;

    // start date = earliest start
    const startDates = medicines
      .map(m => m.schedule.start_date)
      .filter(Boolean)
      .map(d => new Date(d));

    if (startDates.length) {
      const minStart = new Date(Math.min(...startDates));
      startDateEl.innerText = minStart.toLocaleDateString();
    } else {
      startDateEl.innerText = "Not set";
    }

    // end date = max(start + duration)
    const endDates = medicines
      .filter(m => m.schedule.start_date && m.schedule.duration_days)
      .map(m => {
        const d = new Date(m.schedule.start_date);
        d.setDate(d.getDate() + m.schedule.duration_days);
        return d;
      });

    if (endDates.length) {
      const maxEnd = new Date(Math.max(...endDates));
      endDateEl.innerText = maxEnd.toLocaleDateString();
    } else {
      endDateEl.innerText = "Not set";
    }
  }

  /* -----------------------------
     DONUT CHART
  ----------------------------- */
  function renderChart() {
    const canvas = document.getElementById("medicine-donut-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: medicines.map(m => m.medicine.name),
        datasets: [
          {
            data: medicines.map(() => 1),
            backgroundColor: [
              "#4c8bfd",
              "#22c55e",
              "#f97316",
              "#a855f7",
              "#ef4444",
              "#14b8a6"
            ]
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  /* -----------------------------
     ACTION BUTTONS
  ----------------------------- */
  async function activateSchedules() {
    const res = await fetch("/api/activate", { method: "POST" });

    if (!res.ok) {
      alert("Failed to activate schedules");
      return;
    }

    window.location.href = "/dashboard";
  }

  function goBack() {
    window.location.href = "/schedule";
  }

  async function saveDraftOnly() {
    await fetch("/api/draft/save", { method: "POST" });
    alert("Draft saved");
  }

  /* -----------------------------
     INIT
  ----------------------------- */
  async function init() {
    await loadDraft();
    renderMedicines();
    renderSummary();
    renderChart();

    document
      .getElementById("activate-btn")
      ?.addEventListener("click", activateSchedules);

    document
      .getElementById("back-btn")
      ?.addEventListener("click", goBack);

    document
      .getElementById("save-draft-btn")
      ?.addEventListener("click", saveDraftOnly);
  }

  init();
});
