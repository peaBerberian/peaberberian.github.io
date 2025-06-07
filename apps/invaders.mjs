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
const PLAYER_SVG = `<svg height="800px" width="800px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g><path class="st0" fill="currentColor" d="M511.06,286.261c-0.387-10.849-7.42-20.615-18.226-25.356l-193.947-74.094   C298.658,78.15,285.367,3.228,256.001,3.228c-29.366,0-42.657,74.922-42.885,183.583L19.167,260.904   C8.345,265.646,1.33,275.412,0.941,286.261L0.008,311.97c-0.142,3.886,1.657,7.623,4.917,10.188   c3.261,2.564,7.597,3.684,11.845,3.049c0,0,151.678-22.359,198.037-29.559c1.85,82.016,4.019,127.626,4.019,127.626l-51.312,24.166   c-6.046,2.38-10.012,8.206-10.012,14.701v9.465c0,4.346,1.781,8.505,4.954,11.493c3.155,2.987,7.403,4.539,11.74,4.292l64.83-3.667   c2.08,14.436,8.884,25.048,16.975,25.048c8.091,0,14.877-10.612,16.975-25.048l64.832,3.667c4.336,0.246,8.584-1.305,11.738-4.292   c3.174-2.988,4.954-7.148,4.954-11.493v-9.465c0-6.495-3.966-12.321-10.012-14.701l-51.329-24.166c0,0,2.186-45.61,4.037-127.626   c46.358,7.2,198.036,29.559,198.036,29.559c4.248,0.635,8.602-0.485,11.845-3.049c3.261-2.565,5.041-6.302,4.918-10.188   L511.06,286.261z"/></g></svg>`;

const BOOM_SVG = `<svg fill="#ff4444" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 29.529 29.53" xml:space="preserve"><g><g><path d="M14.077,13.43c-0.557,0.018-0.848,0.5-0.802,1.109c0.046,0.614,0.376,1.022,0.873,1.007c0.5-0.014,0.791-0.466,0.8-1.077    C14.954,13.906,14.646,13.414,14.077,13.43z"/><path d="M10.437,13.833c-0.553,0.106-0.764,0.629-0.622,1.223c0.142,0.599,0.536,0.949,1.025,0.854    c0.491-0.093,0.71-0.584,0.62-1.188C11.381,14.163,10.997,13.726,10.437,13.833z"/><path d="M7.413,15.94C7.329,15.971,7.245,16,7.162,16.033c0.103,0.276,0.206,0.552,0.309,0.83    c0.072-0.019,0.158-0.048,0.279-0.093c0.322-0.113,0.57-0.32,0.47-0.637C8.125,15.833,7.785,15.807,7.413,15.94z"/><path d="M29.529,16.508l-3.768-2.394l3.197-1.867L25.604,11.4l0.453-3.007l-4.062,1.903l-1.318-3.135l-2.285,2.976l-2.458-5.477    L14.069,9.89l-3.505-3.083L9.706,8.221l0.106,2.934L8.999,9.387L8.4,10.371L3.182,8.394l1.552,3.916L0,13.343l4.977,2.31    L1.939,18.19l3.069,0.387l-1.825,3.322l4.598-2.495l2.131,5.465l0.92-2.132l0.049-3.053l0.925,1.922l0.606-1.186l1.703,3.866    l0.587-3.522l2.866,3.426l1.294-4.163l1.038,0.562l0.363-1.051l1.342,1.971l1.418,0.764l0.611-2.844l3.373,2.024l-2.502-3.457    L29.529,16.508z M8.852,16.665c-0.178,0.244-0.522,0.454-1.131,0.678c-0.339,0.125-0.601,0.207-0.76,0.248    c-0.395-0.951-0.786-1.9-1.182-2.852c0.191-0.121,0.605-0.316,1.004-0.459c0.489-0.174,0.805-0.23,1.104-0.182    c0.283,0.035,0.52,0.19,0.596,0.463c0.078,0.271-0.028,0.569-0.367,0.813c0.001,0.002,0.002,0.006,0.002,0.01    c0.417-0.029,0.771,0.153,0.88,0.545C9.077,16.203,9.002,16.454,8.852,16.665z M10.907,16.471    c-0.923,0.182-1.648-0.336-1.895-1.199c-0.257-0.902,0.245-1.786,1.338-1.998c1.141-0.213,1.841,0.456,1.93,1.312    C12.384,15.615,11.823,16.295,10.907,16.471z M14.128,16.111c-0.941,0.032-1.57-0.595-1.676-1.486    c-0.109-0.932,0.521-1.724,1.63-1.758c1.152-0.03,1.738,0.739,1.69,1.601C15.714,15.499,15.053,16.081,14.128,16.111z     M18.749,16.438c0.063-0.396,0.124-0.793,0.185-1.189c0.057-0.374,0.129-0.825,0.215-1.275c-0.004,0-0.008-0.001-0.014-0.002    c-0.188,0.372-0.412,0.785-0.605,1.125c-0.209,0.377-0.407,0.76-0.602,1.144c-0.188-0.029-0.375-0.056-0.563-0.08    c-0.063-0.417-0.131-0.833-0.208-1.25c-0.071-0.378-0.145-0.835-0.189-1.252c-0.007,0-0.009,0-0.012,0    c-0.061,0.42-0.124,0.9-0.186,1.289c-0.055,0.396-0.11,0.788-0.166,1.183c-0.223-0.02-0.447-0.035-0.67-0.049    c0.127-1.042,0.264-2.082,0.413-3.122c0.371,0.024,0.742,0.058,1.112,0.1c0.08,0.361,0.155,0.723,0.228,1.084    c0.062,0.375,0.115,0.778,0.138,1.153c0.005,0,0.009,0,0.015,0.002c0.146-0.347,0.325-0.74,0.494-1.066    c0.18-0.323,0.366-0.645,0.557-0.964c0.36,0.063,0.721,0.135,1.078,0.216c-0.164,1.036-0.338,2.072-0.519,3.105    C19.217,16.535,18.982,16.483,18.749,16.438z M20.146,16.819c-0.238-0.064-0.367-0.284-0.309-0.523    c0.062-0.244,0.285-0.377,0.54-0.307c0.257,0.07,0.382,0.292,0.308,0.538C20.614,16.762,20.395,16.887,20.146,16.819z     M21.182,17.131c-0.237-0.076-0.354-0.303-0.283-0.539c0.074-0.242,0.306-0.361,0.56-0.277c0.253,0.084,0.362,0.312,0.276,0.553    C21.651,17.1,21.428,17.213,21.182,17.131z M22.738,17.258c-0.094,0.225-0.316,0.327-0.561,0.23    c-0.244-0.094-0.345-0.323-0.262-0.553c0.084-0.23,0.319-0.334,0.568-0.237C22.736,16.797,22.828,17.028,22.738,17.258z     M22.84,16.588c-0.18-0.072-0.361-0.144-0.541-0.209c0.209-0.675,0.416-1.348,0.619-2.023c0.277,0.102,0.555,0.21,0.83,0.324    C23.443,15.313,23.141,15.951,22.84,16.588z"/><path d="M7.726,14.887c-0.073-0.226-0.315-0.281-0.669-0.156c-0.171,0.062-0.265,0.107-0.328,0.141    c0.085,0.227,0.171,0.456,0.256,0.686c0.082-0.031,0.165-0.062,0.249-0.092C7.63,15.324,7.797,15.11,7.726,14.887z"/></g></g></svg>`;

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

  let gameState;
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

  const playerElt = document.createElement("div");
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
  startScreen.innerHTML =
    'GAME OVER<br><span style="font-size: 16px;">Press R or Click to restart</span>';
  startScreen.innerHTML = `Invaders!<br><span style="font-size: ${config.hudSize}px;">Press Space or Click to Start</span>`;
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

  tick();
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
      score: 0,
      started: false,
      gameOver: false,
      lastShot: 0,
      enemyDirection: 1,
      gameWidth: 0,
      gameHeight: 0,
      level: 1,
    };
    recheckGameStartupSize();
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
      bulletSize: Math.max(14, 0.008 * gameState.gameWidth),
      playerBulletSize: Math.max(7, 0.008 * gameState.gameWidth),
      hudSize: Math.max(12, 0.025 * gameState.gameWidth),
      shieldSize: Math.max(30, 0.06 * gameState.gameWidth),
    };
    gameState.player.width = config.playerSize;
    gameState.player.height = config.playerSize;
    gameState.player.x = (gameState.gameWidth - gameState.player.width) / 2;
    gameState.player.y = gameState.gameHeight - gameState.player.height - 20;
    setupEnemies();
    setupShields();

    applyStyle(playerSvg, {
      position: "absolute",
      top: 0,
      color: env.STYLE.windowActiveHeaderText,
      // color: "#ffffff",
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

  function setupEnemies() {
    clearEnemies();
    const rows = 4;
    const cols = 9;
    const enemySize = config.enemySize || 25;
    const spacing = enemySize * 1.4;
    const totalWidth = cols * spacing;
    const startX = (gameState.gameWidth - totalWidth) / 2;
    const startY = gameState.gameHeight * 0.1;

    const ufoSvgUrl = URL.createObjectURL(
      new Blob([UFO_SVG], { type: "image/svg+xml" }),
    );
    const ufoImg = new Image();
    ufoImg.src = ufoSvgUrl;
    ufoImg.onload = () => {
      URL.revokeObjectURL(ufoSvgUrl);
    };

    const alien1SvgUrl = URL.createObjectURL(
      new Blob([ALIEN1_SVG], { type: "image/svg+xml" }),
    );
    const alien1Img = new Image();
    alien1Img.src = alien1SvgUrl;
    alien1Img.onload = () => {
      URL.revokeObjectURL(alien1SvgUrl);
    };

    const alien2SvgUrl = URL.createObjectURL(
      new Blob([ALIEN2_SVG], { type: "image/svg+xml" }),
    );
    const alien2Img = new Image();
    alien2Img.src = alien2SvgUrl;
    alien2Img.onload = () => {
      URL.revokeObjectURL(alien2SvgUrl);
    };

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy = {
          row,
          col,
          x: startX + col * spacing,
          y: startY + row * spacing,
          width: enemySize,
          height: enemySize,
        };
        const enemyElt = document.createElement("div");
        enemyElt.dataset.type = "enemy";
        let img;
        if (row < 2) {
          img = alien1Img.cloneNode();
        } else if (row < 3) {
          img = alien2Img.cloneNode();
        } else {
          img = ufoImg.cloneNode();
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

    for (let i = 0; i < numShields; i++) {
      const baseX = startX + i * (shieldSize * 4);
      const pattern = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 1],
      ];

      const blockSize = shieldSize / 6;

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
    if (now - gameState.lastShot > config.fireRate) {
      const playerBulletSize = config.playerBulletSize;
      const bullet = {
        x:
          gameState.player.x +
          gameState.player.width / 2 -
          playerBulletSize / 2,
        y: gameState.player.y,
        width: playerBulletSize,
        height: playerBulletSize,
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
        backgroundColor: env.STYLE.windowActiveHeaderText,
        // backgroundColor: "white",
        userSelect: "none",
      });
      gameArea.appendChild(bulletElt);
      bullet.element = bulletElt;
      gameState.bullets.push(bullet);
      gameState.lastShot = now;
    }
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
  }

  function updateBullets() {
    gameState.bullets = gameState.bullets.filter((bullet) => {
      bullet.y -= config.bulletSpeed;
      if (bullet.y <= -bullet.height) {
        bullet.element.remove();
        return false;
      }
      return true;
    });

    gameState.enemyBullets = gameState.enemyBullets.filter((bullet) => {
      bullet.y += config.enemyBulletSpeed;
      if (bullet.y >= gameState.height + bullet.height) {
        bullet.element.remove();
        return false;
      }
      return true;
    });
  }

  function updateEnemies() {
    if (gameState.enemies.length === 0) {
      gameState.level++;
      clearEnemyBullets();
      clearBullets();
      setupEnemies();
      config.enemyBaseSpeed += 0.5;
      config.enemySuppSpeed = 0;
      return;
    }

    let shouldDrop = false;

    for (let enemy of gameState.enemies) {
      if (
        (enemy.x <= 0 && gameState.enemyDirection === -1) ||
        (enemy.x >= gameState.gameWidth - enemy.width &&
          gameState.enemyDirection === 1)
      ) {
        shouldDrop = true;
        break;
      }
    }

    if (shouldDrop) {
      gameState.enemyDirection *= -1;
      gameState.enemies.forEach((enemy) => {
        enemy.y += config.enemyDropDistance;
      });
    } else {
      gameState.enemies.forEach((enemy) => {
        enemy.x +=
          (config.enemyBaseSpeed + config.enemySuppSpeed) *
          gameState.enemyDirection;
      });
    }

    if (Math.random() < 0.001 * gameState.enemies.length) {
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
  }

  function checkCollisions() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = gameState.bullets[i];
      let bulletHit = false;

      for (let j = gameState.enemies.length - 1; j >= 0; j--) {
        const enemy = gameState.enemies[j];
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          gameState.bullets[i].element.remove();
          gameState.bullets.splice(i, 1);
          gameState.enemies[j].element.remove();
          gameState.enemies.splice(j, 1);
          config.enemySuppSpeed += 0.00015 * gameState.gameWidth;
          gameState.score += 10;
          bulletHit = true;
          break;
        }
      }

      if (!bulletHit) {
        for (let k = gameState.shields.length - 1; k >= 0; k--) {
          const shield = gameState.shields[k];
          if (
            bullet.x < shield.x + shield.width &&
            bullet.x + bullet.width > shield.x &&
            bullet.y < shield.y + shield.height &&
            bullet.y + bullet.height > shield.y
          ) {
            gameState.bullets[i].element.remove();
            gameState.bullets.splice(i, 1);
            // shield.health--;
            // if (shield.health <= 0) {
            gameState.shields[k].element.remove();
            gameState.shields.splice(k, 1);
            // }
            break;
          }
        }
      }
    }

    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = gameState.enemyBullets[i];
      let bulletHit = false;

      if (
        bullet.x < gameState.player.x + gameState.player.width &&
        bullet.x + bullet.width > gameState.player.x &&
        bullet.y < gameState.player.y + gameState.player.height &&
        bullet.y + bullet.height > gameState.player.y
      ) {
        // Let's do some invicibility frames
        if (performance.now() - gameState.player.lastDamageTs > 600) {
          gameState.enemyBullets[i].element.remove();
          gameState.enemyBullets.splice(i, 1);
          gameState.player.lives--;
          gameState.player.lastDamageTs = performance.now();
          if (gameState.player.lives <= 0) {
            gameState.gameOver = true;
          }
          bulletHit = true;
        }
      }

      if (!bulletHit) {
        for (let k = gameState.shields.length - 1; k >= 0; k--) {
          const shield = gameState.shields[k];
          if (
            bullet.x < shield.x + shield.width &&
            bullet.x + bullet.width > shield.x &&
            bullet.y < shield.y + shield.height &&
            bullet.y + bullet.height > shield.y
          ) {
            gameState.enemyBullets[i].element.remove();
            gameState.enemyBullets.splice(i, 1);
            // shield.health--;
            // if (shield.health <= 0) {
            gameState.shields[k].element.remove();
            gameState.shields.splice(k, 1);
            // }
            break;
          }
        }
      }
    }

    for (let enemy of gameState.enemies) {
      if (
        enemy.x < gameState.player.x + gameState.player.width &&
        enemy.x + enemy.width > gameState.player.x &&
        enemy.y < gameState.player.y + gameState.player.height &&
        enemy.y + enemy.height > gameState.player.y
      ) {
        gameState.gameOver = true;
      }

      if (enemy.y + enemy.height >= gameState.gameHeight - 50) {
        gameState.gameOver = true;
      }
    }
  }

  function render() {
    applyStyle(playerElt, {
      left: gameState.player.x + "px",
      top: gameState.player.y + "px",
      fontSize: config.playerSize + "px",
    });
    gameState.enemies.forEach((enemy) => {
      applyStyle(enemy.element, {
        position: "absolute",
        left: enemy.x + "px",
        top: enemy.y + "px",
        fontSize: config.enemySize + "px",
        userSelect: "none",
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
        position: "absolute",
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

    const deltaDmg = performance.now() - gameState.player.lastDamageTs;
    if (deltaDmg < 500) {
      playerElt.innerHTML = "";
      playerElt.appendChild(boomSvg);
      boomSvg.style.transform = `scale(${Math.min(deltaDmg / 250, 1)}) translate(0px, -${config.playerSize / 2}px)`;
    } else if (!gameState.gameOver) {
      playerElt.innerHTML = "";
      playerElt.appendChild(playerSvg);
    }

    hud.textContent = `SCORE: ${gameState.score} | LIVES: ${gameState.player.lives} | LEVEL: ${gameState.level}`;
    hud.style.fontSize = config.hudSize + "px";

    if (gameState.gameOver) {
      gameState.bullets.forEach((bullet) => {
        bullet.element.remove();
      });
      gameState.bullets.length = 0;
      gameState.enemyBullets.forEach((bullet) => {
        bullet.element.remove();
      });
      gameState.enemyBullets.length = 0;
      gameOverScreen.style.display = "block";
      gameOverScreen.style.fontSize = config.hudSize * 1.5 + "px";
      gameOverScreen.innerHTML = `GAME OVER<br>FINAL SCORE: ${gameState.score}<br><span style="font-size: ${config.hudSize}px;">Press R or Click to restart</span>`;
    } else {
      if (!gameState.started) {
        startScreen.style.display = "block";
        startScreen.style.fontSize = config.hudSize * 1.5 + "px";
        startScreen.innerHTML = `Invaders!<br><span style="font-size: ${config.hudSize}px;">Press Space or Click to Start</span>`;
      } else {
        startScreen.style.display = "none";
      }
      gameOverScreen.style.display = "none";
    }
  }

  function tick() {
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
      checkCollisions();
    }

    render();
    animationId = requestAnimationFrame(tick);
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
    tick();
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
