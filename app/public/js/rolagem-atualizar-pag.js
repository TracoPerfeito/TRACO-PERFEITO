
  window.addEventListener("load", () => {
    const scrollPos = localStorage.getItem("scrollPos");
    if (scrollPos) {
      window.scrollTo(0, scrollPos);
      localStorage.removeItem("scrollPos");
    }
  });
