/** This is the code for the app identified as "clock". */
var c=0;function F(r,o,n){let e=v(),t=document.createElement("div");p(t,{backgroundColor:o.STYLE.disabledColor,position:"relative",height:"100%",width:"100%",margin:"0px",textAlign:"center"});let i=document.createElement("div");p(i,{height:"100%",width:"100%",position:"absolute"}),i.innerHTML=$();let g=i.getElementsByClassName("clock-text")[0];t.appendChild(i),x();let w=setInterval(()=>{x()},350),f;return n.addEventListener("abort",()=>{clearInterval(w),f=!0}),requestAnimationFrame(y),{element:t};function x(){let s=new Date,a=s.getHours(),d=s.getMinutes(),l=s.getSeconds(),k=e?a%12||12:a,h=d<10?"0"+d:d,m=l<10?"0"+l:l,u;e?u=a>=12?" PM":" AM":u="",g.textContent=`${k}:${h}:${m}${u}`}function y(){if(f)return;let s=new Date,a=s.getHours()%12,d=s.getMinutes(),l=s.getSeconds(),k=s.getMilliseconds(),h=d*60+l+k/1e3,u=(a*3600+h)/120%360,M=h/10%360,C=l*6+k*.006;i.getElementsByClassName("hour")[0].setAttribute("transform",`rotate(${u}, 200, 200)`),i.getElementsByClassName("minute")[0].setAttribute("transform",`rotate(${M}, 200, 200)`),i.getElementsByClassName("second")[0].setAttribute("transform",`rotate(${C}, 200, 200)`),requestAnimationFrame(y)}}function $(){let r="";for(let o=0;o<60;o++){if(o%5===0)continue;let n=o*6,e=[200+155*Math.sin(n*Math.PI/180),200-155*Math.cos(n*Math.PI/180),200+162*Math.sin(n*Math.PI/180),200-162*Math.cos(n*Math.PI/180)];for(let t of[0,1,2,3])e[t]%1!==0&&(e[t]%1>.95?e[t]=Math.ceil(e[t]):e[t]%1<.05&&(e[t]=Math.floor(e[t])),e[t]=e[t].toFixed(1));r+=`
    <!-- ${o}m -->
    <line x1="${e[0]}" y1="${e[1]}" x2="${e[2]}" y2="${e[3]}" stroke="#888888" stroke-width="1" stroke-linecap="round" />`}return c++,`<svg viewBox="0 0 400 400" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Definitions for shadows and gradients -->
  <defs>
    <filter id="clock-${c}-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
      <feOffset dx="2" dy="2" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3" />
      </feComponentTransfer>
      <feMerge0
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    
    <linearGradient id="clock-${c}-clockFaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f5f5" />
      <stop offset="100%" stop-color="#e0e0e0" />
    </linearGradient>

    <linearGradient id="clock-${c}-rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#606060" />
      <stop offset="100%" stop-color="#383838" />
    </linearGradient>
  </defs>

  <!-- Clock rim -->
  <circle cx="200" cy="200" r="180" fill="url(#clock-${c}-rimGradient)" filter="url(#clock-${c}-shadow)" />
  
  <!-- Clock face -->
  <circle cx="200" cy="200" r="170" fill="url(#clock-${c}-clockFaceGradient)" />
  
  <!-- Minute markers -->
  <g>
${r}
  </g>
  <text class="clock-text" x="200" y="275" text-anchor="middle" font-family="monospace" font-size="22" fill="#666666"></text>
  <!-- Hour markers -->
  <g>
    <!-- 12h -->
    <line x1="200" y1="63" x2="200" y2="38" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 1h -->
    <line x1="272.5" y1="74" x2="281" y2="59" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 2h -->
    <line x1="325" y1="127.5" x2="340" y2="119" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 3h -->
    <line x1="345" y1="200" x2="362" y2="200" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 4h -->
    <line x1="325.5" y1="272.5" x2="340" y2="281" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 5h -->
    <line x1="272.5" y1="325.5" x2="281" y2="340" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 6h -->
    <line x1="200" y1="345" x2="200" y2="362" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 7h -->
    <line x1="127.5" y1="325.5" x2="119" y2="340" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 8h -->
    <line x1="74.5" y1="272.5" x2="59.7" y2="281" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 9h -->
    <line x1="55" y1="200" x2="38" y2="200" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 10h -->
    <line x1="74.4" y1="127.5" x2="59.7" y2="119" stroke="#333333" stroke-width="3" stroke-linecap="round" />
    <!-- 11h -->
    <line x1="127.5" y1="74.4" x2="119" y2="59.7" stroke="#333333" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Clock hands -->
  <g>
    <!-- Hour hand -->
    <line class="hour" x1="200" y1="200" x2="200" y2="120" stroke="#555555" stroke-width="5" stroke-linecap="round">
    </line>
    
    <!-- Minute hand -->
    <line class="minute"" x1="200" y1="200" x2="200" y2="80" stroke="#555555" stroke-width="5" stroke-linecap="round">
    </line>
    
    <!-- Second hand -->
    <line class="second" x1="200" y1="220" x2="200" y2="80" stroke="#D32F2F" stroke-width="2" stroke-linecap="round">
    </line>
    
    <!-- Center pin -->
    <circle cx="200" cy="200" r="8" fill="#555555" />
    <circle cx="200" cy="200" r="4" fill="#D32F2F" />
  </g>
</svg>`}function v(){let r=navigator.language;try{return Intl.DateTimeFormat(r,{hour:"numeric"}).resolvedOptions().hour12===!0}catch{return r==="en-US"}}function p(r,o){for(let n of Object.keys(o))r.style[n]=o[n]}export{F as create};
