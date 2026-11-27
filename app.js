const list = document.querySelector("#patient-list");
const errorMessage = document.querySelector("#error-message");
const filter = document.querySelector("#status-filter");

let xmlDocument;

async function loadRegistry() {
  try {
    const response = await fetch("patients.xml");

    if (!response.ok) {
      throw new Error("Cannot load patients.xml");
    }

    const xmlText = await response.text();

    const parser = new DOMParser();
    xmlDocument = parser.parseFromString(
      xmlText, "application/xml"
    );
    const parseError = xmlDocument.querySelector("parsererror");

    if (parseError) {
      list.replaceChildren();
      errorMessage.hidden = false;
      errorMessage.textContent =
        "XML error: " + parseError.textContent;
      xmlDocument = null;
      return;
    }

    errorMessage.hidden = true;
    renderPatients();

  } catch (error) {
    list.replaceChildren();
    errorMessage.hidden = false;
    errorMessage.textContent = error.message;
  }
}

function renderPatients() {
  list.replaceChildren();

  if (!xmlDocument) return;

  const patients = xmlDocument.querySelectorAll("patient");

  patients.forEach((patient) => {
    const status = patient.getAttribute("status");
    const id = patient.getAttribute("id");
    if (filter.value !== "all" && status !== filter.value) {
      return;
    }

    const card = document.createElement("article");
    card.className = "patient-card";
    card.dataset.status = status;

    const heading = document.createElement("h3");
    heading.textContent =
      patient.querySelector("name").textContent;

    const badge = document.createElement("span");
    badge.className = "status " + status;
    badge.textContent = status;

    const patientId = document.createElement("p");
    patientId.textContent = "Patient ID: " + id;

    const ward = document.createElement("p");
    ward.textContent =
      "Ward: " + patient.querySelector("ward").textContent;

    const condition = document.createElement("p");
    condition.textContent =
      "Condition: " + patient.querySelector("condition").textContent;

    const observation = patient.querySelector("observation");

    const reading = document.createElement("p");
    reading.textContent =
      observation.getAttribute("code") + ": " +
      observation.textContent + " " +
      observation.getAttribute("unit");

    card.append(
      heading,
      badge,
      patientId,
      ward,
      condition,
      reading
    );

    list.appendChild(card);
  });
}

filter.addEventListener("change", renderPatients);

loadRegistry();
