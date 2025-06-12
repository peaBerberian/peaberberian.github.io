/** This is the code for the app identified as "other_projects_gif-renderer". */
var n="https://github.com/peaberberian/gif-renderer.rs";function o(i,t){let{createAppTitle:a}=t.appUtils;return t.updateTitle(null,"Other Projects: gif-renderer.rs"),{sidebar:[{text:"Overview",icon:"\u{1F9D1}\u200D\u{1F3EB}",centered:!0,render:()=>{let e=document.createElement("div");e.appendChild(a("gif-renderer.rs",{github:n}));let r=document.createElement("div");return e.appendChild(r),r.innerHTML=`<p>gif-renderer.rs is a simple GIF renderer in Rust.</p>

  <p>You probably have many applications on your device already able to decode those images, so you may probably not want to run to install that one right away!<br>
	As it can be seen from my other projects, I'm particularly interested by the handling of media data, but at the time never much dived into the decoding logic of an image format, instead always working on upper presentation layers.</p>

	<p>So that project was here to change that by looking at a weird, inneficient, culturally important, format as an added bonus!<br>
  It was also started as I was learning the Rust language, to clearly ensure I understood everything I was writing I also limited my reliance on dependencies, here only relying on some libraries for cross-platform window creation and for rendering the decoded output (basically rendering directly frames into a framebuffer).</p>

  <p>Yet it turns out that maintaining those few dependencies was the biggest pain point here!<br>This was due to the very fast pace at which the Rust's ecosystem evolued when I was writing this, leading to many breakages and refactoring at each update.<br>
  I started from relying on the lower-level libraries "winit" (for window creation and event handling) and "glutin" (for OpenGL/Vulkan context creation), but after the third time I had to rewrite this assumed-to-be low-maintainance project, I switched for those tasks to a higher level popular UI library: <a href="https://www.egui.rs/" target="_blank">egui</a>.</p>

  <p>I initially planned to add a secondary platform where it could run through WebAssembly rendering the GIF inside a canvas on the page.<br>The idea was even to add some controls, for example to navigate frame-to-frame or go in reverse. However, I grew bored and more inclined to do other projects right when I could have started doing that, so mayber for later!</p>`,e}}]}}export{o as create};
