// TODO: display high score at the end
// TODO: replace bomb powerup by one preventing ships from sending bullets for a time
// TODO: avoid restarting on mouseup after gameover
// TODO: rewritten as canvas for better perfs?

const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS; // ~16.67ms
const LEFT_KEYS = ["a", "arrowleft"];
const RIGHT_KEYS = ["d", "arrowright"];

const UFO_SVG = `<svg height="800px" width="800px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.001 512.001" xml:space="preserve"><path style="fill:#FF4D30;" d="M136.662,416.962c23.923,41.064,68.391,68.68,119.338,68.68c50.946,0,95.415-27.616,119.338-68.68  H136.662z"/><path style="opacity:0.1;fill:#231F20;enable-background:new    ;" d="M155.029,416.962h-18.366  c23.923,41.064,68.391,68.68,119.338,68.68c3.086,0,6.147-0.106,9.183-0.306C218.109,482.242,177.502,455.538,155.029,416.962z"/><path style="fill:#3A5D74;" d="M33.661,366.715v30.119c0,11.74,9.519,21.259,21.26,21.259h402.159  c11.741,0,21.26-9.519,21.26-21.259v-30.119H33.661"/><path style="opacity:0.1;fill:#231F20;enable-background:new    ;" d="M52.027,396.834v-30.119H33.661v30.119  c0,11.74,9.519,21.259,21.26,21.259h18.366C61.546,418.092,52.027,408.573,52.027,396.834z"/><path style="fill:#CAE9F7;" d="M256,147.32c-4.681,0-8.477-3.794-8.477-8.477V76.03c0-4.681,3.795-8.477,8.477-8.477  s8.477,3.795,8.477,8.477v62.813C264.477,143.524,260.681,147.32,256,147.32z"/><path style="fill:#90C8EC;" d="M105.744,264.112h300.512c-12.958-71.24-75.278-125.269-150.256-125.269  C181.021,138.843,118.701,192.872,105.744,264.112z"/><path style="fill:#3A5D74;" d="M333.362,264.112v-31.061c0-11.742-9.519-21.261-21.26-21.261H199.9  c-11.744,0-21.261,9.519-21.261,21.261v31.061H333.362z"/><circle style="fill:#FF4D30;" cx="256" cy="57.068" r="30.709"/><g><path style="opacity:0.1;fill:#231F20;enable-background:new    ;" d="M265.183,139.123c-3.039-0.18-6.099-0.28-9.183-0.28   c-74.979,0-137.299,54.029-150.256,125.269h18.366C136.536,195.802,194.346,143.327,265.183,139.123z"/><path style="opacity:0.1;fill:#231F20;enable-background:new    ;" d="M218.267,211.79H199.9c-11.744,0-21.261,9.519-21.261,21.261   v31.061h18.366v-31.061C197.007,221.309,206.524,211.79,218.267,211.79z"/><path style="opacity:0.1;fill:#231F20;enable-background:new    ;" d="M243.655,57.068c0-13.76,9.054-25.404,21.528-29.308   c-2.9-0.909-5.985-1.398-9.183-1.398c-16.958,0-30.711,13.748-30.711,30.706c0,16.963,13.753,30.709,30.711,30.709   c3.199,0,6.283-0.491,9.183-1.398C252.71,82.476,243.655,70.831,243.655,57.068z"/></g><path style="fill:#578CAD;" d="M382.844,368.975h107.897c11.741,0,21.26-9.519,21.26-21.259v-17.598  c0-37.704-30.564-68.267-68.267-68.267H68.266C30.564,261.852,0,292.415,0,330.118v17.598c0,11.74,9.519,21.259,21.259,21.259  H382.844"/><path style="opacity:0.1;fill:#231F20;enable-background:new    ;" d="M18.366,347.716v-17.598  c0-37.704,30.564-68.267,68.266-68.267H68.266C30.564,261.852,0,292.415,0,330.118v17.598c0,11.74,9.519,21.259,21.259,21.259  h18.366C27.885,368.975,18.366,359.456,18.366,347.716z"/><path style="fill:#FF9737;" d="M449.107,323.889H62.892c-4.681,0-8.477-3.794-8.477-8.477c0-4.683,3.795-8.477,8.477-8.477h386.215  c4.683,0,8.477,3.794,8.477,8.477C457.584,320.094,453.789,323.889,449.107,323.889z"/></svg>`;
const ALIEN1_SVG = `<svg height="800px" width="800px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48" xml:space="preserve"><g><path style="fill:#40C7A9;" d="M24,2.5C12.127,2.5,0,17.75,0,30.937c0,1.37,1.027,2.563,2.397,2.563h2.665   c0.072-0.379,0.158-0.76,0.277-1.145c0.416-1.346,1.461-2.47,2.837-2.775c1.041-0.231,2.236-0.031,3.057,1.534   c0.389,0.74,0.452,1.61,0.211,2.386h25.113c-0.241-0.776-0.178-1.646,0.211-2.386c0.822-1.565,2.017-1.765,3.057-1.534   c1.376,0.306,2.421,1.429,2.837,2.775c0.119,0.384,0.204,0.765,0.277,1.145h2.797C47.06,33.5,48,32.375,48,31.049   C48,18.667,35.909,2.5,24,2.5z"/><path style="fill:#C1F4E8;" d="M14.229,30.5c-0.095-0.267-0.209-0.528-0.341-0.78c-1.073-2.046-2.902-3.22-5.019-3.22   c-0.44,0-0.893,0.051-1.346,0.151c-1.918,0.426-3.557,1.727-4.509,3.513C3.482,18.471,14.399,5.5,24,5.5   c9.853,0,20.387,14.161,20.975,24.645c-0.953-1.776-2.587-3.069-4.5-3.494C40.022,26.551,39.57,26.5,39.13,26.5   c-2.116,0-3.945,1.174-5.019,3.221c-0.133,0.251-0.246,0.512-0.341,0.779H14.229z"/><path style="fill:#d16544;" d="M9,45.5c0,0-5.798-6.231-3.662-13.145c0.416-1.347,1.461-2.47,2.837-2.775   c1.041-0.231,2.236-0.031,3.057,1.534c0.615,1.172,0.419,2.669-0.517,3.605C8.676,36.759,9,40.5,9,45.5z"/><path style="fill:#d16544;" d="M21,33.5c-2.844,1.781-3,10-3,10c-4.313-4.25-3-10-3-10H21z"/><path style="fill:#d16544;" d="M39,45.5c0,0,5.798-6.231,3.662-13.145c-0.416-1.347-1.461-2.47-2.837-2.775   c-1.041-0.231-2.236-0.031-3.057,1.534c-0.615,1.172-0.419,2.669,0.517,3.605C39.324,36.759,39,40.5,39,45.5z"/><path style="fill:#d16544;" d="M27,33.5c2.844,1.781,3,10,3,10c4.313-4.25,3-10,3-10H27z"/><ellipse style="fill:#E64C3C;" cx="24" cy="12" rx="5" ry="5.5"/><ellipse style="fill:#E64C3C;" cx="31" cy="24" rx="5" ry="5.5"/><ellipse style="fill:#E64C3C;" cx="17" cy="24" rx="5" ry="5.5"/><path style="fill:#C03A2B;" d="M28.993,11.845C28.994,11.897,29,11.948,29,12c0,3.038-2.239,5.5-5,5.5s-5-2.462-5-5.5   c0-0.052,0.006-0.103,0.007-0.155C16.592,13.28,15,15.724,15,18.5c0,0.151,0.016,0.298,0.025,0.447   C15.631,18.66,16.298,18.5,17,18.5c2.761,0,5,2.462,5,5.5c0,0.782-0.151,1.525-0.419,2.199C22.352,26.39,23.161,26.5,24,26.5   s1.648-0.11,2.419-0.301C26.151,25.525,26,24.782,26,24c0-3.038,2.239-5.5,5-5.5c0.702,0,1.369,0.16,1.975,0.447   C32.984,18.798,33,18.651,33,18.5C33,15.724,31.408,13.28,28.993,11.845z"/></g></svg>`;
const ALIEN2_SVG = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 484.8 484.8" xml:space="preserve"><g><path style="fill:#109DA0;" d="M484.8,286.4c0,104-95.2,188-242.4,188S0,390.4,0,286.4s95.2-260,242.4-260S484.8,182.4,484.8,286.4   z"/><path style="fill:#109DA0;" d="M484.8,286.4c0,104-95.2,156-242.4,156S0,390.4,0,286.4s95.2-276,242.4-276S484.8,182.4,484.8,286.4   z"/></g><g><path style="fill:#19BCA4;" d="M242.4,10.4c147.2,0,242.4,172,242.4,276s-95.2,156-242.4,156"/><path style="fill:#19BCA4;" d="M484.8,286.4c0,104-95.2,156-242.4,156S0,390.4,0,286.4s95.2-260,242.4-260S484.8,182.4,484.8,286.4   z"/></g><path style="fill:#28DDBF;" d="M0,286.4c0-104,95.2-260,242.4-260"/><path style="fill:#109DA0;" d="M242.4,26.4c147.2,0,242.4,156,242.4,260s-95.2,188-242.4,188"/><path style="fill:#0C838C;" d="M242.4,26.4c147.2,0,242.4,156,242.4,260"/><path style="fill:#28DDBF;" d="M205.6,283.2c0,10.4-30.4,14.4-68.8,14.4c-37.6,0-68.8-4-68.8-14.4S98.4,264,136.8,264  C175.2,264,205.6,272.8,205.6,283.2z"/><path style="fill:#19BCA4;" d="M416.8,283.2c0,10.4-30.4,14.4-68.8,14.4c-37.6,0-68.8-4-68.8-14.4S309.6,264,348,264  C385.6,264,416.8,272.8,416.8,283.2z"/><g><circle style="fill:#109DA0;" cx="68.8" cy="262.4" r="4.8"/><circle style="fill:#109DA0;" cx="32.8" cy="278.4" r="8.8"/><circle style="fill:#109DA0;" cx="56.8" cy="246.4" r="1.6"/><circle style="fill:#109DA0;" cx="93.6" cy="260.8" r="1.6"/></g><g><circle style="fill:#19BCA4;" cx="407.2" cy="264.8" r="6.4"/><circle style="fill:#19BCA4;" cx="427.2" cy="276" r="1.6"/><circle style="fill:#19BCA4;" cx="438.4" cy="299.2" r="4.8"/><circle style="fill:#19BCA4;" cx="440.8" cy="246.4" r="4.8"/></g><g><circle style="fill:#109DA0;" cx="60.8" cy="294.4" r="4"/><circle style="fill:#109DA0;" cx="67.2" cy="227.2" r="3.2"/></g><g><circle style="fill:#19BCA4;" cx="24.8" cy="116.8" r="8.8"/><circle style="fill:#19BCA4;" cx="50.4" cy="88.8" r="4.8"/></g><circle style="fill:#109DA0;" cx="460" cy="136" r="1.6"/><g><circle style="fill:#19BCA4;" cx="453.6" cy="112.8" r="6.4"/><path style="fill:#19BCA4;" d="M478.4,116.8c0,2.4-1.6,4-4,4s-4-1.6-4-4c0-2.4,1.6-4,4-4C476,112.8,478.4,115.2,478.4,116.8z"/></g><g><circle style="fill:#109DA0;" cx="34.4" cy="140.8" r="4.8"/><path style="fill:#109DA0;" d="M301.6,304.8c0,20.8-26.4,64.8-59.2,64.8s-59.2-44-59.2-64.8"/></g><path style="fill:#02243E;" d="M266.4,330.4h-48c-4.8,0-8-3.2-8-8s3.2-8,8-8h48c4.8,0,8,3.2,8,8S271.2,330.4,266.4,330.4z"/><path style="fill:#109DA0;" d="M205.6,258.4c-16.8,24-57.6,24.8-92,0.8c-34.4-23.2-48.8-62.4-32.8-86.4c16.8-24,57.6-24.8,92.8-0.8  C207.2,195.2,221.6,234.4,205.6,258.4z"/><path style="fill:#1E4784;" d="M213.6,245.6c-16.8,24-57.6,24.8-92.8,0.8C86.4,223.2,72,184,88,160c16.8-24,57.6-24.8,92-0.8  C216,183.2,230.4,221.6,213.6,245.6z"/><path style="fill:#00233F;" d="M181.6,159.2c34.4,23.2,48.8,62.4,32.8,86.4c-16.8,24-57.6,24.8-92.8,0.8"/><path style="fill:#19BCA4;" d="M279.2,258.4c16.8,24,57.6,24.8,92,0.8c34.4-23.2,48.8-62.4,32.8-86.4c-16.8-24-57.6-24.8-92.8-0.8  C277.6,195.2,263.2,234.4,279.2,258.4z"/><path style="fill:#1E4784;" d="M271.2,245.6c16.8,24,57.6,24.8,92.8,0.8c34.4-23.2,48.8-62.4,32.8-86.4c-16.8-24-57.6-24.8-92.8-0.8  S254.4,221.6,271.2,245.6z"/><path style="fill:#00233F;" d="M303.2,159.2c-34.4,23.2-48.8,62.4-32.8,86.4c16.8,24,57.6,24.8,92.8,0.8"/><g><rect x="220.017" y="90.87" transform="matrix(-0.7072 -0.707 0.707 -0.7072 333.3726 363.8002)" style="fill:#28DDBF;" width="44" height="44"/><circle style="fill:#28DDBF;" cx="242.4" cy="349.6" r="7.2"/><circle style="fill:#28DDBF;" cx="242.4" cy="382.4" r="7.2"/><circle style="fill:#28DDBF;" cx="242.4" cy="414.4" r="7.2"/></g></svg>`;

// const PLAYER_CHAR = "🛩️";
// const PLAYER_DAMAGE_CHAR = "💥";
// const ALIEN_PROJECTILE_CHAR = "🏀";
// const ALIEN_PROJECTILE_CHAR = "🧶";
const ALIEN_PROJECTILE_CHAR = "🐄";
// const ALIEN_PROJECTILE_CHAR = "🧳";
// const ALIEN_PROJECTILE_CHAR = "🔧";
// const PLAYER_PROJECTILE_CHAR = "🍅";
// const PLAYER_PROJECTILE_CHAR = "🔴";
// const PLAYER_PROJECTILE_CHAR = "🔺";
const PLAYER_SVG = `<svg stroke-width="5px" stroke="#000000" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 509 509" xml:space="preserve"><g><polygon style="fill:#DEDEDF;" points="238.6,400.5 157.7,450.1 157.7,477.3 254.5,454.7 254.5,413.8  "/><polygon style="fill:#DEDEDF;" points="270.4,400.5 351.3,450.1 351.3,477.3 254.5,454.7 254.5,413.8  "/></g><g><path style="fill:#F1F3F7;" d="M186.3,214.8h-19.9c-2.3,0-4.2-1.9-4.2-4.2v-44.1h28.3v44.1C190.5,212.9,188.6,214.8,186.3,214.8z"/><path style="fill:#F1F3F7;" d="M125.2,251.5h-19.9c-2.3,0-4.2-1.9-4.2-4.2v-44.1h28.3v44.1C129.4,249.6,127.6,251.5,125.2,251.5z"/><path style="fill:#F1F3F7;" d="M322.7,214.8h19.9c2.3,0,4.2-1.9,4.2-4.2v-44.1h-28.3v44.1C318.5,212.9,320.4,214.8,322.7,214.8z"/><path style="fill:#F1F3F7;" d="M383.8,251.5h19.9c2.3,0,4.2-1.9,4.2-4.2v-44.1h-28.3v44.1C379.6,249.6,381.4,251.5,383.8,251.5z"/></g><g><polygon style="fill:#DEDEDF;" points="226.5,162.1 43.9,287.5 43.9,320.3 232.3,276  "/><polygon style="fill:#DEDEDF;" points="282.5,162.1 465.1,287.5 465.1,320.3 276.7,276  "/></g><path style="fill:#F1F3F7;" d="M254.5,11.4c-22.3,0-35.2,62.6-35.2,62.6s0,215.2,0,247.8c0,91.1,26.1,132.9,35.2,132.9  c9.5,0,35.2-43.1,35.2-132.9c0-32.6,0-247.8,0-247.8S276.8,11.4,254.5,11.4z"/><path style="fill:#6EB1E1;" d="M254.5,60.3c11.9,0,22.3,4.9,28.6,12.3c-1.4-14.5-13.7-25.9-28.6-25.9s-27.2,11.4-28.6,25.9  C232.2,65.2,242.6,60.3,254.5,60.3z"/><path style="fill:#BDBDBE;" d="M254.5,369.1c-3.4,0-6.1,2.7-6.1,6.1v90.7c0,3.4,2.7,6.1,6.1,6.1c3.4,0,6.1-2.7,6.1-6.1v-90.7  C260.6,371.9,257.9,369.1,254.5,369.1z"/></svg>`;

const BOOM_SVG = `<svg fill="#ff4444" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 29.529 29.53" xml:space="preserve"><g><g><path d="M14.077,13.43c-0.557,0.018-0.848,0.5-0.802,1.109c0.046,0.614,0.376,1.022,0.873,1.007c0.5-0.014,0.791-0.466,0.8-1.077    C14.954,13.906,14.646,13.414,14.077,13.43z"/><path d="M10.437,13.833c-0.553,0.106-0.764,0.629-0.622,1.223c0.142,0.599,0.536,0.949,1.025,0.854    c0.491-0.093,0.71-0.584,0.62-1.188C11.381,14.163,10.997,13.726,10.437,13.833z"/><path d="M7.413,15.94C7.329,15.971,7.245,16,7.162,16.033c0.103,0.276,0.206,0.552,0.309,0.83    c0.072-0.019,0.158-0.048,0.279-0.093c0.322-0.113,0.57-0.32,0.47-0.637C8.125,15.833,7.785,15.807,7.413,15.94z"/><path d="M29.529,16.508l-3.768-2.394l3.197-1.867L25.604,11.4l0.453-3.007l-4.062,1.903l-1.318-3.135l-2.285,2.976l-2.458-5.477    L14.069,9.89l-3.505-3.083L9.706,8.221l0.106,2.934L8.999,9.387L8.4,10.371L3.182,8.394l1.552,3.916L0,13.343l4.977,2.31    L1.939,18.19l3.069,0.387l-1.825,3.322l4.598-2.495l2.131,5.465l0.92-2.132l0.049-3.053l0.925,1.922l0.606-1.186l1.703,3.866    l0.587-3.522l2.866,3.426l1.294-4.163l1.038,0.562l0.363-1.051l1.342,1.971l1.418,0.764l0.611-2.844l3.373,2.024l-2.502-3.457    L29.529,16.508z M8.852,16.665c-0.178,0.244-0.522,0.454-1.131,0.678c-0.339,0.125-0.601,0.207-0.76,0.248    c-0.395-0.951-0.786-1.9-1.182-2.852c0.191-0.121,0.605-0.316,1.004-0.459c0.489-0.174,0.805-0.23,1.104-0.182    c0.283,0.035,0.52,0.19,0.596,0.463c0.078,0.271-0.028,0.569-0.367,0.813c0.001,0.002,0.002,0.006,0.002,0.01    c0.417-0.029,0.771,0.153,0.88,0.545C9.077,16.203,9.002,16.454,8.852,16.665z M10.907,16.471    c-0.923,0.182-1.648-0.336-1.895-1.199c-0.257-0.902,0.245-1.786,1.338-1.998c1.141-0.213,1.841,0.456,1.93,1.312    C12.384,15.615,11.823,16.295,10.907,16.471z M14.128,16.111c-0.941,0.032-1.57-0.595-1.676-1.486    c-0.109-0.932,0.521-1.724,1.63-1.758c1.152-0.03,1.738,0.739,1.69,1.601C15.714,15.499,15.053,16.081,14.128,16.111z     M18.749,16.438c0.063-0.396,0.124-0.793,0.185-1.189c0.057-0.374,0.129-0.825,0.215-1.275c-0.004,0-0.008-0.001-0.014-0.002    c-0.188,0.372-0.412,0.785-0.605,1.125c-0.209,0.377-0.407,0.76-0.602,1.144c-0.188-0.029-0.375-0.056-0.563-0.08    c-0.063-0.417-0.131-0.833-0.208-1.25c-0.071-0.378-0.145-0.835-0.189-1.252c-0.007,0-0.009,0-0.012,0    c-0.061,0.42-0.124,0.9-0.186,1.289c-0.055,0.396-0.11,0.788-0.166,1.183c-0.223-0.02-0.447-0.035-0.67-0.049    c0.127-1.042,0.264-2.082,0.413-3.122c0.371,0.024,0.742,0.058,1.112,0.1c0.08,0.361,0.155,0.723,0.228,1.084    c0.062,0.375,0.115,0.778,0.138,1.153c0.005,0,0.009,0,0.015,0.002c0.146-0.347,0.325-0.74,0.494-1.066    c0.18-0.323,0.366-0.645,0.557-0.964c0.36,0.063,0.721,0.135,1.078,0.216c-0.164,1.036-0.338,2.072-0.519,3.105    C19.217,16.535,18.982,16.483,18.749,16.438z M20.146,16.819c-0.238-0.064-0.367-0.284-0.309-0.523    c0.062-0.244,0.285-0.377,0.54-0.307c0.257,0.07,0.382,0.292,0.308,0.538C20.614,16.762,20.395,16.887,20.146,16.819z     M21.182,17.131c-0.237-0.076-0.354-0.303-0.283-0.539c0.074-0.242,0.306-0.361,0.56-0.277c0.253,0.084,0.362,0.312,0.276,0.553    C21.651,17.1,21.428,17.213,21.182,17.131z M22.738,17.258c-0.094,0.225-0.316,0.327-0.561,0.23    c-0.244-0.094-0.345-0.323-0.262-0.553c0.084-0.23,0.319-0.334,0.568-0.237C22.736,16.797,22.828,17.028,22.738,17.258z     M22.84,16.588c-0.18-0.072-0.361-0.144-0.541-0.209c0.209-0.675,0.416-1.348,0.619-2.023c0.277,0.102,0.555,0.21,0.83,0.324    C23.443,15.313,23.141,15.951,22.84,16.588z"/><path d="M7.726,14.887c-0.073-0.226-0.315-0.281-0.669-0.156c-0.171,0.062-0.265,0.107-0.328,0.141    c0.085,0.227,0.171,0.456,0.256,0.686c0.082-0.031,0.165-0.062,0.249-0.092C7.63,15.324,7.797,15.11,7.726,14.887z"/></g></g></svg>`;

const POWERUP_TYPES = {
  SPREAD: {
    emoji: "🌟",
    color: "#FFD700",
    label: "SPREAD SHOT",
    duration: 8000,
  },
  RAPIDFIRE: {
    emoji: "⚡",
    color: "#00BFFF",
    label: "RAPID FIRE",
    duration: 6000,
  },
  SHIELD: { emoji: "🛡️", color: "#7CFC00", label: "SHIELD", duration: 10000 },
  BOMB: { emoji: "💣", color: "#FF6347", label: "SMART BOMB", duration: 0 }, // instant
  EXTRALIFE: { emoji: "❤️", color: "#FF69B4", label: "+1 LIFE", duration: 0 }, // instant
};

const style = document.createElement("style");
style.textContent = `
@keyframes circle {
  0%   { transform: translate(5px, 0px); }
  25%  { transform: translate(0px, -5px); }
  50%  { transform: translate(-5px, 0px); }
  75%  { transform: translate(0px, 5px); }
  100% { transform: translate(5px, 0px); }
}
@keyframes upDown {
  0%   { transform: translate(0px, -5px); }
  100% { transform: translate(0px, 5px); }
}
@keyframes swing {
  0% {
    transform: rotate(-15deg);
  }
  100% {
    transform: rotate(15deg);
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes powerupFloat {
  0%   { transform: translateY(0px) scale(1); }
  50%  { transform: translateY(-6px) scale(1.1); }
  100% { transform: translateY(0px) scale(1); }
}
@keyframes powerupGlow {
  0%   { box-shadow: 0 0 8px 2px currentColor; }
  50%  { box-shadow: 0 0 20px 6px currentColor; }
  100% { box-shadow: 0 0 8px 2px currentColor; }
}
@keyframes comboFade {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes shieldPulse {
  0%   { opacity: 0.3; }
  50%  { opacity: 0.7; }
  100% { opacity: 0.3; }
}
@keyframes diveEnemy {
  0%   { filter: brightness(1); }
  50%  { filter: brightness(2) hue-rotate(60deg); }
  100% { filter: brightness(1); }
}
@keyframes screenShake {
  0%   { transform: translate(0,0); }
  20%  { transform: translate(-4px, 2px); }
  40%  { transform: translate(4px, -2px); }
  60%  { transform: translate(-3px, 3px); }
  80%  { transform: translate(3px, -1px); }
  100% { transform: translate(0,0); }
}
@keyframes particleFade {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}
@keyframes powerupLabelFade {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); }
  70%  { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
}
`;
document.head.appendChild(style);

export function create(_args, env) {
  const gameWrapper = document.createElement("div");
  applyStyle(gameWrapper, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    // backgroundColor: "#27272c",
    backgroundColor: env.STYLE.windowActiveHeader,
    position: "relative",
    overflow: "hidden",
    fontFamily: "monospace",
    cursor: "crosshair",
  });
  const gameArea = document.createElement("div");
  applyStyle(gameArea, {
    // border: `1px dashed ${env.STYLE.windowActiveHeaderText}`,
    // width: "100%",
    // height: "100%",
    position: "relative",
    overflow: "visible",
  });
  gameWrapper.appendChild(gameArea);

  let playerSvg;
  {
    const span = document.createElement("span");
    span.innerHTML = PLAYER_SVG;
    playerSvg = span.childNodes[0];
  }

  let boomSvg;
  {
    const span = document.createElement("span");
    span.innerHTML = BOOM_SVG;
    boomSvg = span.childNodes[0];
  }

  const enemyImages = {
    ufo: createImageFromSVG(UFO_SVG),
    alien1: createImageFromSVG(ALIEN1_SVG),
    alien2: createImageFromSVG(ALIEN2_SVG),
  };

  let gameState;
  let lastFrameTime;
  let animationId;
  let currentlyPressedKeys = {};
  let playerMouseX = null;
  let mousePressed = false;

  let config = {};
  resetGameState();

  const hud = document.createElement("div");
  applyStyle(hud, {
    position: "absolute",
    top: "10px",
    left: "10px",
    color: env.STYLE.windowActiveHeaderText,
    fontSize: Math.max(12, gameState.gameWidth * 0.025) + "px",
    zIndex: "1000",
    fontWeight: "bold",
  });
  gameArea.appendChild(hud);

  const powerupHud = document.createElement("div");
  applyStyle(powerupHud, {
    position: "absolute",
    top: "10px",
    right: "10px",
    color: env.STYLE.windowActiveHeaderText,
    fontSize: "12px",
    zIndex: "1000",
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  });
  gameArea.appendChild(powerupHud);

  const comboDisplay = document.createElement("div");
  applyStyle(comboDisplay, {
    position: "absolute",
    bottom: "0",
    left: "50%",
    transform: "translate(-50%, 0)",
    color: "#FFD700",
    fontSize: "16px",
    fontWeight: "bold",
    fontFamily: "monospace",
    zIndex: "1002",
    pointerEvents: "none",
    display: "none",
    textShadow: "0 0 10px #FFD700",
  });
  gameArea.appendChild(comboDisplay);

  // Player shield visual
  const shieldViz = document.createElement("div");
  applyStyle(shieldViz, {
    position: "absolute",
    borderRadius: "50%",
    border: "3px solid #7CFC00",
    pointerEvents: "none",
    zIndex: "11",
    display: "none",
    animation: "shieldPulse 1s infinite",
  });
  gameArea.appendChild(shieldViz);

  const playerElt = document.createElement("div");
  applyStyle(playerSvg, {
    position: "absolute",
    top: 0,
    color: env.STYLE.windowActiveHeaderText,
    // color: "#ffffff",
    width: (config.playerSize ?? 0) + "px",
    height: (config.playerSize ?? 0) + "px",
  });
  playerElt.appendChild(playerSvg);
  applyStyle(playerElt, {
    position: "absolute",
    width: config.playerSize + "px",
    height: config.playerSize + "px",
    zIndex: "10",
    userSelect: "none",
  });
  gameArea.appendChild(playerElt);

  const startScreen = document.createElement("div");
  applyStyle(startScreen, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: env.STYLE.windowActiveHeader,
    color: env.STYLE.windowActiveHeaderText,
    border: "1px solid #fff",
    fontSize: "24px",
    textAlign: "center",
    display: "none",
    zIndex: "1001",
    padding: "20px",
    borderRadius: "10px",
  });
  gameArea.appendChild(startScreen);

  const gameOverScreen = document.createElement("div");
  applyStyle(gameOverScreen, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: env.STYLE.windowActiveHeader,
    color: env.STYLE.windowActiveHeaderText,
    // border: "1px solid " + env.STYLE.windowActiveHeaderText,
    // backgroundColor: "#27272c",
    // color: "#fff",
    border: "1px solid #fff",
    fontSize: "24px",
    textAlign: "center",
    display: "none",
    zIndex: "1001",
    padding: "20px",
    borderRadius: "10px",
  });
  gameOverScreen.innerHTML =
    'GAME OVER<br><span style="font-size: 16px;">Press R or Click to restart</span>';
  gameArea.appendChild(gameOverScreen);

  const now = performance.now();
  lastFrameTime = now;
  tick(now);
  return {
    element: gameWrapper,
    onActivate,
    onDeactivate,
  };

  function resetGameState() {
    clearEnemies();
    clearShields();
    clearBullets();
    clearEnemyBullets();
    clearPowerups();
    clearParticles();
    clearDivers();
    gameState = {
      player: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        lives: 3,
        lastDamageTs: -Infinity,
      },
      bullets: [],
      enemies: [],
      enemyBullets: [],
      shields: [],
      powerups: [],
      particles: [],
      divers: [], // enemies that broke formation
      score: 0,
      started: false,
      gameOver: false,
      lastShot: 0,
      alienDirection: 1,
      ufoDirection: 1,
      gameWidth: 0,
      gameHeight: 0,
      level: 1,
      activePowerups: {
        SPREAD: 0,
        RAPIDFIRE: 0,
        SHIELD: 0,
      },
      combo: 0,
      lastKillTs: -Infinity,
      comboTimeout: null,
    };
    if (gameWrapper.offsetWidth > 0 && gameWrapper.offsetHeight > 0) {
      recheckGameStartupSize();
    }
  }

  function recheckGameStartupSize() {
    gameState.gameWidth = gameWrapper.offsetWidth;
    gameState.gameHeight = gameWrapper.offsetHeight;
    gameArea.style.height = gameWrapper.offsetHeight + "px";
    gameArea.style.width = gameWrapper.offsetWidth + "px";
    config = {
      playerSpeed: 0.008 * gameState.gameWidth,
      bulletSpeed: 0.015 * gameState.gameHeight,
      enemyBulletSpeed: 0.005 * gameState.gameHeight,
      enemyBaseSpeed: 0.002 * gameState.gameWidth,
      enemySuppSpeed: 0,
      enemyDropDistance: 0.05 * gameState.gameHeight,
      fireRate: 200,
      playerSize: Math.max(20, 0.04 * gameState.gameWidth),
      enemySize: Math.max(16, 0.035 * gameState.gameWidth),
      bulletSize: Math.max(20, 0.008 * gameState.gameWidth),
      playerBulletSize: Math.max(7, 0.008 * gameState.gameWidth),
      hudSize: Math.max(12, 0.025 * gameState.gameWidth),
      shieldSize: Math.max(50, 0.06 * gameState.gameWidth),
      powerupSize: Math.max(24, 0.04 * gameState.gameWidth),
      powerupSpeed: 0.003 * gameState.gameHeight,
      comboWindow: 700, // ms between kills to maintain combo
      diveSpeed: 0.008 * gameState.gameHeight,
    };
    applyStyle(playerSvg, {
      width: config.playerSize + "px",
      height: config.playerSize + "px",
    });
    applyStyle(boomSvg, {
      position: "absolute",
      top: 0,

      width: config.playerSize * 2 + "px",
      height: config.playerSize * 2 + "px",
      transform: `translate(-${config.playerSize / 2}px, -${config.playerSize / 2}px)`,
    });
    gameState.player.width = config.playerSize;
    gameState.player.height = config.playerSize;
    gameState.player.x = (gameState.gameWidth - gameState.player.width) / 2;
    gameState.player.y = gameState.gameHeight - gameState.player.height - 20;
    setupEnemies();
    setupShields();
  }

  function clearEnemies() {
    if (!gameState?.enemies) {
      return;
    }
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      gameState.enemies[i].element.remove();
    }
    gameState.enemies = [];
  }

  function clearShields() {
    if (!gameState?.shields) {
      return;
    }
    for (let i = gameState.shields.length - 1; i >= 0; i--) {
      gameState.shields[i].element.remove();
    }
    gameState.shields = [];
  }

  function clearBullets() {
    if (!gameState?.bullets) {
      return;
    }
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      gameState.bullets[i].element.remove();
    }
    gameState.bullets = [];
  }

  function clearEnemyBullets() {
    if (!gameState?.enemyBullets) {
      return;
    }
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
      gameState.enemyBullets[i].element.remove();
    }
    gameState.enemyBullets = [];
  }
  function clearPowerups() {
    if (!gameState?.powerups) {
      return;
    }
    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
      gameState.powerups[i].element.remove();
    }
    gameState.powerups = [];
  }
  function clearParticles() {
    if (!gameState?.particles) {
      return;
    }
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
      gameState.particles[i].element.remove();
    }
    gameState.particles = [];
  }
  function clearDivers() {
    if (!gameState?.divers) {
      return;
    }
    for (let i = gameState.divers.length - 1; i >= 0; i--) {
      gameState.divers[i].element.remove();
    }
    gameState.divers = [];
  }

  function setupEnemies() {
    clearEnemies();
    clearDivers();
    let rows;
    let cols;
    switch (gameState.level) {
      case 1:
        rows = 3;
        cols = 8;
        break;
      // case 2:
      //   rows = 3;
      //   cols = 9;
      //   break;
      default:
        rows = 4;
        cols = 8;
        break;
    }
    const enemySize = config.enemySize || 25;
    const spacing = enemySize * 1.4;
    const totalWidth = cols * spacing;
    const startX = (gameState.gameWidth - totalWidth) / 2;
    const startY = gameState.gameHeight * 0.1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isUfo = row === rows - 1;
        const enemy = {
          row,
          col,
          isUfo,
          speed: config.enemyBaseSpeed * (isUfo ? 2 : 1),
          x: startX + col * spacing,
          y: startY + row * spacing,
          width: enemySize,
          height: enemySize,
        };
        const enemyElt = document.createElement("div");
        enemyElt.dataset.type = "enemy";
        let img;
        if (isUfo) {
          img = enemyImages.ufo.cloneNode();
        } else if (row === rows - 2) {
          img = enemyImages.alien2.cloneNode();
        } else {
          img = enemyImages.alien1.cloneNode();
        }
        applyStyle(img, {
          height: enemySize + "px",
          width: enemySize + "px",
        });
        enemyElt.appendChild(img);
        applyStyle(enemyElt, {
          position: "absolute",
          left: enemy.x + "px",
          top: enemy.y + "px",
          fontSize: config.enemySize + "px",
          userSelect: "none",
        });
        if (row === 2) {
          enemyElt.style.animation = "swing 2s ease-in-out infinite alternate";
          enemyElt.transformOrigin = "top center";
        } else if (row === 3) {
          enemyElt.style.animation = "circle 3s infinite linear";
        } else {
          enemyElt.style.animation = "upDown 2s infinite alternate";
        }
        gameArea.appendChild(enemyElt);
        enemy.element = enemyElt;
        gameState.enemies.push(enemy);
      }
    }
  }

  function setupShields() {
    clearShields();
    for (let i = gameArea.children.length - 1; i >= 0; i--) {
      const child = gameArea.children[i];
      if (child.dataset.type === "shield") {
        gameArea.removeChild(child);
      }
    }

    const numShields = 4;
    const shieldSize = config.shieldSize || 40;
    const totalWidth = numShields * shieldSize * 2;
    const startX = (gameState.gameWidth - totalWidth) / 4;
    const shieldY = gameState.gameHeight * 0.75;
    const pattern = [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 0, 0, 1],
    ];
    const blockSize = shieldSize / 6;
    for (let i = 0; i < numShields; i++) {
      const baseX = startX + i * (shieldSize * 4);
      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          if (pattern[row][col] === 1) {
            const shield = {
              row,
              col,
              x: baseX + col * blockSize,
              y: shieldY + row * blockSize,
              width: blockSize,
              height: blockSize,
              // health: 3,
            };
            const shieldElt = document.createElement("div");
            shieldElt.dataset.type = "shield";
            // shieldElt.textContent = "🛡️";
            // shieldElt.textContent = "⬜";
            // shieldElt.textContent = "◻️";
            applyStyle(shieldElt, {
              position: "absolute",
              left: shield.x + "px",
              top: shield.y + "px",
              height: shield.height + "px",
              width: shield.width + "px",
              // background: env.STYLE.windowActiveHeaderText,
              opacity: "0.7",
              background: `linear-gradient(to top left, ${env.STYLE.windowActiveHeaderText}, #ccc 99%)`,
              // background: `radial-gradient(${env.STYLE.windowActiveHeaderText}, ${env.STYLE.windowActiveHeader} 80%)`,
              // fontSize: shield.width + "px",
              userSelect: "none",
            });
            gameArea.appendChild(shieldElt);
            shield.element = shieldElt;
            gameState.shields.push(shield);
          }
        }
      }
    }
  }

  function shoot() {
    if (!gameState.started || gameState.gameOver) {
      return;
    }
    const now = performance.now();
    const effectiveFireRate =
      gameState.activePowerups.RAPIDFIRE > now
        ? config.fireRate * 0.3
        : config.fireRate;

    if (now - gameState.lastShot > effectiveFireRate) {
      const spread = gameState.activePowerups.SPREAD > now;
      const angles = spread ? [-18, 0, 18] : [0];
      for (const angleDeg of angles) {
        const angleRad = (angleDeg * Math.PI) / 180;
        const playerBulletSize = config.playerBulletSize;
        const bullet = {
          x:
            gameState.player.x +
            gameState.player.width / 2 -
            playerBulletSize / 2,
          y: gameState.player.y,
          width: playerBulletSize,
          height: playerBulletSize,
          vx: Math.sin(angleRad) * config.bulletSpeed,
          vy: -Math.cos(angleRad) * config.bulletSpeed,
        };
        const bulletElt = document.createElement("div");
        bulletElt.dataset.type = "bullet";
        // bulletElt.textContent = PLAYER_PROJECTILE_CHAR;
        applyStyle(bulletElt, {
          position: "absolute",
          left: bullet.x + "px",
          top: bullet.y + "px",
          width: bullet.width + "px",
          height: bullet.height + "px",
          fontSize: config.playerBulletSize + "px",
          // transformOrigin: "center center",
          // animation: "spin 1s infinite linear",
          borderRadius: config.playerBulletSize + "px",
          backgroundColor: spread
            ? "#FFD700"
            : env.STYLE.windowActiveHeaderText,
          userSelect: "none",
        });
        gameArea.appendChild(bulletElt);
        bullet.element = bulletElt;
        gameState.bullets.push(bullet);
      }
      gameState.lastShot = now;
    }
  }

  function triggerBomb() {
    // Kill the 5 lowest enemies and all divers
    const sorted = [...gameState.enemies].sort((a, b) => b.y - a.y).slice(0, 5);
    for (const enemy of sorted) {
      spawnParticles(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        "#FF6347",
      );
      enemy.element.remove();
      gameState.enemies.splice(gameState.enemies.indexOf(enemy), 1);
      gameState.score += 10;
      config.enemySuppSpeed += 0.00015 * gameState.gameWidth;
    }
    for (const diver of [...gameState.divers]) {
      spawnParticles(
        diver.x + diver.width / 2,
        diver.y + diver.height / 2,
        "#FF6347",
      );
      diver.element.remove();
      gameState.divers.splice(gameState.divers.indexOf(diver), 1);
      gameState.score += 10;
    }
    // Screen flash
    const flash = document.createElement("div");
    applyStyle(flash, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255,99,71,0.4)",
      zIndex: "999",
      pointerEvents: "none",
    });
    gameArea.appendChild(flash);
    setTimeout(() => flash.remove(), 200);
  }

  function spawnParticles(cx, cy, color) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = (Math.random() * 2 + 1) * config.playerSize * 0.06;
      const particle = {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.04 + Math.random() * 0.04,
        size: Math.max(3, config.playerSize * 0.08),
      };
      const elt = document.createElement("div");
      applyStyle(elt, {
        position: "absolute",
        left: particle.x + "px",
        top: particle.y + "px",
        width: particle.size + "px",
        height: particle.size + "px",
        borderRadius: "50%",
        backgroundColor: color,
        pointerEvents: "none",
        zIndex: "500",
      });
      gameArea.appendChild(elt);
      particle.element = elt;
      gameState.particles.push(particle);
    }
  }

  function updateParticles() {
    gameState.particles = gameState.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        p.element.remove();
        return false;
      }
      p.element.style.left = p.x + "px";
      p.element.style.top = p.y + "px";
      p.element.style.opacity = p.life;
      return true;
    });
  }

  function triggerScreenShake() {
    gameArea.style.animation = "none";
    void gameArea.offsetWidth; // force reflow
    gameArea.style.animation = "screenShake 0.3s ease-out";
    setTimeout(() => {
      gameArea.style.animation = "none";
    }, 300);
  }

  function trySpawnPowerup(x, y) {
    if (Math.random() > 0.18) {
      return; // 18% chance
    }
    const keys = Object.keys(POWERUP_TYPES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    const def = POWERUP_TYPES[type];
    const size = config.powerupSize;
    const powerup = {
      x,
      y,
      width: size,
      height: size,
      type,
      def,
    };
    const elt = document.createElement("div");
    applyStyle(elt, {
      position: "absolute",
      left: x + "px",
      top: y + "px",
      width: size + "px",
      height: size + "px",
      fontSize: size * 0.7 + "px",
      lineHeight: size + "px",
      textAlign: "center",
      borderRadius: "50%",
      border: `2px solid ${def.color}`,
      color: def.color,
      backgroundColor: "rgba(0,0,0,0.5)",
      userSelect: "none",
      zIndex: "50",
      animation: "powerupFloat 1.5s infinite ease-in-out",
      cursor: "default",
    });
    elt.textContent = def.emoji;
    gameArea.appendChild(elt);
    powerup.element = elt;
    gameState.powerups.push(powerup);
  }

  function updatePowerups() {
    gameState.powerups = gameState.powerups.filter((p) => {
      p.y += config.powerupSpeed;
      if (p.y > gameState.gameHeight + p.height) {
        p.element.remove();
        return false;
      }
      p.element.style.left = p.x + "px";
      p.element.style.top = p.y + "px";

      // Collect
      if (
        p.x < gameState.player.x + gameState.player.width &&
        p.x + p.width > gameState.player.x &&
        p.y < gameState.player.y + gameState.player.height &&
        p.y + p.height > gameState.player.y
      ) {
        activatePowerup(p.type, p.def);
        p.element.remove();
        return false;
      }
      return true;
    });
  }

  function activatePowerup(type, def) {
    const now = performance.now();
    showPowerupLabel(def.label, def.color);

    if (type === "BOMB") {
      triggerBomb();
    } else if (type === "EXTRALIFE") {
      gameState.player.lives = Math.min(gameState.player.lives + 1, 5);
    } else {
      // timed powerup
      gameState.activePowerups[type] = now + def.duration;
    }
  }

  function showPowerupLabel(label, color) {
    const lbl = document.createElement("div");
    lbl.className = "power-up-label";
    applyStyle(lbl, {
      position: "absolute",
      left: "50%",
      top: "60%",
      transform: "translateX(-50%)",
      color,
      fontFamily: "monospace",
      fontWeight: "bold",
      fontSize: config.hudSize * 1.4 + "px",
      zIndex: "1003",
      pointerEvents: "none",
      textShadow: `0 0 8px ${color}`,
      animation: "powerupLabelFade 1.5s forwards",
      backgroundColor: "rgba(0,0,0,0.3)",
      padding: "20px",
      borderRadius: "30px",
      whiteSpace: "nowrap",
    });
    lbl.textContent = "✦ " + label + " ✦";
    const allPreviousLabels = gameArea.getElementsByClassName("power-up-label");
    for (let i = allPreviousLabels.length - 1; i >= 0; i--) {
      try {
        allPreviousLabels[i].parentElement.removeChild(allPreviousLabels[i]);
      } catch (_) {}
    }
    gameArea.appendChild(lbl);
    setTimeout(() => lbl.remove(), 1500);
  }

  function registerKill() {
    const now = performance.now();
    if (now - gameState.lastKillTs < config.comboWindow) {
      gameState.combo++;
    } else {
      gameState.combo = 1;
    }
    gameState.lastKillTs = now;

    const multiplier = Math.floor(gameState.combo / 3) + 1;
    if (gameState.combo >= 3) {
      showCombo(gameState.combo, multiplier);
    }
    return multiplier;
  }

  function showCombo(count, multiplier) {
    comboDisplay.style.display = "block";
    comboDisplay.textContent = `${count}x COMBO! ×${multiplier}`;
    comboDisplay.style.animation = "none";
    void comboDisplay.offsetWidth;
    comboDisplay.style.animation = "comboFade 2s forwards";
  }

  function trySpawnDiver() {
    if (gameState.enemies.length === 0) return;
    // Scale chance with level
    const chance =
      (0.0003 + (gameState.level - 1) * 0.0002) * gameState.enemies.length;
    if (Math.random() > chance) return;

    const idx = Math.floor(Math.random() * gameState.enemies.length);
    const source = gameState.enemies[idx];
    gameState.enemies.splice(idx, 1);

    const diver = {
      x: source.x,
      y: source.y,
      width: source.width,
      height: source.height,
      element: source.element,
      targetX: gameState.player.x + gameState.player.width / 2,
      speed: config.diveSpeed,
    };
    diver.element.style.animation = "diveEnemy 0.4s infinite";
    gameState.divers.push(diver);
  }

  function updateDivers() {
    gameState.divers = gameState.divers.filter((diver) => {
      // Steer toward player X
      const px = gameState.player.x + gameState.player.width / 2;
      const dx = px - (diver.x + diver.width / 2);
      const dist = Math.abs(dx);
      const steer = Math.min(dist, config.playerSpeed * 0.5) * Math.sign(dx);
      diver.x += steer;
      diver.y += diver.speed;

      diver.element.style.left = diver.x + "px";
      diver.element.style.top = diver.y + "px";

      // Off screen
      if (diver.y > gameState.gameHeight + diver.height) {
        diver.element.remove();
        return false;
      }

      // Hit player
      if (
        diver.x < gameState.player.x + gameState.player.width &&
        diver.x + diver.width > gameState.player.x &&
        diver.y < gameState.player.y + gameState.player.height &&
        diver.y + diver.height > gameState.player.y
      ) {
        const now = performance.now();
        if (now - gameState.player.lastDamageTs > 600) {
          if (gameState.activePowerups.SHIELD > now) {
            // Shield absorbs it
            gameState.activePowerups.SHIELD = 0;
            showPowerupLabel("SHIELD BROKEN!", "#FF6347");
          } else {
            gameState.player.lives--;
            gameState.player.lastDamageTs = now;
            triggerScreenShake();
            if (gameState.player.lives <= 0) gameState.gameOver = true;
          }
        }
        spawnParticles(
          diver.x + diver.width / 2,
          diver.y + diver.height / 2,
          "#FF4500",
        );
        diver.element.remove();
        return false;
      }
      return true;
    });
  }

  function updatePlayer() {
    if (LEFT_KEYS.some((k) => currentlyPressedKeys[k])) {
      gameState.player.x = Math.max(0, gameState.player.x - config.playerSpeed);
    }
    if (RIGHT_KEYS.some((k) => currentlyPressedKeys[k])) {
      gameState.player.x = Math.min(
        gameState.gameWidth - gameState.player.width,
        gameState.player.x + config.playerSpeed,
      );
    }

    if (playerMouseX !== null) {
      const targetX = playerMouseX - gameState.player.width / 2;
      const diff = targetX - gameState.player.x;
      const moveSpeed = Math.min(Math.abs(diff), config.playerSpeed * 2);
      if (Math.abs(diff) > 2) {
        gameState.player.x += diff > 0 ? moveSpeed : -moveSpeed;
      } else {
        gameState.player.x = targetX;
      }
    }
    // Autofire when mouse held
    if (mousePressed) {
      shoot();
    }
  }

  function updateBullets() {
    gameState.bullets = gameState.bullets.filter((bullet) => {
      bullet.x += bullet.vx || 0;
      bullet.y -= bullet.vy !== undefined ? -bullet.vy : config.bulletSpeed;
      if (
        bullet.y <= -bullet.height ||
        bullet.x < -bullet.width ||
        bullet.x > gameState.gameWidth + bullet.width
      ) {
        bullet.element.remove();
        return false;
      }
      return true;
    });

    gameState.enemyBullets = gameState.enemyBullets.filter((bullet) => {
      bullet.y += config.enemyBulletSpeed;
      if (bullet.y >= gameState.gameHeight + bullet.height) {
        bullet.element.remove();
        return false;
      }
      return true;
    });
  }

  function updateEnemies() {
    if (gameState.enemies.length === 0 && gameState.divers.length === 0) {
      gameState.level++;
      clearEnemyBullets();
      clearBullets();
      setupEnemies();
      config.enemyBaseSpeed += 0.3;
      config.enemySuppSpeed = 0;
      config.enemyBulletSpeed *= 1.1;
      return;
    }

    let shouldDropAlien = false;
    let shouldDropUfo = false;

    for (let enemy of gameState.enemies) {
      const dir = enemy.isUfo
        ? gameState.ufoDirection
        : gameState.alienDirection;
      if (
        (enemy.x <= 0 && dir === -1) ||
        (enemy.x >= gameState.gameWidth - enemy.width && dir === 1)
      ) {
        if (enemy.isUfo) {
          shouldDropUfo = true;
        } else {
          shouldDropAlien = true;
        }
      }
    }

    if (shouldDropAlien) {
      gameState.alienDirection *= -1;
      gameState.enemies.forEach((enemy) => {
        if (!enemy.isUfo) {
          enemy.y += config.enemyDropDistance;
        }
      });
    } else {
      gameState.enemies.forEach((enemy) => {
        if (!enemy.isUfo) {
          enemy.x +=
            (enemy.speed + config.enemySuppSpeed) * gameState.alienDirection;
        }
      });
    }

    if (shouldDropUfo) {
      gameState.ufoDirection *= -1;
      gameState.enemies.forEach((enemy) => {
        if (enemy.isUfo) {
          enemy.y += config.enemyDropDistance;
        }
      });
    } else {
      gameState.enemies.forEach((enemy) => {
        if (enemy.isUfo) {
          enemy.x +=
            (enemy.speed + config.enemySuppSpeed) * gameState.ufoDirection;
        }
      });
    }

    // Enemy shooting — rate scales with level
    const shootChance =
      (0.001 + Math.max(gameState.level - 2, 0) * 0.0015) *
      gameState.enemies.length;
    if (Math.random() < shootChance) {
      const shooter =
        gameState.enemies[Math.floor(Math.random() * gameState.enemies.length)];
      const bulletSize = config.bulletSize;
      const bullet = {
        x: shooter.x + shooter.width / 2 - bulletSize / 2,
        y: shooter.y + shooter.height,
        width: bulletSize,
        height: bulletSize,
      };
      const bulletElt = document.createElement("div");
      bulletElt.dataset.type = "enemy-bullet";
      bulletElt.textContent = ALIEN_PROJECTILE_CHAR;
      // const actualSize = config.bulletSize * 2;
      applyStyle(bulletElt, {
        position: "absolute",
        left: bullet.x + "px",
        top: bullet.y + "px",
        fontSize: config.bulletSize + "px",
        // transform: `translate(${config.bulletSize - actualSize}px, ${config.bulletSize - actualSize}px)`,
        width: bullet.width + "px",
        height: bullet.height + "px",
        transformOrigin: "center center",
        animation: "spin 3s infinite linear",
        // backgroundColor: "red",
        // borderRadius: `0px 0px ${bulletSize}px ${bulletSize}px`,
        // border: "1px solid " + env.STYLE.windowActiveHeaderText,
        userSelect: "none",
      });
      gameArea.appendChild(bulletElt);
      bullet.element = bulletElt;
      gameState.enemyBullets.push(bullet);
    }

    // Dive bomb attempt
    trySpawnDiver();
  }

  function checkCollisions() {
    const now = performance.now();
    const shielded = gameState.activePowerups.SHIELD > now;

    // Player bullets vs enemies & shields
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = gameState.bullets[i];
      let hit = false;

      for (let j = gameState.enemies.length - 1; j >= 0; j--) {
        const enemy = gameState.enemies[j];
        if (rectsOverlap(bullet, enemy)) {
          bullet.element.remove();
          gameState.bullets.splice(i, 1);
          spawnParticles(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            "#FFD700",
          );
          trySpawnPowerup(
            enemy.x + enemy.width / 2 - config.powerupSize / 2,
            enemy.y,
          );
          enemy.element.remove();
          gameState.enemies.splice(j, 1);
          config.enemySuppSpeed += 0.00015 * gameState.gameWidth;
          const mult = registerKill();
          gameState.score += 10 * mult;
          hit = true;
          break;
        }
      }

      if (!hit) {
        // vs divers
        for (let j = gameState.divers.length - 1; j >= 0; j--) {
          const diver = gameState.divers[j];
          if (rectsOverlap(bullet, diver)) {
            bullet.element.remove();
            gameState.bullets.splice(i, 1);
            spawnParticles(
              diver.x + diver.width / 2,
              diver.y + diver.height / 2,
              "#FF4500",
            );
            diver.element.remove();
            gameState.divers.splice(j, 1);
            const mult = registerKill();
            gameState.score += 20 * mult; // bonus for diver
            hit = true;
            break;
          }
        }
      }

      if (!hit) {
        for (let k = gameState.shields.length - 1; k >= 0; k--) {
          const shield = gameState.shields[k];
          if (rectsOverlap(bullet, shield)) {
            bullet.element.remove();
            gameState.bullets.splice(i, 1);
            shield.element.remove();
            gameState.shields.splice(k, 1);
            break;
          }
        }
      }
    }

    // Enemy bullets vs player & shields
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = gameState.enemyBullets[i];
      let hit = false;

      if (rectsOverlap(bullet, gameState.player)) {
        if (now - gameState.player.lastDamageTs > 600) {
          bullet.element.remove();
          gameState.enemyBullets.splice(i, 1);
          if (shielded) {
            gameState.activePowerups.SHIELD = 0;
            showPowerupLabel("SHIELD BROKEN!", "#FF6347");
          } else {
            gameState.player.lives--;
            gameState.player.lastDamageTs = now;
            triggerScreenShake();
            if (gameState.player.lives <= 0) gameState.gameOver = true;
          }
          hit = true;
        }
      }

      if (!hit) {
        for (let k = gameState.shields.length - 1; k >= 0; k--) {
          const shield = gameState.shields[k];
          if (rectsOverlap(bullet, shield)) {
            bullet.element.remove();
            gameState.enemyBullets.splice(i, 1);
            shield.element.remove();
            gameState.shields.splice(k, 1);
            break;
          }
        }
      }
    }

    // Enemy formation touching player or bottom
    for (let enemy of gameState.enemies) {
      if (rectsOverlap(enemy, gameState.player)) {
        gameState.gameOver = true;
      }

      if (enemy.y + enemy.height >= gameState.gameHeight - 50) {
        gameState.gameOver = true;
      }
    }
  }

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function render() {
    applyStyle(playerElt, {
      left: gameState.player.x + "px",
      top: gameState.player.y + "px",
    });
    gameState.enemies.forEach((enemy) => {
      applyStyle(enemy.element, {
        left: enemy.x + "px",
        top: enemy.y + "px",
      });
    });
    gameState.shields.forEach((shield) => {
      // if (shield.health === 3) {
      //   shield.element.textContent = "🟩"; // Full health - green
      // } else if (shield.health === 2) {
      //   shield.element.textContent = "🟨"; // Damaged - yellow
      // } else {
      //   shield.element.textContent = "🟥"; // Very damaged - red
      // }
      applyStyle(shield.element, {
        left: shield.x + "px",
        top: shield.y + "px",
      });
    });
    gameState.bullets.forEach((bullet) => {
      applyStyle(bullet.element, {
        left: bullet.x + "px",
        top: bullet.y + "px",
      });
    });
    gameState.enemyBullets.forEach((bullet) => {
      applyStyle(bullet.element, {
        left: bullet.x + "px",
        top: bullet.y + "px",
      });
    });

    // Shield visualizer
    const now = performance.now();
    if (gameState.activePowerups.SHIELD > now) {
      const pad = config.playerSize * 0.3;
      applyStyle(shieldViz, {
        display: "block",
        left: gameState.player.x - pad + "px",
        top: gameState.player.y - pad + "px",
        width: gameState.player.width + pad * 2 + "px",
        height: gameState.player.height + pad * 2 + "px",
      });
    } else {
      shieldViz.style.display = "none";
    }

    // Damage flash
    const deltaDmg = now - gameState.player.lastDamageTs;
    if (deltaDmg < 500) {
      playerElt.innerHTML = "";
      playerElt.appendChild(boomSvg);
      boomSvg.style.transform = `scale(${Math.min(deltaDmg / 250, 1)}) translate(0px, -${config.playerSize / 2}px)`;
    } else if (!gameState.gameOver) {
      playerElt.innerHTML = "";
      playerElt.appendChild(playerSvg);
    }

    // HUD
    if (gameState.gameWidth === 0 || gameState.gameHeight === 0) {
      hud.style.display = "none";
    } else {
      hud.style.display = "block";
      const hearts = "❤️".repeat(gameState.player.lives);
      hud.textContent = `SCORE: ${gameState.score} | ${hearts} | LVL: ${gameState.level}`;
      hud.style.fontSize = config.hudSize + "px";
    }

    // Active power-up strip
    powerupHud.innerHTML = "";
    const nowTs = performance.now();
    for (const [type, expiry] of Object.entries(gameState.activePowerups)) {
      if (expiry > nowTs) {
        const def = POWERUP_TYPES[type];
        const remaining = ((expiry - nowTs) / 1000).toFixed(1);
        const bar = document.createElement("div");
        applyStyle(bar, {
          color: def.color,
          fontSize: config.hudSize + "px",
          textShadow: `0 0 6px ${def.color}`,
          fontWeight: "bold",
        });
        bar.textContent = `${def.emoji} ${def.label} ${remaining}s`;
        powerupHud.appendChild(bar);
      }
    }

    if (gameState.gameOver) {
      clearAllBullets();
      gameOverScreen.style.display = "block";
      gameOverScreen.style.fontSize = config.hudSize * 1.5 + "px";
      gameOverScreen.innerHTML = `GAME OVER<br>FINAL SCORE: ${gameState.score}<br><span style="font-size: ${config.hudSize}px;">Press R or Click to restart</span>`;
    } else {
      if (!gameState.started) {
        if (gameState.gameWidth === 0 || gameState.gameHeight === 0) {
          startScreen.style.display = "none";
        } else {
          startScreen.style.display = "block";
          startScreen.style.fontSize = config.hudSize * 1.5 + "px";
          startScreen.innerHTML = `Invaders!<br><span style="font-size: ${config.hudSize}px;">Press Space or Click to Start</span>`;
        }
      } else {
        startScreen.style.display = "none";
      }
      gameOverScreen.style.display = "none";
    }
  }

  function clearAllBullets() {
    gameState.bullets.forEach((b) => b.element.remove());
    gameState.bullets.length = 0;
    gameState.enemyBullets.forEach((b) => b.element.remove());
    gameState.enemyBullets.length = 0;
  }

  function tick(currentTime) {
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime + 0.1 >= FRAME_DURATION) {
      updateGame();

      lastFrameTime = currentTime - (deltaTime % FRAME_DURATION);
    }
    animationId = window.requestAnimationFrame(tick);
  }

  function updateGame() {
    if (!gameState.started) {
      if (
        gameState.gameWidth !== gameWrapper.offsetWidth ||
        gameState.gameHeight !== gameWrapper.offsetHeight
      ) {
        recheckGameStartupSize();
      }
    } else if (
      gameState.gameWidth > gameWrapper.offsetWidth ||
      gameState.gameHeight > gameWrapper.offsetHeight
    ) {
      resetGameState();
    } else if (!gameState.gameOver) {
      updatePlayer();
      updateBullets();
      updateEnemies();
      updateDivers();
      updatePowerups();
      updateParticles();
      checkCollisions();
    }

    render();
  }

  function restartGame() {
    resetGameState();
  }

  function onActivate() {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    gameWrapper.addEventListener("mousemove", onMouseMove, { passive: false });
    gameWrapper.addEventListener("touchmove", onMouseMove, { passive: false });
    gameWrapper.addEventListener("mousedown", onMouseDown);
    gameWrapper.addEventListener("mouseup", onMouseUp);
    gameWrapper.addEventListener("click", onClick);
    cancelAnimationFrame(animationId);
    const now = performance.now();
    lastFrameTime = now;
    tick(now);
  }

  function onDeactivate() {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    gameWrapper.removeEventListener("mousemove", onMouseMove);
    gameWrapper.removeEventListener("touchmove", onMouseMove);
    gameWrapper.removeEventListener("mousedown", onMouseDown);
    gameWrapper.removeEventListener("mouseup", onMouseUp);
    gameWrapper.removeEventListener("click", onClick);
    cancelAnimationFrame(animationId);
    animationId = null;
    //
    // if (resizeObserver) {
    //   resizeObserver.disconnect();
    // }
  }

  function onKeyDown(e) {
    const keyPressed = e.key.toLowerCase();
    currentlyPressedKeys[keyPressed] = true;

    if (LEFT_KEYS.includes(keyPressed) || RIGHT_KEYS.includes(keyPressed)) {
      playerMouseX = null;
    }

    if (keyPressed === " ") {
      e.preventDefault();
      if (!gameState.started) {
        gameState.started = true;
      } else {
        shoot();
      }
    }

    if (keyPressed === "r") {
      restartGame();
    }
  }

  function onKeyUp(e) {
    currentlyPressedKeys[e.key.toLowerCase()] = false;
  }

  function onMouseMove(e) {
    if (!gameState.started || gameState.gameOver) {
      return;
    }
    let clientX;
    if (e.touches?.length) {
      if (e.touches.length > 1) {
        return;
      }
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const rect = gameArea.getBoundingClientRect();
    playerMouseX = clientX - rect.left;
    if (playerMouseX < 0) {
      playerMouseX = 0;
    }
    if (playerMouseX > rect.width) {
      playerMouseX = rect.width;
    }
  }

  function onMouseDown(e) {
    e.preventDefault();
    mousePressed = true;
    shoot();
  }

  function onMouseUp() {
    mousePressed = false;
  }

  function onClick() {
    if (gameState.gameOver) {
      restartGame();
      gameState.started = true;
    } else if (!gameState.started) {
      gameState.started = true;
    }
  }
}

function createImageFromSVG(svgString) {
  const url = URL.createObjectURL(
    new Blob([svgString], { type: "image/svg+xml" }),
  );
  const img = new Image();
  img.src = url;
  return img;
}

/**
 * Apply multiple style attributes on a given element.
 * @param {HTMLElement} element - The `HTMLElement` on which the style should be
 * aplied.
 * @param {Object} style - The dictionnary where keys are style names (JSified,
 * e.g. `backgroundColor` not `background-color`) and values are the
 * corresponding syle values.
 */
function applyStyle(element, style) {
  for (const key of Object.keys(style)) {
    element.style[key] = style[key];
  }
}
