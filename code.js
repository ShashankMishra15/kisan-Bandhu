// ================= GLOBAL VARIABLES =================
let role = "";
let currentUser = "";
let users = JSON.parse(localStorage.getItem("users")) || { farmer: [], buyer: [] };
let allBids = JSON.parse(localStorage.getItem("bids")) || [];

// ================= TOAST MESSAGE =================
function showToast(message, success = true) {
  const toast = document.getElementById("toast");
  toast.style.background = success ? "#43a047" : "#f44336";
  toast.innerText = message;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

// ================= SAVE DATA =================
function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("bids", JSON.stringify(allBids));
}

// ================= ROLE SELECTION =================
function showSignForm(selectedRole) {
  role = selectedRole;
  document.getElementById("chooseRole").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("formTitle").innerText =
    role === "farmer" ? "Farmer Login" : "Buyer Login";
}

// ================= SIGNUP =================
function signup() {
  const email = userEmail.value;
  const password = userPassword.value;

  if (!email || !password) {
    showToast("Enter email and password", false);
    return;
  }

  users[role].push({ email, password });
  saveData();
  showToast("Account created!");
  updateStats();
}

// ================= LOGIN =================
function login() {
  const email = userEmail.value;
  const password = userPassword.value;

  // ADMIN LOGIN
  if (email === "teamants@gmail.com" && password === "ants") {
    currentUser = "Admin";
    enterDashboard("admin");
    return;
  }

  const found = users[role].find(u => u.email === email && u.password === password);
  if (!found) {
    showToast("Account not found", false);
    return;
  }

  currentUser = email;
  enterDashboard(role);
}

// ================= ENTER DASHBOARD =================
function enterDashboard(selectedRole) {
  // Hide login, show dashboard
  loginPage.style.display = "none";
  dashboard.style.display = "flex";

  const sidebarMenu = document.getElementById("sidebarMenu");

  // Remove old admin link if it exists
  const oldAdminLink = document.getElementById("adminMenuLink");
  if (oldAdminLink) oldAdminLink.remove();

  if (selectedRole === "admin") {
    // Create admin menu link dynamically
    const li = document.createElement("li");
    li.id = "adminMenuLink";
    li.innerText = "🛠 Admin Dashboard";
    li.style.color = "yellow"; // optional styling
    li.onclick = () => showSection("admin");
    // Insert before Logout link
    sidebarMenu.insertBefore(li, sidebarMenu.lastElementChild);

    // Show admin section by default
    showSection("admin");
    updateAdminStats(); // Optional: define this function to show admin stats
  } else {
    // Show home for farmer/buyer
    showSection("home");
  }

  // Load common content
  loadSchemes();
  updateStats();
  displayAllBids(); // Optional: show bids in marketplace or admin dashboard
}

// ================= LOGOUT =================
function logout() {
  dashboard.style.display = "none";
  chooseRole.style.display = "block";
  currentUser = "";
}

// ================= NAVIGATION =================
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ================= PLACE BID =================
function placeFarmerBid() {
  const crop = cropType.value;
  const qty = quantity.value;
  const price = askPrice.value;

  if (!crop || !qty || !price) {
    showToast("Fill all fields", false);
    return;
  }

  allBids.push({ farmer: currentUser, crop, qty, price });
  saveData();
  showToast("Bid placed!");
  updateStats();
  displayAllBids();
}

// ================= DISPLAY BIDS =================
function displayAllBids() {
  const div = document.getElementById("allBids");
  div.innerHTML = "";
  allBids.forEach(b => {
    div.innerHTML += `<p>${b.farmer} - ${b.crop} - ${b.qty}kg - ₹${b.price}</p>`;
  });

  // Admin sees all bids too
  const adminDiv = document.getElementById("adminBids");
  if (adminDiv) {
    adminDiv.innerHTML = "";
    allBids.forEach(b => {
      adminDiv.innerHTML += `<p>Farmer: ${b.farmer} | Crop: ${b.crop} | Qty: ${b.qty}kg | Price: ₹${b.price}</p>`;
    });
  }
}

// ================= RECOMMENDATION =================
function getRecommendation() {
  const soil = document.getElementById("soilType").value;
  const season = document.getElementById("season").value;
  const region = document.getElementById("region").value;
  const resultDiv = document.getElementById("recommendationResult");

  if (!soil || !season || !region) {
    resultDiv.innerHTML = "<p>Please select Soil, Season and Region.</p>";
    return;
  }

  const crops = [
    {name:"Wheat",soil:["alluvial","loamy"],season:"rabi",region:["north","central"],reason:"Wheat grows best in cool Rabi season and fertile alluvial soil of North & Central India."},
    {name:"Mustard",soil:["alluvial","loamy"],season:"rabi",region:["north","west"],reason:"Mustard requires low temperature and grows well in North & Western India."},
    {name:"Gram (Chana)",soil:["black","loamy"],season:"rabi",region:["central","west"],reason:"Gram needs dry climate and black soil suitable for Central India."},
    {name:"Rice (Paddy)",soil:["alluvial","laterite"],season:"kharif",region:["east","south"],reason:"Rice requires heavy rainfall and grows best in Kharif season in East & South India."},
    {name:"Maize",soil:["alluvial","red"],season:"kharif",region:["north","south"],reason:"Maize grows well in moderate rainfall and fertile soil."},
    {name:"Cotton",soil:["black"],season:"kharif",region:["west","central"],reason:"Cotton needs black soil and warm climate mainly found in Maharashtra & Gujarat."},
    {name:"Sugarcane",soil:["alluvial","loamy"],season:"kharif",region:["north","south"],reason:"Sugarcane requires fertile soil and long growing season."},
    {name:"Groundnut",soil:["red","sandy"],season:"kharif",region:["south","west"],reason:"Groundnut grows well in sandy and red soils of South India."},
    {name:"Watermelon",soil:["sandy"],season:"zaid",region:["north","west"],reason:"Watermelon grows in summer season in sandy soil with irrigation."},
    {name:"Cucumber",soil:["loamy"],season:"zaid",region:["north","central"],reason:"Cucumber grows well in warm summer climate."}
  ];

  const recommendations = crops.filter(c => c.soil.includes(soil) && c.season === season && c.region.includes(region));

  if (recommendations.length === 0) {
    resultDiv.innerHTML = "<p>No suitable crop found. Try different inputs.</p>";
    return;
  }

  let output = "<h3>Recommended Crops:</h3>";
  recommendations.forEach(crop => {
    output += `<div class="advisory-card"><h4>${crop.name}</h4><p><strong>Reason:</strong> ${crop.reason}</p></div>`;
  });

  resultDiv.innerHTML = output;
}

// ================= LOAD SCHEMES =================
function loadSchemes() {
  const schemeList = document.getElementById("schemeList");
  if(schemeList) {
    schemeList.innerHTML = `
      <li>PM-Kisan - Income Support</li>
      <li>MSP Wheat - ₹2125/qtl</li>
    `;
  }
}

// ================= UPDATE STATS =================
function updateStats() {
  const farmerCount = document.getElementById("farmerCount");
  const buyerCount = document.getElementById("buyerCount");
  const bidCount = document.getElementById("bidCount");
  if(farmerCount) farmerCount.innerText = users.farmer.length;
  if(buyerCount) buyerCount.innerText = users.buyer.length;
  if(bidCount) bidCount.innerText = allBids.length;
}

// ================= CALCULATE MSP =================
function calculateMSP() {
  const crop = document.getElementById("mspCrop").value;
  const qty = parseFloat(document.getElementById("mspQuantity").value);
  const mspRates = { wheat:2275, paddy:2183, maize:2090, gram:5440, mustard:5650 };

  if(!crop || !qty) {
    document.getElementById("mspResult").innerText = "Please select crop and enter quantity.";
    return;
  }

  const total = mspRates[crop]*qty;
  document.getElementById("mspResult").innerText = 
    `Government MSP for ${crop.toUpperCase()} is ₹${mspRates[crop]} per quintal.\nTotal Amount for ${qty} quintal = ₹${total}`;
}

// ================= LOAD BIDS ON PAGE LOAD =================
window.onload = function() {
  displayAllBids();
  updateStats();
}
