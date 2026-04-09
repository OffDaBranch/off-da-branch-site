const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (navLinks) {
  navLinks.dataset.open = "false";
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.dataset.open === "true";
    navLinks.dataset.open = String(!isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.dataset.open = "false";
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((section) => section.classList.add("visible"));
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const subject = encodeURIComponent(`Off Da Branch inquiry from ${name}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message,
      ].join("\n")
    );

    formStatus.textContent = "Opening your mail app with a prefilled message.";
    window.location.href = `mailto:admin@branchoffholdings.com?subject=${subject}&body=${body}`;
  });
}
