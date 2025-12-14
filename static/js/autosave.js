// ---------- HELPERS ----------
function collectFormData() {
  return {
    medicine: {
      name: document.getElementById("medName")?.value || "",
      dosage: document.getElementById("dosage")?.value || "",
      medium: document.getElementById("medium")?.value || "",
      quantity: document.getElementById("quantity")?.value || "",
      food: document.getElementById("food")?.value || "",
      notes: document.getElementById("notes")?.value || ""
    },
    schedule: {
      time: document.getElementById("time-input")?.value || "",
      frequency: document.getElementById("frequency-select")?.value || "",
      every_x_hours: document.getElementById("every-x-hours-input")?.value || null,
      reminder_enabled: document.getElementById("enable-reminder-checkbox")?.checked || false,
      snooze_minutes: document.getElementById("snooze-select")?.value || 10,
      notification_type: getNotificationType(),
      days: getSelectedDays()
    }
  };
}

function getSelectedDays() {
  return Array.from(document.querySelectorAll(".day.selected"))
    .map(d => d.dataset.day.toLowerCase());
}

function getNotificationType() {
  const browser = document.getElementById("notify-browser-checkbox")?.checked;
  const email = document.getElementById("notify-email-checkbox")?.checked;
  if (browser && email) return "both";
  if (email) return "email";
  return "push";
}

// ---------- SAVE DRAFT ----------
async function saveDraft() {
  const payload = collectFormData();

  await fetch("/api/draft/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

// ---------- LOAD DRAFT ----------
async function loadDraft() {
  const res = await fetch("/api/draft/load");
  const data = await res.json();

  if (!data.draft) return;

  const d = data.draft;

  // Medicine
  if (d.medicine) {
    document.getElementById("medName") && (medName.value = d.medicine.name || "");
    document.getElementById("dosage") && (dosage.value = d.medicine.dosage || "");
    document.getElementById("notes") && (notes.value = d.medicine.notes || "");
  }

  // Schedule
  if (d.schedule) {
    document.getElementById("time-input") && (timeInput.value = d.schedule.time || "");
    document.getElementById("frequency-select") && (frequencySelect.value = d.schedule.frequency || "");

    if (d.schedule.days) {
      d.schedule.days.forEach(day => {
        const el = document.querySelector(`.day[data-day="${day.toUpperCase()}"]`);
        el && el.classList.add("selected");
      });
    }

    document.getElementById("enable-reminder-checkbox") &&
      (enableReminderCheckbox.checked = d.schedule.reminder_enabled);
  }
}

// ---------- AUTOSAVE TRIGGERS ----------
document.addEventListener("input", () => {
  clearTimeout(window.__autosaveTimer);
  window.__autosaveTimer = setTimeout(saveDraft, 800);
});

// ---------- LOAD ON PAGE OPEN ----------
document.addEventListener("DOMContentLoaded", loadDraft);
