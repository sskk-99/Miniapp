// ✅ Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Telegram Init
const tg = window.Telegram.WebApp;
tg.expand();
const user = tg.initDataUnsafe.user;
const uid = user.id.toString();

document.getElementById("username").textContent = user.username || "Anonymous";
document.getElementById("avatar").src = user.photo_url || "";

// ✅ Fix Navigation Buttons
function showSection(id) {
  console.log(`Switching to section: ${id}`); // Optional debug
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  const section = document.getElementById(id);
  if (section) section.classList.add("active");
  else console.error(`No section found for ID: ${id}`);
}

// 🧠 Auto-connect buttons to sections
document.querySelectorAll(".nav button").forEach(button => {
  button.addEventListener("click", () => {
    const sectionId = button.textContent.toLowerCase(); // "Home" => "home"
    showSection(sectionId);
  });
});

// ✅ Load user data from Firestore
async function loadUser() {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("refCount").textContent = data.refCount || 0;
    document.getElementById("refEarnings").textContent = (data.refCount || 0) * 100;
    document.getElementById("points").textContent = data.points || 0;
  } else {
    await setDoc(ref, { refCount: 0, points: 0 });
  }

  document.getElementById("refLink").value = `${window.location.origin}?ref=${uid}`;
}
loadUser();

// ✅ Dummy task handler
window.handleTaskComplete = async function () {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { points: increment(50) });
  alert("You earned 50 points!");
  loadUser();
};
