window.ready.then(()=>{
  const title = document.getElementById('page-title');
  const header = title.closest('header');
  const offsetHeight = title.getBoundingClientRect().bottom;
  const observer = new IntersectionObserver( ([e]) => {
    let stuck = e.intersectionRatio < 1;
    console.log(e.intersectionRatio);
    if (stuck) {
      header.style.paddingTop = offsetHeight + "px";
      header.classList.add('stuck')
    } else {
      header.style.paddingTop = 0;
      header.classList.remove('stuck')
    }
  },
    {threshold: [1]}
  );
  observer.observe(header)
})
