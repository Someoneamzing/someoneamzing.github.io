function html(strings, ...expressions){
  return strings.reduce((acc, str, i)=>`${acc}${str}${i >= expressions.length?"":expressions[i].toString()}`, "")
}
window.onProjectLoad = new Promise((resolve, reject) => {
  fetch('/projects.json').then((res)=>res.json()).then((projects)=>{
    window.ready.then(()=>{
      resolve(projects);
    })
  })
})
