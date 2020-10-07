window.onProjectLoad.then((projects)=>{
  const main = document.querySelector('main');
  for (let projectID in projects) {
    let project = projects[projectID];
    main.insertAdjacentHTML('beforeend', html`<section><h2>${project.name}</h2><p>${project.description}</p><a href="/post_view.html?post=${encodeURIComponent(projectID)}&page=0">Read More <i class="fas fa-angle-right"></i></a></section>`)
  }
}).catch((err)=>{
  window.ready.then(()=>{
    const main = document.querySelector('main');
    main.innerHTML = `<section class="error">There was an error while trying to load the projects. This shouldn't happen 😰</br><pre>Error: ${err.toString()}</pre></section>`
  })
})
