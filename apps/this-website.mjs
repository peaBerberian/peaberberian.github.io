const GITHUB_LINK = "https://github.com/peaberberian/peaberberian.github.io";

export function create(_args, env) {
  const { createAppTitle } = env.appUtils;
  return {
    sidebar: [
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
        text: "Making it secure",
        centered: true,
        icon: "🔐",
        render: getSecure,
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
      {
        text: "External Resources",
        centered: true,
        icon: "🫶",
        render: getResources,
      },
    ],
  };

  function getOverview() {
    const overviewContainer = document.createElement("div");
    overviewContainer.appendChild(
      createAppTitle("About This Website", { github: GITHUB_LINK }),
    );

    const overviewText = document.createElement("div");
    overviewContainer.appendChild(overviewText);
    overviewText.innerHTML = `<p>I initially envisionned a simple desktop environment where I could list my open-source projects to replace my previously minimal (some said bland) personal website.</p>

<p>However, I so loved writing the fake OS parts that I ended up implementing many nice features (customization, a filesystem, sandboxed apps with a permission system) and multiple applications (though all fairly minimal, I will admit!), in "vanilla" (meaning: depending on no framework/library) JavaScript/HTML/CSS.</p>

<p>So there has been a change of plan: it's not a listing of other projects anymore, now it's its own thing as a JS desktop environment!</p>`;
    return overviewContainer;
  }

  function getOptimal() {
    const optimContainer = document.createElement("div");
    optimContainer.appendChild(createAppTitle("Making it efficient", {}));

    const optimText = document.createElement("div");
    optimContainer.appendChild(optimText);
    optimText.innerHTML = `<p>I tried to make that website as efficient as possible:</p>
<ul>
  <li>Almost all animations are done mostly in CSS. Those are generally much more efficient that doing the same animations with JavaScript code.</li>
  <li>To avoid too many heavy repaints, I added specific checks ensuring that the content stood the same in some particular situations.<br>For example, on page resize I pre-check the dimensions of the new grid of desktop icons and check if their organization would change horizontally or vertically entirely with JS computations, before deciding to interact with the DOM.</li>
  <li>I've been also very careful with the browser API with which I interacted again to avoid repaints: I rarely rely on web API which would need the browser to internally re-check element positions for example, preferring to ensure that the browser can optimize its rendering the best it can. I also grouped most DOM mutations together, generally inside <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame" target="_blank">requestAnimationFrame</a> callbacks.</li>
  <li>When windows are moved or resized, I tried to make it apparent through CSS to the browser that it should have no impact on other elements beside z-positioning.</li>
  <li>Most applications are isolated in a way that allows parralelism, meaning that some application doing heavy processing (like let's say you're handling a huge file in "notes") won't stall the whole desktop with it.</li>
  <li>I've tried to also be frugal with memory usage, by only storing what's needed and being very careful with the potentiality of memory leaks (here the main culprits would be event listeners).</li>
</ul>`;
    return optimContainer;
  }

  function getConfigurable() {
    const configContainer = document.createElement("div");
    configContainer.appendChild(createAppTitle("Making it configurable", {}));

    const configText = document.createElement("div");
    configContainer.appendChild(configText);
    configText.innerHTML = `<p>I spent some efforts trying to make the behavior of this desktop configurable (through the settings app).</p>

<p>When I check a new desktop environment, I usually love diving into configurations to see if the environment keep being functional even after heavy personalization, thus I also wanted to make a highly-configurable yet always-functional desktop.</p>

<div class="separator"></div>

<p>Amongst areas where configuration makes a lot of sense, one was how to react to a page resize with already opened windows:</p>
<ol>
  <li>Should the windows' position and size update accordingly with the page's dimensions?<br>This could be expected if you consider regular website behavior.</li>
  <li>Should the windows' position and size just stay as stable as possible even in those cases?<br>This seemed more practical to me when you just consider a desktop environment</li>
</ol>
<br>
<p>I thought that both could make sense depending on the user, so I chose to propose both as two configuration toggles (one for positions, the other for dimensions). The first behavior is implemented under the hood through CSS percentage properties, the second as pixel properties - though it gets more complex when handling window moving and resizing.</p>

<div class="separator"></div>

<p>Another area that was actually hard to implement, was what I internally called "OOB windows" (for "out-of-bounds"), which is the possibility of moving the windows partially out of the screen (only partially because I wanted the user to still always be able to reach windows).<br>Here also one of the harder thing to do with that feature is knowing what to do on page resize, especially as I wanted that:</p><ol>
<li>Windows should never be totally out of the screen and we always should be able to reach enough of a window to move it or resize it.</li>
<li>A window that was previously entirely contained in the screen should always ENTIRELY stay inside the screen.</li>
<li>Window placements should always seem logical from the user's point of view, even if the window is initially partially out of the screen.</li>
</ol>
<br>
<p>I ended up on a simple rule in my logic reacting to page resizes: For windows entirely inside the screen, they always are re-rendered entirely inside the screen, and are moved in a predictable way if a resize meant they wouldn't. I also prefer updating position first and then dimensions if it doesn't fit the screen at all, as it seemed more useful to a user to keep the same dimensions than to keep the same positions.<br>
If a window is partially out of the screen, I consider that the area in which it can be repainted is the screen extended to the edge of that window (instead of just what's visible), I then added checks for security paddings ensuring that windows always stay reachable.</p>
<p>This should lead to always predictable and useful behavior.</p>
</div>`;
    return configContainer;
  }

  function getSecure() {
    const secureContainer = document.createElement("div");
    secureContainer.appendChild(createAppTitle("Making it secure", {}));

    const secureText = document.createElement("div");
    secureContainer.appendChild(secureText);
    secureText.innerHTML = `<p>Even though this is a simple personal project, this desktop is actually developed with some high security constraints.</p>

<div class="separator"></div>
<h3>filesystem access from apps</h3>
<p>The main constraint I imposed is that "apps" are less trusted than the desktop itself regarding user data: most apps should not have access to the filesystem directly for example, and when they do (e.g. to edit and save a file) they should just obtain the strict minimum: the file's data, and maybe the file's name.<br><br>
Specifically in the case of a file, this was done by not giving direct filesystem access to most applications, but instead to allow them to spawn a more-trusted "file-picker" application, which takes the relay when opening or saving a file.</p>
<p>To take an example, let's say you want to edit a locally-stored image with the "Paint" application. What actually happens is:</p>
<ol>
  <li>You click on the "open" button</li>
  <li>Paint ask the desktop to open a file-picker so the user may choose a file to open</li>
  <li>Here, the desktop takes back control from the app, and opens the more trusted "explorer" app in its place so you can choose a file without "Paint" actually seeing what you're doing.</li>
  <li>You chose a file explicitly through the file picker.</li>
  <li>The desktop is notified, close the file picker, read the file that was selected and only communicate back the file data and title to the "Paint" app, but not its path nor any other metadata (note: the only reason the file name is also communicated is that apps often want this info, for example to indicate to the user which file they're currently editing).</li>
</ol>
<p>And the same thing happens when you save a file.</p>
<pThis way, apps are able to operate on file without having access to the filesystem nor seeing the path of files (which could be sensitive - e.g. contain the name of the person as a directory, or other personal data).</p>
<div class="separator"></div>
<h3>Special case: the "quick save" feature</h3>
<p>Speaking of files, it becomes even more interesting to write about the "quick save" button some apps have (including "Paint").</p>
<p>The quick save button basically allows to save the current changes to an opened file, without having to re-select it in a file picker at each save.<br>Yet I just wrote that applications have no idea where the files are stored, so how can they indicate to the desktop the path at which the file should be saved?</p>
<p>They could be communicating back the corresponding file name but it would be perfectly possible that a user opened multiple files stored at different places yet with the same file name, so this doesn't work.<br>Instead, apps are given a opaque "handle", which is actually a cryptographically-secure hash value storing the full path of the corresponding file, with the desktop being the only one with the key (the encryption used is AES-256-GCM).<br>This trick allows for the desktop to let applications keep the list of loaded paths themselves (the desktop doesn't have to maintain a list of opened files) without them being able to see nor update that path.</p>
<div class="separator"></div>
<h3>Exploiting site-isolation to our advantage</h3>
<p>Yet all those tricks may not be enough if the application can just access the actual storage source.</p>
<p>At a lower-level, user storage is implemented by relying on several browser API, mainly <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" target="_blank">the localStorage API</a> and more importantly <a href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API" target="_blank">the IndexedDB API</a>.<br>
An app could there theoretically call those browser API directly to read stored data without notifying the desktop.</p>
<p>To prevent this purely theoretical case, this desktop exploits for most apps a browser security feature called <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy" target="_blank">the "Same-origin" policy</a>.</p>
<p>It gets technical, but the simple idea is to run applications as <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe" target="_blank">iframe elements</a> which are associated to another "origin" than the desktop.<br>Doing that prevent the application from being able to access many resources that the desktop can access, including the aforementioned storage API.</p>
<p>As a very nice side-effect, running the application in an isolated iframe like this will also allow it to run in parallel with the desktop.<br>The main advantage of this in our case is that an application doing some heavy processing will not hang the whole desktop. With this, I could even implement an "app responsiveness check" in the desktop code, to e.g. allow to kill unresponsive app.<br>I did not take the time to do this yet.</p>
</div>`;
    return secureContainer;
  }

  function getEmojis() {
    const emojiContainer = document.createElement("div");
    emojiContainer.appendChild(createAppTitle("So many emojis 😵‍💫", {}));

    const emojiText = document.createElement("div");
    emojiContainer.appendChild(emojiText);
    emojiText.innerHTML = `<p>As you can see, I rely heavily on emojis for many picture-like aspects of this website (icons, sidebar categories, start button, theming).</p>

<p>This is because relying on those has some nice advantages:</p>
<ul>
  <li>They are embedded in one of your system's font, so there's no external image to load from the network and they are memory-efficient.</li>
  <li>Because they are linked to your system, they also provide a more "native" look in the platform you use to visit that website.</li>
  <li>I do not actually have to create or take images from somewhere, I'm just in effect outputing text, this frees me up from licensing issues!</li>
  <li>Those have been designed and vetted by experts to express moods/ideas and to look good on the current device.</li>
</ul>
<p>It could be argued that some devices don't have any font with emojis, though those should generally not be devices from the target audience of that website. Yet if it turns out that a visitor still don't have them, the fallback font or replacement characters will make it clear that the current device is missing them.</p>`;
    return emojiContainer;
  }

  function getAnecdotes() {
    const anecdotesContainer = document.createElement("div");
    anecdotesContainer.appendChild(createAppTitle("Some anecdotes", {}));

    const anecdotesText = document.createElement("div");
    anecdotesContainer.appendChild(anecdotesText);
    anecdotesText.innerHTML = `<p>While writing this, I encountered several difficulties that I found interesting.</p>

<h3>i-frame blocking</h3>

<p>Some applications contain i-frame elements, which are HTML elements allowing to display a page in another page. This is the case for example with what I called "demos".</p>

<p>For security reasons, web browsers implement many specific behaviors on i-frame elements.<br>The most annoying one for me has been related to pointer events: anytime you move your mouse/finger on most i-frames here, the website embedding that i-frame (so here, the one you are on right now) is unable to get the corresponding events. This can break many behaviors, like window activation, resizing and moving.<br>The fun, weird, yet completely-functional solution was to disable through a CSS rule all pointer events on all i-frames when window moving or resizing is going on.</p>
<p>In most cases, this would have been transparent (when moving or resizing a window, you're probably not also interacting with the window's content), but in one case, an inactive window, it has the now weird side-effect of not registering events inside the window's content (you have to interact twice: one click to activate the window and thus removing the "i-frame blocker", the second click will actually interact with the i-frame's content).<br>So I decided for now to add a message on top of i-frames to indicate to a user when the i-frame is not interactive.</p>

<h3>The "inception" app</h3>

<p>Speaking of i-frames, a fun idea I wanted to implement is what I jokingly called the "inception" app, which is running the current app inside itself in an i-frame (what's called a mise en abyme in other media, here called "inception" with a brain emoji as a more-fun, less pretentious reference).</p>

<p>When first implementing that, I realized that most browsers had some security in place to avoid an infinite serie of i-frames, and that due to this, launching the "inception app" more than one time lead to an empty i-frame visually.<br>I tried several solutions, including modifying the fragment part of the URL (the part coming after "#") yet it had no effect. What ended up working though is relying on a different query string in the URL. This meant that the server has to return the same page regardless of if there's a query string or not in the URL and regardless of its value.</p>

<p>Yet luckily most web servers seem to do that.</p>

<h3>Trying that LLM thing</h3>

<p>I've always been skeptical of LLM regarding development yet I don't want to miss out on ways in which it could help me improve, so it's the first project I've done where I tried iterating with it.</p>

<p>In the few logic-related areas where I tested it, I didn't find it good enough: I spent a lof of time correcting issues and fixing an IMO non-maintable architecture, leading in the end to me rewriting 90% of it, with a lot of debugging time, leading me to believe that it would have been faster to write that from scratch.</p>

<p>For prototyping drafts of what new apps could look like however, it saved me a lot of time in what is usually a timesink for me, so here it has been a net plus.</p>

<p>But the main area where I relied on it is for theming.<br>I basically constructed an initial theme (the default one), that I reduced to a few 6 digits hex RGB codes, prefaced with a light description of what each are for. Then I gave it to Claude and/or Deepseek (sometimes the former, sometimes the latter) by giving a description of an alternate theme I wanted to create (e.g. a "dark theme", a "warm sunny theme" etc.).<br>It was here surprisingly good, with me only updating a few colors, usually for the same parts (the corresponding colors' description maybe weren't clear enough?). I even continued by asking some nonsensical themes like a "watermelon-based" theme just to check its limit... But the resulting watermelon theme it produced was in my opinion one of the best (though "panda" is still my personal favorite)!</p>

<p>That was definitely a good surprise for that part, which I wouldn't have spent too much time on anyway if I had to do it all by myself.</p>

<h3>Paint's bucket</h3>

<p>The "paint" app has a "bucket" tool allowing to fill an area originally in one color in another color, similar to some other paint applications. I first thought that implementing it would be simple enough but I was completely wrong!</p>

<p>My initial implementation just:</p>
<ol>
  <li>Checked the "color pixels" individually currently drawn (this is under the hood relying on a "&ltcanvas&gt"} HTML element which has many JS api available to interact with it)</li>
  <li>Identified the color under the cursor on click</li>
  <li>Fill that pixel, and all neighbors with the same pixel color, of the target color</li>
  <li>That's done!</li>
</ol>
<p>But doing that weirdly led to what appeared to be some remnants of the old color at the edges.<br>After thinking my code was wrong and trying to fix some stuff, I finally looked at what exact pixels where not filled: turned out that they had a weird "color pixel" that I had never drawn, WTF 😮...</p>

<p>This is actually because in the paint app, we're very rarely "coloring" exact coordinates, like say: 15 pixels to the left and 50 to the bottom. To improve the rendering effect, I go beyond integer pixels (like: 1.42578 pixels to the left instead).<br>When doing that, most web browsers implementation actually perform sub-pixel tricks (like "inventing" some color) just so it can look better. Then asking for the corresponding pixel's color is going to return that new, not asked for, color.</p>

<p>I like this browser trick, so didn't want to prevent it. Instead I tried to improve my bucket fill tool around this: I initially tried an advanced custom subpixel color detection but this was becoming way too complicated, for gains I'm not sure is worth it for a tool as rough and crude as a bucket fill.<br>So in the end I opted for a practical and relatively efficient solution: the bucket fill sometimes go a little beyond the actual "target" color, to reach those subpixels. I found that it seemed relatively invisible that this was going on, besides some aliasing.</p>

<h3>The explorer app</h3>

<p>Before this project, I never realized all the interactions we expect from an explorer application: drag and drop, multiple selections (with a selection zone), allow to open files with the favorite associated application and allow to open executables, predictable arrow navigation, special control and shift keys meaning, extensive context menu and keyboard shortcuts (to delete, rename, cut, copy, move, add shortcuts etc.), auto-updating directory listing, information on file size, grid and list views, image previews etc.</p>

<p>Due to this writing that app was very overwhelming and the most demoralizing step by far - due to the amount of work I had in front of me from the beginning (I'm still not happy with it!).<br>Yet now that it's there (and with it the file picker) I think it totally changed the way this desktop can be approached: now files can be saved, opened and retrieved locally and it also brought the "quick save" notion: the ability to just do a quick ctrl+s or button click to save the current work.</p>

<p>The desktop is definitely much better with it and it's now a core part of it.</p>

<h3>The clock app</h3>

<p>The simple clock app, weirdly enough, gave me a lot of difficulties to write.</p>

<p>I absolutely wanted to have a clock as I wanted something to happen when someone click on the time inside the taskbar (doing nothing there would have been lame to me).<br>I originally had the simplest possible SVG of a white face with hours, minutes and seconds hands on top that I was periodically updating (scheduling through the requestAnimationFrame web API), but I always found that it was kind of ugly.</p>

<p>So I spent much more efforts compiling things left and right, asking both LLM to make something look good and searching the web for SVG resources and examples.</p>

<p>At one point I had something I considered perfect: the SVG was self-animating through an <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform" target="_blank">animateTransform</a> element.</p>

<p>To show off even more, I made the initial background of the "app" transparent with a CSS blur. That is admiteddly very easy to do in CSS but gives an impressive result, so it seemed to be a good thing to add.</p>

<p>However after doing all that, issues started showing:</p>
<ol>
  <li>The self-animated SVG was perfect, until the window wasn't displayed on screen (e.g. the app was "minimized"). There it seems that some browsers "paused" the SVG and, even after restoring it, it took a lot of time to fix itself in place.<br>I guess this is a browser optimization? I re-switched to JS-based animation once I saw this.</li>
  <li>My initial JS-based animation rework was done quickly, and re-defined the coordinates of the hour, minute and second hands at each iteration.<br>However doing that lead to some very small variations of e.g. the hands' length (due to floating-point arithmetics or SVG approximations?) that became visible if you focused on it enough.<br>As I found that original implementation unsteady anyway I reworked the logic so it relies on a rotation transform again.</li>
  <li>On some browsers, the combination of the window's blurred transparency of the clock's shadow and of other elements behind it seemed to lead to weird temporary visual glitches.<br>I chose here to be wise and just give the app a "normal" background, the clock is not the main attraction of this desktop after all!</li>
</ol>`;
    return anecdotesContainer;
  }

  function getResources() {
    const resourcesContainer = document.createElement("div");
    resourcesContainer.appendChild(createAppTitle("External Resources", {}));

    const resourcesText = document.createElement("div");
    resourcesContainer.appendChild(resourcesText);
    resourcesText.innerHTML = `<p>I had to find many images to write this project.<br>I chose to only include resources with a very permissive license: CC0 and public domain only.</p>

<p>Thus even if I'm not forced to, I want to thank <a href="https://unsplash.com" target="_blank">unsplash</a> for providing free-to-use pictures - that I used to get wallpapers, and especially thanks to the following unsplash contributors from which I sourced wallpaper images (because I liked those!):</p>
<ul>
  <li>Kalen Emsley (@kalenemsley on unsplash)</li>
  <li>Jack B (@nervum on unsplash)</li>
  <li>Irina Iriser (@iriser on unsplash)</li>
  <li>Lucas Dalamarta (@lucasdalamartaphoto on unsplash)</li>
  <li>Tim Schmidbauer (@timschmidbauer on unsplash)</li>
  <li>Ashim D'Silva (@randomlies on unsplash)</li>
  <li>Benjamin Voros (@vorosbenisop on unsplash)</li>
</ul>
<p>For icons, I mainly sourced it from  <a href="https://www.svgrepo.com/" target="_blank">svgrepo</a>, in particular its  <a href="https://www.svgrepo.com/collection/minimal-ui-icons/" target="_blank">Minimal UI Icon</a> collection. Thanks to the people involved in that set!</p>`;
    return resourcesContainer;
  }
}
