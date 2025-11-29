// ===============================
// SedatUI: makeDraggable()
// Reusable across all projects
// ===============================

export function makeDraggable(element, handle = element) {
  if (!element || !handle) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  handle.style.cursor = "grab";

  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;

    dragging = true;
    handle.style.cursor = "grabbing";

    const rect = element.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    element.style.position = "fixed"; 
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    element.style.left = initialLeft + dx + "px";
    element.style.top = initialTop + dy + "px";
    element.style.right = "auto";
    element.style.bottom = "auto";
  });

  handle.addEventListener("pointerup", (e) => {
    dragging = false;
    handle.style.cursor = "grab";
    handle.releasePointerCapture?.(e.pointerId);
  });
}

// Make it global
window.makeDraggable = makeDraggable;
