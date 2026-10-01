const toolSvg = (contents) => `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="32"
  height="32"
  viewBox="0 0 32 32"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>${contents}</svg>`;

export const brushSvg = toolSvg(`
  <path d="m14 15 9.5-9.5a3 3 0 0 1 4.2 4.2L18 19" />
  <path d="m14 15 4 4-3 5c-1.8 2.8-5.2 4.2-9 3 1.2-1.5 1.6-3 .8-4.7-.7-1.7 0-3.6 1.6-4.5L14 15Z" />
  <path d="m12 17 4 4" />
`);

export const lineSvg = toolSvg(`
  <path d="M6 26 26 6" />
`);

export const squareSvg = toolSvg(`
  <rect x="5" y="6" width="22" height="20" rx="1" />
`);

export const circleSvg = toolSvg(`
  <circle cx="16" cy="16" r="10.5" />
`);

export const filledSquareSvg = toolSvg(`
  <rect x="5" y="6" width="22" height="20" rx="1" fill="currentColor" />
`);

export const filledCircleSvg = toolSvg(`
  <circle cx="16" cy="16" r="10.5" fill="currentColor" />
`);

export const bucketSvg = toolSvg(`
  <path d="m5.5 15.5 10-10 11 11-9 9a4 4 0 0 1-5.7 0l-6.3-6.3a2.6 2.6 0 0 1 0-3.7Z" />
  <path d="M6 16h19" />
  <path d="M27 21.5s-2.5 3-2.5 4.5a2.5 2.5 0 0 0 5 0c0-1.5-2.5-4.5-2.5-4.5Z" />
`);

export const eraserSvg = toolSvg(`
  <path d="m5 19 12.5-12.5a3 3 0 0 1 4.2 0l4.8 4.8a3 3 0 0 1 0 4.2L16 26H9.5L5 21.5A1.8 1.8 0 0 1 5 19Z" />
  <path d="m13 11 9 9" />
  <path d="M16 26h11" />
`);

export const cursorSvg = toolSvg(`
  <path d="M6 4v23l6.5-6.5 4 7 4-2.5-4-7H26L6 4Z" />
`);

export const crosshairCursor = `<svg fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="20px" width="20px" version="1.1" viewBox="0 0 334.312 334.312" xml:space="preserve"><g><g><circle cx="167.156" cy="167.155" r="13.921"/><path stroke="#ffffff" stroke-width="20" fill="#000000" d="M110.483,135.793c3.497,3.491,8.079,5.239,12.656,5.239s9.159-1.748,12.656-5.245    c6.993-6.987,6.993-18.324,0-25.317L30.556,5.244c-6.993-6.987-18.318-6.987-25.311,0s-6.993,18.324,0,25.317L110.483,135.793z"/><path stroke="#ffffff" stroke-width="20" fill="#000000" d="M211.173,141.038c4.583,0,9.159-1.748,12.656-5.239L329.067,30.561    c6.993-6.993,6.993-18.324,0-25.317c-6.993-6.993-18.318-6.987-25.311,0L198.518,110.475c-6.993,6.993-6.993,18.324,0,25.317    C202.014,139.289,206.591,141.038,211.173,141.038z"/><path stroke="#ffffff" stroke-width="20" fill="#000000" d="M303.755,329.066c3.497,3.491,8.079,5.239,12.656,5.239s9.159-1.748,12.656-5.245    c6.993-6.987,6.993-18.324,0-25.317L223.829,198.517c-6.993-6.987-18.318-6.987-25.311,0s-6.993,18.324,0,25.317L303.755,329.066z    "/><path stroke="#ffffff" stroke-width="20" fill="#000000" d="M17.901,334.311c4.583,0,9.159-1.748,12.656-5.239L135.794,223.84    c6.993-6.993,6.993-18.324,0-25.317s-18.318-6.987-25.311,0L5.245,303.748c-6.993,6.993-6.993,18.324,0,25.317    C8.741,332.562,13.324,334.311,17.901,334.311z"/></g></g></svg>`;
