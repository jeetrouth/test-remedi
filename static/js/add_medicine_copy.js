document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ add_medicine.js loaded");

  const container = document.getElementById("medicineCards");
  const addBtn = document.getElementById("addAnotherBtn");
  const nextBtn = document.getElementById("nextBtn");

  // ----------------------------
  // Collect ALL medicines
  // ----------------------------
  function collectMedicines() {
    const cards = document.querySelectorAll(".medicine-card");
    const medicines = [];

    cards.forEach((card, index) => {
      const get = (sel) => card.querySelector(sel);

      medicines.push({
        name: get(`[name="med[${index}][name]"]`)?.value || "",
        dosage: get(`[name="med[${index}][dosage]"]`)?.value || "",
        quantity: get(`[name="med[${index}][quantity]"]`)?.value || "",
        medium: get(`[name="med[${index}][medium]"]:checked`)?.value || "",
        food: get(`[name="med[${index}][food]"]:checked`)?.value || "",
        notes: get(`[name="med[${index}][notes]"]`)?.value || "",
      });
    });

    return medicines;
  }

  // ----------------------------
  // Save draft to backend
  // ----------------------------
  async function saveDraft() {
    const medicines = collectMedicines();

    await fetch("/api/draft/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicine: { medicines }
      })
    });

    console.log("💾 Draft saved:", medicines);
  }

  // ----------------------------
  // Add new medicine card
  // ----------------------------
  addBtn?.addEventListener("click", () => {
    const index = document.querySelectorAll(".medicine-card").length;
    const template = document.querySelector(".medicine-card");

    const clone = template.cloneNode(true);
    clone.dataset.index = index;

    clone.querySelectorAll("input, textarea").forEach(el => {
      el.value = "";
      el.name = el.name.replace(/\[\d+\]/, `[${index}]`);
      if (el.type === "radio" || el.type === "checkbox") el.checked = false;
    });

    clone.querySelector("h3").innerText = `Medicine ${index + 1}`;
    container.appendChild(clone);
  });

  // ----------------------------
  // Remove medicine card
  // ----------------------------
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".action-box--remove");
    if (!btn) return;

    const cards = document.querySelectorAll(".medicine-card");
    if (cards.length === 1) return alert("At least one medicine required");

    btn.closest(".medicine-card").remove();
  });

  // ----------------------------
  // NEXT → Schedule
  // ----------------------------
  nextBtn?.addEventListener("click", async () => {
    await saveDraft();
    window.location.href = "/schedule";
  });
});
