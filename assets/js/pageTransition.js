const routeToPage = (page) => {
  switch (page) {
    case "stopWatch":
      window.addEventListener("keyup", checkPressedKey);
      showPage("stopwatch", "bgImage2");
      break;

    case "informationPage":
      window.removeEventListener("keyup", checkPressedKey);
      showPage("informationPage", "bgImage4");
      break;

    case "settings":
      window.removeEventListener("keyup", checkPressedKey);
      showPage("setting", "bgImage4");
      break;
  }
};

const showPage = (page, bgImage) => {
  const StopWatchPage = document.getElementById("StopWatchPage");
  const Settings = document.getElementById("settingPage");
  const informationPage = document.getElementById("informationPage");

  if (StopWatchPage) StopWatchPage.style.display = page === "stopwatch" ? "flex" : "none";
  if (Settings) Settings.style.display = page === "setting" ? "flex" : "none";
  if (informationPage) informationPage.style.display = page === "informationPage" ? "flex" : "none";

  const bgImage1 = document.getElementById("bg-image1");
  const bgImage2 = document.getElementById("bg-image2");
  const bgImage4 = document.getElementById("bg-image4");

  if (bgImage1) bgImage1.style.display = bgImage === "bgImage1" ? "block" : "none";
  if (bgImage2) bgImage2.style.display = bgImage === "bgImage2" ? "block" : "none";
  if (bgImage4) bgImage4.style.display = bgImage === "bgImage4" ? "block" : "none";

  // Active state for navbar tabs
  document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  const activeTab = document.getElementById(`nav-${page}`);
  if (activeTab) activeTab.classList.add("active");
};
