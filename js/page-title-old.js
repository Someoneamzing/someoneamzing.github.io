window.ready.then(()=>{
  const title = document.getElementById('page-title');
  const header = title.closest('header');
  const startFontSize = Number(title.computedStyleMap().get('font-size').value);
  const offsetHeight = title.getBoundingClientRect().bottom;
  const startingMarginTop = title.getBoundingClientRect().top;//title.computedStyleMap().get('margin-top').value;
  console.log(`startFontSize: ${startFontSize}`);
  console.log(`offsetHeight: ${offsetHeight}`);
  console.log(`startingMarginTop: ${startingMarginTop}`);
  const scrollHandler = (e)=>{
    let overlap = Math.max(0, Math.min(1, document.children[0].scrollTop / header.clientHeight));
    title.style.paddingTop = `${(1-overlap) * (startingMarginTop-25) + 25}px`;
    title.style.fontSize = `${(1- overlap) * (startFontSize - 24) + 24}px`
  }
  const observer = new IntersectionObserver( ([e]) => {
    let stuck = e.intersectionRatio < 1;
    console.log(e.intersectionRatio);
    if (stuck) {
      title.classList.add('stuck')
      header.style.paddingTop = offsetHeight + "px";
      document.addEventListener('scroll', scrollHandler, true)
    } else {
      title.classList.remove('stuck')
      header.style.paddingTop = 0;
      document.removeEventListener('scroll', scrollHandler)
    }
  },
    {threshold: [1]}
  );
  observer.observe(header)
})
