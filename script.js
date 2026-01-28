/*************** FAHRZEUGE *****************/

const vehicles = {
  glf1: {
    name: "GLF 1",
    views: {
      front: { image: "images/glf1_front.jpg", 
		  zones: [
		    { id: "MR", left: 2, top: 55, width: 12, height: 30 },
			{ id: "FR2", left: 15, top: 55, width: 12, height: 30 },
			{ id: "FR3", left: 28, top: 55, width: 12, height: 30 },
			{ id: "FR4", left: 41, top: 55, width: 12, height: 30 }
		  ] 
	  },
      left:  { image: "images/glf1_left.jpg",
		  zones: [
		    { id: "G6", left: 3, top: 55, width: 12, height: 30 },
			{ id: "G2", left: 15, top: 55, width: 12, height: 30 }
		  ] 
	  },
      right: { image: "images/glf1_right.jpg",
		  zones: [
		    { id: "G6", left: 3, top: 55, width: 12, height: 30 },
			{ id: "G2", left: 15, top: 55, width: 12, height: 30 }
		  ] 
	  },
      rear:  { image: "images/glf1_rear.jpg",
		  zones: [
		    { id: "G1", left: 3, top: 55, width: 12, height: 30 },
			{ id: "G2", left: 3, top: 55, width: 12, height: 30 }
		  ] 
	  },
      top:   { image: "images/glf1_top.jpg",
		  zones: [
		    { id: "DB1", left: 3, top: 55, width: 12, height: 30 },
			{ id: "DB2", left: 15, top: 55, width: 12, height: 30 }
		  ] 
	  }
    }
  }
};

/*************** FRAGEN *****************/

let questions = JSON.parse(localStorage.getItem("questions")) || [
  { device: "Spreizer", view: "right", correctZone: "G6" },
  { device: "Atemschutzgerät", view: "front", correctZone: "MR" },
  { device: "Steckleiter", view: "top", correctZone: "DB1" } ];

/*************** VARIABLEN *****************/

let currentVehicle = "glf1";
let currentView = "front";
let index = 0;
let score = 0;
let mode = "learn";
let labelsVisible = false;
let startTime;

/*************** ELEMENTE *****************/

const img = document.getElementById("vehicleImage");
const container = document.querySelector(".image-container");
const questionText = document.getElementById("question");
const feedback = document.getElementById("feedback");
const result = document.getElementById("result");
const timer = document.getElementById("timer"); const vehicleSelect = document.getElementById("vehicleSelect");

/*************** FUNKTIONEN *****************/

function initVehicles() {
  for (let key in vehicles) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = vehicles[key].name;
    vehicleSelect.appendChild(opt);
  }
}

vehicleSelect.onchange = () => {
  currentVehicle = vehicleSelect.value;
  loadQuestion();
};

function setMode(m) {
  mode = m;
  index = 0;
  score = 0;
  if (mode === "exam") startTime = Date.now();
  loadQuestion();
}

function loadQuestion() {
  clearZones();
  feedback.textContent = "";
  result.textContent = "";

  if (index >= questions.length) {
    finishExam();
    return;
  }

  const q = questions[index];
  questionText.textContent = `Wo befindet sich: ${q.device}?`;
  setView(q.view);
}

function setView(view) {
  currentView = view;
  const v = vehicles[currentVehicle].views[view];
  img.src = v.image;
  createZones(v.zones);
}

function createZones(zones) {
  zones.forEach(z => {
    const div = document.createElement("div");
    div.className = "zone";
    div.dataset.zone = z.id;
    div.style.left = z.left + "%";
    div.style.top = z.top + "%";
    div.style.width = z.width + "%";
    div.style.height = z.height + "%";
    div.onclick = () => checkAnswer(z.id, div);

    if (labelsVisible) {
      const label = document.createElement("div");
      label.className = "label";
      label.textContent = z.id;
      div.appendChild(label);
    }

    container.appendChild(div);
  });
}

function clearZones() {
  document.querySelectorAll(".zone").forEach(z => z.remove()); }

function checkAnswer(clicked, el) {
  const correct = questions[index].correctZone;

  if (clicked === correct) {
    score++;
    if (mode === "learn") el.classList.add("correct");
    feedback.textContent = "✅ Richtig";
  } else {
    feedback.textContent = "❌ Falsch";
  }

  setTimeout(() => {
    index++;
    loadQuestion();
  }, 1000);
}

function finishExam() {
  if (mode === "exam") {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    result.textContent = `Ergebnis: ${score}/${questions.length} – Zeit: ${seconds}s`;
  } else {
    result.textContent = "Durchgang beendet";
  }
}

function toggleLabels() {
  labelsVisible = !labelsVisible;
  loadQuestion();
}

/*************** PDF *****************/

function exportPDF() {
    if (!window.jspdf) {
        alert("jsPDF wurde nicht geladen!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("GLF Gerätekunde – Ergebnis", 10, 15);

    doc.setFontSize(12);
    doc.text(`Fahrzeug: ${vehicles[currentVehicle].name}`, 10, 30);
    doc.text(`Punkte: ${score} / ${questions.length}`, 10, 40);

    if (mode === "exam" && startTime) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        doc.text(`Zeit: ${seconds} Sekunden`, 10, 50);
    }

    doc.text(`Datum: ${new Date().toLocaleDateString()}`, 10, 60);

    doc.save("GLF_Geraetekunde_Ergebnis.pdf");
}


/*************** START *****************/

initVehicles();
setMode("learn");
