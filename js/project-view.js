window.onProjectLoad.then(async (projects)=>{
  const main = document.querySelector('main');
  const title = document.getElementById('page-title');
  const description = document.getElementById('page-description');
  let searchParams = new URLSearchParams(location.search.substring(1));
  let projectID = searchParams.get('post');
  let pageNo = parseInt(searchParams.get('page'));

  if (!projectID in projects) {
    main.innerHTML = `<div class="error"><pre>We couldn't find the requested post. If you came here from a link notify the author of the page that there is a broken link. If you typed in the url yourself, or came from a bookmark or other saved link, double check your spelling and if that still doesn't fix it the post may have been moved or deleted.</pre></div>`;
    return;
  }
  let project = projects[projectID];
  if (pageNo < 0 || pageNo > project.pages.length) {
    main.innerHTML = `<div class="error"><pre>The page couldn't be found under the current post. If you have tried to visit the next page in a post from one of the previous pages, raise an issue on github <a href="https://github.com/Someoneamzing/someoneamzing.github.io/issues">here</a>. Make sure to mention what project you were on and what page led here. Also copy the url from you browser's address bar and paste that in as well. We can use that to verify where the issue is coming from.</pre></div>`;
    return;
  }
  let page = project.pages[pageNo];
  console.log(`pageNo: ${pageNo}`);
  let nextURL = new URL(document.location);
  nextURL.searchParams.set('page', pageNo + 1);
  let prevURL = new URL(document.location);
  prevURL.searchParams.set('page', pageNo - 1);
  document.querySelectorAll('a.next-link').forEach((link)=>{
    let disabled = pageNo + 1 >= project.pages.length;
    link.classList.toggle('disabled',disabled);
    link.href = !disabled?nextURL:"";
  })
  document.querySelectorAll('a.prev-link').forEach((link)=>{
    let disabled = pageNo == 0;
    link.classList.toggle('disabled',disabled);
    link.href = !disabled?prevURL:"";
  })
  document.querySelectorAll('.page-no').forEach((num)=>{
    num.innerText = `Page ${pageNo + 1} / ${project.pages.length}`
  })
  title.innerText = `${project.name} - ${page.title}`;
  description.innerText = page.description;
  let pageResponse = await fetch(new URL(project.base_url + "/" + page.path, document.location.href))
  let pageContent = await pageResponse.text();

  main.innerHTML = pageContent.replace(/<% project\.([a-zA-Z][a-zA-Z0-9_\-]*?) %>/g, (match, property, offset, string, namedGroups)=>{
    return project.hasOwnProperty(property)?project[property]:`<!-- ERROR: No project property ${property} exists -->`;
  });
})
