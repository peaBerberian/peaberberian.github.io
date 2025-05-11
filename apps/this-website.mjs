const { createAppTitle, strHtml } = AppUtils;

const GITHUB_LINK = "https://github.com/peaberberian/peaberberian.github.io";

const sidebar = [
  { text: "Overview", centered: true, icon: "🧑‍🏫", render: getOverview },
  {
    text: "Making it efficient",
    centered: true,
    icon: "🏎️",
    render: getOptimal,
  },
  {
    text: "Making it configurable",
    centered: true,
    icon: "🧰",
    render: getConfigurable,
  },
  {
    text: "Why so many emojis?",
    centered: true,
    icon: "😵‍💫",
    render: getEmojis,
  },
  {
    text: "Some Anecdotes",
    centered: true,
    icon: "🎈",
    render: getAnecdotes,
  },
];
export { sidebar };
function getOverview() {
  return strHtml`<div>
${createAppTitle("About This Website", { github: GITHUB_LINK })}

<p>I initially envisionned a simple desktop environment where I could list my open-source projects to replace my previously minimal (some said bland) personal website.</p>

<p>However, I so loved writing the fake OS parts that I ended up implementing many nice features (moving / resizing the taskbar, theming, window customization, window snapping) and multiple applications (though all fairly minimal, I will admit!), in "vanilla" (meaning: depending on no framework/library) JavaScript/HTML/CSS.</p>

<p>So there has been a change of plan: it's not a listing of other projects anymore, now it's its own thing as a JS desktop environment!</p>

</div>`;
}

function getOptimal() {
  return strHtml`<div>
${createAppTitle("Making it efficient", {})}
<p>I tried to make that website as efficient as possible:</p>

<p>
<ul>
	<li>Almost all animations are done mostly in CSS. Those are generally much more efficient that doing the same animations with JavaScript code.</li>
	<li>To avoid too many heavy repaints, I added specific checks ensuring that the content stood the same in some particular situations.<br>For example, on page resize I pre-check the dimensions of the new grid of desktop icons and check if their organization would change horizontally or vertically entirely with JS computations, before deciding to interact with the DOM.</li>
	<li>I've been also very careful with the browser API with which I interacted again to avoid repaints: I rarely rely on web API which would need the browser to internally re-check element positions for example, preferring to ensure that the browser can optimize its rendering the best it can. I also grouped most DOM mutations together, generally inside <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame">requestAnimationFrame</a> callbacks.</li>
	<li>When windows are moved or resized, I tried to make it apparent through CSS to the browser that it should have no impact on other elements beside z-positioning.</li>
	<li>I've tried to also be frugal with memory usage, by only storing what's needed and being very careful with the potentiality of memory leaks (here the main culprits would be event listeners).</li>
</ul>
</p>`;
}

function getConfigurable() {
  return strHtml`<div>
${createAppTitle("Making it configurable", {})}
<p>I spent some efforts trying to make the behavior of this desktop configurable (through the settings app).</p>

<p>When I check a new desktop environment, I usually love diving into configurations to see if the environment keep being functional even after heavy personalization, thus I also wanted to make a highly-configurable yet always-functional desktop.</p>

<div class="separator" />

<p>Amongst areas where configuration makes a lot of sense, one was how to react to a page resize with already opened windows:
<ol>
	<li>Should the windows' position and size update accordingly with the page's dimensions?<br>This could be expected if you consider regular website behavior.</li>
	<li>Should the windows' position and size just stay as stable as possible even in those cases?<br>This seemed more practical to me when you just consider a desktop environment</li>
</ol>
<br>
I thought that both could make sense depending on the user, so I chose to propose both as two configuration toggles (one for positions, the other for dimensions). The first behavior is implemented under the hood through CSS percentage properties, the second as pixel properties - though it gets more complex when handling window moving and resizing.
</p>

<div class="separator" />

<p>Another area that was actually hard to implement, was what I internally called "OOB windows" (for "out-of-bounds"), which is the possibility of moving the windows partially out of the screen (only partially because I wanted the user to still always be able to reach windows).<br>Here also one of the harder thing to do with that feature is knowing what to do on page resize, especially as I wanted that:<ol>
<li>Windows should never be totally out of the screen and we always should be able to reach enough of a window to move it or resize it.</li>
<li>A window that was previously entirely contained in the screen should always ENTIRELY stay inside the screen.</li>
<li>Window placements should always seem logical from the user's point of view, even if the window is initially partially out of the screen.</li>
</ol>
<br>
I ended up on a simple rule in my logic reacting to page resizes: For windows entirely inside the screen, they always are re-rendered entirely inside the screen, and are moved in a predictable way if a resize meant they wouldn't. I also prefer updating position first and then dimensions if it doesn't fit the screen at all, as it seemed more useful to a user to keep the same dimensions than to keep the same positions.<br>
If a window is partially out of the screen, I consider that the area in which it can be repainted is the screen extended to the edge of that window (instead of just what's visible), I then added checks for security paddings ensuring that windows always stay reachable.</p>
<p>This should lead to always predictable and useful behavior.</p>
</div>`;
}

function getEmojis() {
  return strHtml`<div>
${createAppTitle("So many emojis 😵‍💫", {})}
<p>As you can see, I rely heavily on emojis for many picture-like aspects of this website (icons, sidebar categories, start button, theming).</p>

<p>This is because relying on those has some nice advantages:
<ul>
	<li>They are embedded in one of your system's font, so there's no external image to load from the network and they are memory-efficient.</li>
	<li>Because they are linked to your system, they also provide a more "native" look in the platform you use to visit that website.</li>
	<li>Those have already been vetted by experts to express moods and ideas, which is what I wanted to do to represent the idea behind each project.</li>
</ul>
</p>
<p>It could be argued that some devices don't have any font with emojis, though those should generally not be devices from the target audience of that website. Yet if it turns out that a visitor still don't have them, the fallback font or replacement characters will make it clear that the current device is missing them.</p>
</div>`;
}

function getAnecdotes() {
  return strHtml`<div>
${createAppTitle("Some anecdotes", {})}
<p>While writing this, I encountered several difficulties that I found interesting.</p>

<div class="separator" />

<p>Some applications contain i-frame elements, which are HTML elements allowing to display a page in another page. This is the case for example with what I called "demos".</p>

<p>For security reasons, web browsers implement many specific behaviors on i-frame elements.<br>The most annoying one for me has been related to pointer events: anytime you move your mouse/finger on most i-frames here, the website embedding that i-frame (so here, the one you are on right now) is unable to get the corresponding events. This could subtly break multiple behaviors, like resizing and moving. This is because depending on your celerity you could temporarily have your mouse on top of an i-frame while doing that (without even realizing, just you would see that your mouse stopped having an effect for some reason).<br>The fun, weird, yet completely-functional solution was to disable through a CSS rule all pointer events on all i-frames when window moving or resizing is going on. There's no reason why you would want to do both at the same time so it's fully transparent.</p>

<p>It's still not perfect as for example, clicking inside an i-frame which itself is in a background window won't put that window forward (it doesn't know you clicked in its content). Yet as this only applies to very few applications, I found this behavior OK for now).</p>

<div class="separator" />

<p>Speaking of i-frames, a fun idea I wanted to implement is what I jokingly called the "inception" app, which is running the current app inside itself in an i-frame (what's called a mise en abyme in other media, here called "inception" with a brain emoji as a more-fun, less pretentious reference).</p>

<p>When first implementing that, I realized that most browsers had some security in place to avoid an infinite serie of i-frames, and that due to this, launching the "inception app" more than one time lead to an empty i-frame visually.<br>I tried several solutions, including modifying the fragment part of the URL (the part coming after "#") yet it had no effect. What ended up working though is relying on a different query string in the URL. This meant that the server has to return the same page regardless of if there's a query string or not in the URL and regardless of its value.</p>

<p>Yet luckily most web servers seem to do that.</p>

<div class="separator" />

<p>The application giving me the most difficulties was weirdly-enough the clock.</p>

<p>I absolutely wanted to have a clock as I wanted something to happen when someone click on the time inside the taskbar (doing nothing there would have been lame to me).<br>I originally had the simplest possible SVG of a white face with hours, minutes and seconds hands on top that I was periodically updating (scheduling through the requestAnimationFrame web API), but I always found that it was kind of ugly.</p>

<p>So I spent much more efforts compiling things left and right, asking both LLM to make something look good and searching the web for SVG resources and examples.</p>

<p>At one point I had something I considered perfect: the SVG was self-animating through an <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform">animateTransform</a> element.</p>

<p>To show off even more, I made the initial background of the "app" transparent with a CSS blur. That is admiteddly very easy to do in CSS but gives an impressive result, so it seemed to be a good thing to add.</p>

<p>However after doing all that, issues started showing:<ol>
<li>The self-animated SVG was perfect, until the window wasn't displayed on screen (e.g. the app was "minimized"). There it seems that some browsers "paused" the SVG and, even after restoring it, it took a lot of time to fix itself in place.<br>I guess this is a browser optimization? I re-switched to JS-based animation once I saw this.</li>
<li>My initial JS-based animation rework was done quickly, and re-defined the coordinates of the hour, minute and second hands at each iteration.<br>However doing that lead to some very small variations of e.g. the hands' length (due to floating-point arithmetics or SVG approximations?) that became visible if you focused on it enough.<br>As I found that original implementation unsteady anyway I reworked the logic so it relies on a rotation transform again.</li>
<li>On some browsers, the combination of the window's blurred transparency of the clock's shadow and of other elements behind it seemed to lead to weird temporary visual glitches.<br>I chose here to be wise and just give the app a "normal" background, the clock is not the main attraction of this desktop after all!</li>
</ol>
</p>

<div class="separator" />

<p>I've always been skeptical of LLM regarding development yet I don't want to miss out on ways in which it could help me improve, so it's the first project I've done where I tried iterating with it.</p>

<p>In the few logic-related areas where I tested it, I didn't find it good enough: I spent a lof of time correcting issues and fixing an IMO non-maintable architecture, leading in the end to me rewriting 90% of it, with a lot of debugging time, leading me to believe that it would have been faster to write that from scratch.</p>

<p>For prototyping HTML drafts of what future things could look like however, it saved me a lot of time in what is usually a timesink for me, so here it has been a net plus.</p>

<p>But the main area where I used it and where it has been especially useful is for theming.<br>I basically constructed an initial theme (the default one), that I reduced to a few 6 digits hex RGB codes, prefaced with a light description of what each are for. Then I gave it to Claude and/or Deepseek (sometimes the former, sometimes the latter) by giving a description of an alternate theme I wanted to create (e.g. a "dark theme", a "warm sunny theme" etc.).<br>It was here surprisingly good, with me only updating a few colors, usually for the same parts (the corresponding colors' description maybe weren't clear enough?). I even continued by asking some nonsensical themes like a "watermelon-based" theme just to check its limit... But the resulting watermelon theme it produced was in my opinion one of the best (though "panda" is still my personal favorite)!</p>

<p>That was definitely a good surprise for that part, which I wouldn't have spent too much time on anyway if I had to do it all by myself.</p>

</div>`;
}
