// view_prescription.js
document.addEventListener("DOMContentLoaded", () => {
    loadPrescriptions();
});

async function loadPrescriptions() {
    const listDiv = document.getElementById("prescriptionsList");

    try {
        // Assuming your API route is /api/prescriptions/list
        const response = await fetch("/api/prescriptions/list");
        const data = await response.json();

        listDiv.innerHTML = "";

        if (!data.prescriptions || data.prescriptions.length === 0) {
            listDiv.innerHTML = "<p class='no-img'>No prescriptions found.</p>";
            return;
        }

        data.prescriptions.forEach(pres => {
            const dropdown = document.createElement("div");
            dropdown.className = "dropdown";

            // pres.id and pres.image_url would come from your database
            dropdown.innerHTML = `
                <button class="dropdown-btn" onclick="togglePrescription('${pres.id}')">
                    Prescription #${pres.id}      -       ${pres.uploaded_at || 'No Date'}
                    <span class="arrow" id="arrow-${pres.id}">▼</span>
                </button>

                <div class="dropdown-content" id="content-${pres.id}" 
                style="display:none; padding: 10px; text-align: center; background: #f9f9f9; border: 1px solid #ddd; border-top: none;">
                
                <!-- Image with inline CSS for responsive fitting -->
                <img src=${pres.image_url} 
                    alt="Prescription" 
                    style="max-width: 100%; height: auto; max-height: 300px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: block; margin: 0 auto;">
                    
                    <div class="actions">
                        <button onclick="deletePrescription('${pres.id}')">
                            🗑 Delete
                        </button>
                        <button id = "createbtn" class="schedule" onclick="createSchedule('${pres.image_url}')">
                            📅 Create schedule with this
                        </button>
                    </div>
                </div>
            `;

            listDiv.appendChild(dropdown);
        });

    } catch (error) {
        console.error("Error loading prescriptions:", error);
        listDiv.innerHTML = "<p>Failed to load prescriptions.</p>";
    }
}

function togglePrescription(id) {
    const content = document.getElementById(`content-${id}`);
    const arrow = document.getElementById(`arrow-${id}`);

    const isHidden = content.style.display === "none";
    content.style.display = isHidden ? "block" : "none";
    arrow.textContent = isHidden ? "▲" : "▼";
}

async function deletePrescription(id) {
    if (!confirm("Are you sure you want to delete this prescription?")) return;

    try {
        const response = await fetch(`/api/prescriptions/delete/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            loadPrescriptions(); // Reload the list after deletion
        } else {
            alert("Failed to delete prescription");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
async function OCR(imageUrl){
    
    try {
       const response = await fetch('/api/fill_from_prescription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image_url: imageUrl })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log("Success:", result);
            alert("✅ Prescription processed successfully!");
            window.location.href = '/addmedicine';
        } else {
            alert("Error: " + (result.error || "Failed to process prescription."));
        }
    }catch{
        alert("Failed to process ocr in prescription");
    }    

}
function createSchedule(image_url) {
    const btn=getElementById("createbtn");
    btn.disabled = true;
    btn.innerText = "⏳ Processing image... (approx 3-5 seconds)...";
    OCR(image_url);

}