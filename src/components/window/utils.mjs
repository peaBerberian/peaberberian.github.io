export function keepWindowActiveInCurrentEventLoopIteration(windowElt) {
  // Ugly trick to prevent the window to be needlesly deactivated before the
  // next event loop turn
  windowElt.dataset.dontDisableOnLoop = true;
  setTimeout(() => {
    delete windowElt.dataset.dontDisableOnLoop;
  }, 0);
}
