function a(o,e){let{createAppIframe:n}=e.appUtils,t=location.href.indexOf("#"),r=t>0?location.href.substring(0,t):location.href;return{element:n(r+"?"+String(Date.now()))}}export{a as create};
